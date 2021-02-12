import { resolve } from 'path'

import fs from 'fs-extra'

import { TaskChange } from '../types'
import { ROOT_DIR, resolveTmp, getPullRequestTemplate } from '../config'
import { updateChangelog } from './changelog'
import { createPR, listPRs, updatePR, getDefaultBranch } from './github'
import { runCmd } from './shell'
import { log } from './Logger'

const REPO_NAME_PATTERN = /:(.*?)\/(.*?)(?:\.git)?$/i

export function enterRepo(repoUrl: string) {
  process.chdir(getRepoTmpDir(repoUrl))
}

export function exitRepo() {
  process.chdir(ROOT_DIR)
}

export function resolvePathCurrentRepo(...paths: string[]) {
  return resolve(process.cwd(), ...paths)
}

export function parseRepoUrl(repoUrl: string) {
  const match = repoUrl.match(REPO_NAME_PATTERN)

  if (!match) {
    return { owner: null, name: null, fullName: null }
  }

  return {
    owner: match[1],
    name: match[2],
    fullName: `${match[1]}/${match[2]}`,
  }
}

export async function hasRepoCloned(repoUrl: string) {
  return fs.pathExists(getRepoTmpDir(repoUrl))
}

export function getTmpRepoName(repoUrl: string) {
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) return null
  return `${parsed.owner}_${parsed.name}`
}

export function getRepoTmpDir(repoUrl: string) {
  return resolveTmp(getTmpRepoName(repoUrl) ?? repoUrl)
}

export function deleteRepo(repoUrl) {
  fs.removeSync(getRepoTmpDir(repoUrl))
}

export function shallowClone(repoUrl: string) {
  if (process.cwd() !== ROOT_DIR) {
    throw new Error(
      'shallowClone must be callend only when the current working directory is the root of the project.'
    )
  }

  runCmd(`git clone --depth 1 ${repoUrl} ${getRepoTmpDir(repoUrl)}`)
}

export function getCurrentBranch() {
  return runCmd(`git rev-parse --abbrev-ref HEAD`)
}

export function hasBranch(branchName: string) {
  try {
    runCmd(`git rev-parse --verify --quiet ${branchName}`)
    return true
  } catch {
    return false
  }
}

export function updateCurrentRepo(defaultBranch: string) {
  runCmd(`git fetch origin ${defaultBranch} --depth 1`)
}

export function resetBranch(defaultBranch: string, branchName: string) {
  runCmd(`git checkout ${branchName}`)
  runCmd(`git reset --hard origin/${defaultBranch}`)
  runCmd(`git clean -fdx`)
}

export function switchToBranch(branchName: string) {
  runCmd(`git checkout ${branchName}`)
}

export function createBranch(branchName) {
  runCmd(`git checkout -b ${branchName}`)
}

export function createCommit(commitMessage) {
  runCmd('git add --all')
  runCmd(`git commit -m "${commitMessage}"`)
}

export function deleteRemoteBranch(branchName) {
  runCmd(`git push origin :${branchName}`)
}

export function pushChanges(branchName, force = false) {
  runCmd(`git push origin ${branchName} ${force ? '-f' : ''}`)
}

export function getCurrentRepoURL() {
  return runCmd('git config --get remote.origin.url')
}

export function getCurrentChangelogPath() {
  return resolvePathCurrentRepo('CHANGELOG.md')
}

export async function updateCurrentChangelog(changes: TaskChange[]) {
  const path = getCurrentChangelogPath()
  const content = await fs.readFile(path, { encoding: 'utf-8' }).catch(() => '')
  const updatedContent = updateChangelog(
    content,
    changes
      .filter(c => c.changelog)
      .map(c => ({
        action: c.type,
        value: c.message,
      }))
  )

  return fs.writeFile(path, updatedContent)
}

export async function createPullRequest({
  defaultBranch,
  owner,
  name,
  changes,
}: {
  defaultBranch: string
  owner: string | null
  name: string | null
  changes: TaskChange[]
}) {
  const { title, body } = await getPullRequestTemplate()
  const params = {
    owner,
    repo: name,
    head: getCurrentBranch(),
    base: defaultBranch,
    title,
    body: body
      .replace(
        '%task_list%',
        changes.map(change => `- ${change.message}`).join('\n')
      )
      .replace(
        '%trivial%',
        changes.some(c => c.changelog) ? '' : '**#trivial**'
      )
      .trim(),
  }

  return createPR(params).catch(async error => {
    const isAlreadyExistingError = error?.errors?.find(e =>
      e.message.includes('A pull request already exists for')
    )

    if (!isAlreadyExistingError) throw error

    log('PR already exists. Updating it.', {
      indent: 2,
      type: 'warn',
      color: 'yellow',
    })

    const pullResponse = await listPRs({
      owner: params.owner,
      repo: params.repo,
      head: `${params.owner}:${params.head}`,
    })

    const currentPull = pullResponse?.data?.[0]

    if (!currentPull) throw error

    return updatePR({
      ...params,
      pull_number: currentPull.number,
    })
  })
}
