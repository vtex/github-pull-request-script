import { relative } from 'path'

import colors from 'colors/safe'

import {
  shallowClone,
  hasRepoCloned,
  getRepoTmpDir,
  enterRepo,
  exitRepo,
  hasBranch,
  createBranch,
  updateCurrentRepo,
  switchToBranch,
  updateCurrentChangelog,
  resetBranch,
  createCommit,
  parseRepoUrl,
  pushChanges,
  createPullRequest,
  deleteRepo,
} from './modules/repo'
import { getConfig } from './config'
import { log } from './modules/Logger'

const ROOT_DIT = process.cwd()
const CONFIG = getConfig()
const TASKS = Object.entries(CONFIG.tasks)
const { branchName } = CONFIG

async function main() {
  const repoURLs = CONFIG.repos.map(repo => `git@github.com:${repo}.git`)
  const errors: Array<{ repo: string; error: Error; message?: string }> = []

  for await (const repoURL of repoURLs) {
    try {
      log(`Repo: ${repoURL}`)
      if (!(await hasRepoCloned(repoURL))) {
        log(`Cloning into "${relative(ROOT_DIT, getRepoTmpDir(repoURL))}"`, {
          indent: 1,
        })
        shallowClone(repoURL)
      }

      enterRepo(repoURL)

      if (!hasBranch(branchName)) {
        log(`Creating "${branchName}" branch`, { indent: 1 })
        createBranch(branchName)
      } else {
        log(`Updating the local repo and resetting "${branchName}" branch`, {
          indent: 1,
        })
        updateCurrentRepo()
        resetBranch(branchName)
        switchToBranch(branchName)
      }

      for await (const [taskName, task] of TASKS) {
        log(`Running task "${colors.cyan(taskName)}"`, { indent: 1 })

        const taskResult = await task()
        if (taskResult == null) continue

        await updateCurrentChangelog(taskResult.changeLog)
        log(`Commiting "${colors.cyan(taskResult.commitMessage)}"`, {
          indent: 2,
        })
        createCommit(taskResult.commitMessage)
      }

      log(`Pushing to remote "${branchName}" branch`, { indent: 1 })
      // await pushChanges(branchName, true)
      // await createPullRequest(repoURL)
    } catch (e) {
      log(`Some error occured.`, { indent: 1, color: 'red' })

      if (e.stack.includes('changelog.js')) {
        errors.push({
          repo: repoURL,
          message: `There's some invalid entry in the CHANGELOG.md of the "${repoURL}" repository.`,
          error: e,
        })
      } else {
        errors.push({ repo: repoURL, error: e })
      }
    } finally {
      exitRepo()
      if (CONFIG.deleteAfter) {
        deleteRepo(repoURL)
      }

      log('\n')
    }
  }

  // eslint-disable-next-line vtex/prefer-early-return
  if (errors.length) {
    log('\nErrors:\n')
    errors.forEach(({ repo, message, error }) => {
      log(
        `[${parseRepoUrl(repo).fullName}] ${colors.red(
          String(message ?? error)
        )}`,
        {
          indent: 1,
          type: 'error',
        }
      )
    })
  }
}

main()
