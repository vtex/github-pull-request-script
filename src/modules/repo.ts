import { resolve } from 'path'

import fs from 'fs-extra'

import { TaskChange } from '../types'
import { ROOT_DIR, resolveTmpDir, getPullRequestTemplate } from '../config'
import { updateChangelog } from './changelog'
import { createPR } from './github'
import { runCmd } from './shell'
import { uncapitalize } from './text'

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
  return resolveTmpDir(getTmpRepoName(repoUrl) ?? repoUrl)
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

export function updateCurrentRepo() {
  runCmd(`git fetch origin master --depth 1`)
}

export function resetBranch(branchName: string) {
  runCmd(`git checkout ${branchName}`)
  runCmd(`git reset --hard origin/master`)
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

export async function createPullRequest(
  repoUrl: string,
  changes: TaskChange[]
) {
  const { owner, name } = parseRepoUrl(repoUrl)
  const { title, body } = await getPullRequestTemplate()

  return createPR({
    owner,
    repo: name,
    head: getCurrentBranch(),
    base: 'master',
    title,
    body: body.replace(
      '%task_list%',
      changes.map(change => `- ${change.message}`).join('\n')
    ),
  })
}

export function buildCommitMessage(parts: string[]) {
  // uncapitalize every part but the first one
  parts = parts.map((p, i) => (i === 0 ? p : uncapitalize(p)))

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`

  let index = 0
  let output = ''
  while (index < parts.length - 1) {
    output += `${parts[index]}, `
    index++
  }

  output += `and ${parts[parts.length - 1]}`
  return output
}
