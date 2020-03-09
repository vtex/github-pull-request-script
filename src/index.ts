import colors from 'colors/safe'

import {
  shallowClone,
  hasRepoCloned,
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
import { getConfig, getRepoList } from './config'
import { log } from './modules/Logger'

const CONFIG = getConfig()
const TASKS = Object.entries(CONFIG.tasks)
const { branchName } = CONFIG

async function main() {
  if (CONFIG.dryRun) {
    log(`Running in dry-run mode. The script won't push and create PRs.`, {
      color: 'yellow',
    })
  }

  const repoURLs = (await getRepoList()).map(
    repo => `git@github.com:${repo}.git`
  )
  const pulls: string[] = []
  const errors: Array<{ repo: string; error: Error; message?: string }> = []

  for await (const repoURL of repoURLs) {
    let changes = 0

    try {
      log(`Repo: ${repoURL}`)
      if (!(await hasRepoCloned(repoURL))) {
        log(`Cloning...`, { indent: 1 })
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

        changes += 1

        if (taskResult.changeLog) {
          await updateCurrentChangelog(taskResult.changeLog)
        }
        log(`Commiting "${colors.cyan(taskResult.commitMessage)}"`, {
          indent: 2,
        })
        createCommit(taskResult.commitMessage)
      }

      if (changes === 0) {
        log(`No changes made. Skipping pushing.`, {
          indent: 1,
          color: 'yellow',
        })
        continue
      }

      if (!CONFIG.dryRun) {
        log(`Pushing to remote "${branchName}" branch and creating PR`, {
          indent: 1,
        })
        await pushChanges(branchName, true)
        const {
          data: { number },
        } = await createPullRequest(repoURL)
        const { fullName } = parseRepoUrl(repoURL)
        pulls.push(`https://github.com/${fullName}/pull/${number}`)
      }
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

  if (pulls.length) {
    log('\nCreated pull requests:')
    pulls.forEach(url => {
      log(`- ${colors.blue(url)}`, {
        indent: 1,
        type: 'log',
      })
    })
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
