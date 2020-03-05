import { execSync } from 'child_process'
import { resolve } from 'path'

import rimraf from 'rimraf'

import { ChangelogChange } from '../types'
import { ROOT_DIR, resolveTmpDir, getPullRequestTemplate } from '../config'
import { fileExists, writeFileContent, readFileContent } from './fs'
import { updateChangelog } from './changelog'
import { createPR } from './octokit'

const REPO_NAME_PATTERN = /:(.*?)\/(.*?)(?:\.git)?$/i

let pullRequestTemplate

export function shallowClone(repoUrl: string) {
  if (process.cwd() !== ROOT_DIR) {
    throw new Error(
      'shallowClone must be callend only when the current working directory is the root of the project.'
    )
  }

  execSync(`git clone --depth 1 ${repoUrl} ${getRepoTmpDir(repoUrl)}`, {
    stdio: 'ignore',
  })
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

export function getCurrentBranch() {
  return String(execSync(`git rev-parse --abbrev-ref HEAD`)).trim()
}

export function getTmpRepoName(repoUrl: string) {
  const parsed = parseRepoUrl(repoUrl)
  if (!parsed) return null
  return `${parsed.owner}_${parsed.name}`
}

export function getRepoTmpDir(repoUrl: string) {
  return resolveTmpDir(getTmpRepoName(repoUrl) ?? repoUrl)
}

export async function hasRepoCloned(repoUrl: string) {
  return fileExists(getRepoTmpDir(repoUrl))
}

export function enterRepo(repoUrl: string) {
  process.chdir(getRepoTmpDir(repoUrl))
}

export function exitRepo() {
  process.chdir(ROOT_DIR)
}

export function deleteRepo(repoUrl) {
  rimraf.sync(getRepoTmpDir(repoUrl))
}

export function hasBranch(branchName: string) {
  try {
    execSync(`git rev-parse --verify --quiet ${branchName}`, {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

export function updateCurrentRepo() {
  execSync(`git fetch origin master --depth 1`, { stdio: 'ignore' })
}

export function resolvePathCurrentRepo(...paths: string[]) {
  return resolve(process.cwd(), ...paths)
}

export function resetBranch(branchName: string) {
  execSync(`git checkout ${branchName}`, { stdio: 'ignore' })
  execSync(`git reset --hard origin/master`, { stdio: 'ignore' })
}

export function switchToBranch(branchName: string) {
  execSync(`git checkout ${branchName}`, { stdio: 'ignore' })
}

export function createBranch(branchName) {
  execSync(`git checkout -b ${branchName}`, { stdio: 'ignore' })
}

export function createCommit(commitMessage) {
  execSync('git add --all', { stdio: 'ignore' })
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' })
}

export function deleteRemoteBranch(branchName) {
  execSync(`git push origin :${branchName}`, { stdio: 'ignore' })
}

export function pushChanges(branchName, force = false) {
  execSync(`git push origin ${branchName} ${force ? '-f' : ''}`, {
    stdio: 'ignore',
  })
}

export function getCurrentChangelogPath() {
  return resolve(process.cwd(), 'CHANGELOG.md')
}

export function getCurrentRepoURL() {
  return String(execSync('git config --get remote.origin.url')).trim()
}

export async function updateCurrentChangelog(changes: ChangelogChange) {
  const path = getCurrentChangelogPath()
  const content = (await readFileContent(path)) ?? ''
  const updatedContent = updateChangelog(content, [changes])

  return writeFileContent(path, updatedContent)
}

export async function createPullRequest(repoUrl: string) {
  const { owner, name } = parseRepoUrl(repoUrl)
  const { title, body } = await getPullRequestTemplate()

  console.log({
    owner,
    repo: name,
    head: getCurrentBranch(),
    base: 'master',
    title,
    body,
  })

  return createPR({
    owner,
    repo: name,
    head: getCurrentBranch(),
    base: 'master',
    title,
    body,
  })
}
