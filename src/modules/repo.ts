import { execSync } from 'child_process'
import { resolve } from 'path'

import rimraf from 'rimraf'

import { ChangelogChange } from '../types'
import { ROOT_DIR, resolveTmpDir } from '../config'
import { fileExists, writeFileContent, getFileContent } from './fs'
import { updateChangelog } from './changelog'

const REPO_NAME_PATTERN = /:(.*?)(?:\.git)?$/i

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

export function getCurrentBranch() {
  return String(execSync(`git rev-parse --abbrev-ref HEAD`))
}

export function getRepoTmpDir(repoUrl: string) {
  return resolveTmpDir(getRepoNameFromUrl(repoUrl) ?? repoUrl)
}

export function getRepoNameFromUrl(repoUrl: string) {
  const match = repoUrl.match(REPO_NAME_PATTERN)
  if (!match) return null
  return match[1].replace(/\//g, '_')
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
  execSync(`git checkout master`, { stdio: 'ignore' })
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
  execSync(`git checkout -b ${branchName}`, {
    stdio: 'ignore',
  })
}

export function createCommit(commitMessage) {
  execSync('git add --all')
  execSync(`git commit -m "${commitMessage}"`)
}

export function pushChanges(branchName) {
  execSync(`git push origin ${branchName}`)
}

export function getCurrentChangelogPath() {
  return resolve(process.cwd(), 'CHANGELOG.md')
}

export async function updateCurrentChangelog(changes: ChangelogChange) {
  const path = getCurrentChangelogPath()
  const content = (await getFileContent(path)) ?? ''
  const updatedContent = updateChangelog(content, [changes])

  return writeFileContent(path, updatedContent)
}
