import { execSync } from 'child_process'

import rimraf from 'rimraf'

import { ROOT_DIR, resolveTmpDir } from '../config'
import { fileExists } from './fileExists'

const REPO_NAME_PATTERN = /:(.*?)(?:\.git)?$/i

export function getRepoTmpDir(repoUrl: string) {
  return resolveTmpDir(getRepoNameFromUrl(repoUrl) ?? repoUrl)
}

export function getRepoNameFromUrl(repoUrl: string) {
  const match = repoUrl.match(REPO_NAME_PATTERN)
  if (!match) return null
  return match[1].replace(/\//g, '_')
}

export function hasRepoCloned(repoUrl: string) {
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

export function getCurrentBranch() {
  return String(execSync(`git rev-parse --abbrev-ref HEAD`))
}

export function updateCurrentRepo() {
  execSync(`git checkout master`, { stdio: 'ignore' })
  execSync(`git fetch origin master --depth 1`, { stdio: 'ignore' })
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
