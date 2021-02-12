import colors from 'colors/safe'

import { TaskChange } from './types'
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
import { buildCommitMessage } from './modules/text'
import { log } from './modules/Logger'
import { getConfig } from './config'
import { getDefaultBranch } from './modules/github'

const CONFIG = getConfig()
const { branchName, repos } = CONFIG
const TASKS = CONFIG.tasks.filter(([, options]) => options.enabled)

async function main() {
  if (CONFIG.dryRun) {
    log(`Running in dry-run mode. The script won't push and create PRs.`, {
      color: 'yellow',
    })
  } else if (!CONFIG.dryRun && CONFIG.githubToken == null) {
    log(
      'No Github token found. Make sure to define it in your "config.ts" file',
      {
        type: 'error',
        color: 'red',
      }
    )
    process.exit(1)
  }

  const repoURLs = repos.map(repo => `git@github.com:${repo}.git`)
  const pulls: string[] = []
  const errors: Array<{ repo: string; error: Error; message?: string }> = []

  for await (const repoURL of repoURLs) {
    const changes: TaskChange[] = []

    try {
      log(`Repo: ${repoURL}`)
      if (!(await hasRepoCloned(repoURL))) {
        log(`Cloning...`, { indent: 1 })
        shallowClone(repoURL)
      }

      enterRepo(repoURL)

      const { owner, name } = parseRepoUrl(repoURL)
      const defaultBranch = await getDefaultBranch({ owner, repo: name })

      if (!hasBranch(branchName)) {
        log(`Creating "${branchName}" branch`, { indent: 1 })
        createBranch(branchName)
      } else {
        log(`Updating the local repo and resetting "${branchName}" branch`, {
          indent: 1,
        })
        updateCurrentRepo(defaultBranch)
        resetBranch(defaultBranch, branchName)
        switchToBranch(branchName)
      }

      for await (const [taskModule] of TASKS) {
        const { name: taskName, task } = taskModule
        log(`Running task "${colors.cyan(taskName)}"`, { indent: 1 })

        const taskResult = await task({ defaultBranch, owner, repo: name })
        if (taskResult == null) continue

        changes.push(...taskResult.changes)

        if (taskResult.changes.some(c => c.changelog === true)) {
          await updateCurrentChangelog(taskResult.changes)
        }

        const commitMessage = buildCommitMessage(
          taskResult.changes.map(c => c.message)
        )

        if (commitMessage.length === 0) {
          throw new Error('Empty commit message')
        }

        log(`Commiting "${colors.cyan(commitMessage)}"`, { indent: 2 })
        createCommit(commitMessage)
      }

      if (changes.length === 0) {
        log(`No changes made. Skipping push.`, {
          indent: 1,
          color: 'yellow',
        })
        continue
      }

      if (!CONFIG.dryRun) {
        log(`Pushing to remote "${branchName}" branch and creating PR`, {
          indent: 1,
        })
        pushChanges(branchName, true)
        const {
          data: { number },
        } = await createPullRequest({ defaultBranch, owner, name, changes })
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
        log('Deleting local directory', { indent: 1 })
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
