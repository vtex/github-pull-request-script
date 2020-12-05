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

  let index = 0
  for await (const repoURL of repoURLs) {

    try {
      log(`Repo: ${repoURL}`)
      if (!(await hasRepoCloned(repoURL))) {
        log(`Cloning... ${index}/${repoURLs.length}`, { indent: 1 })
        shallowClone(repoURL)
      }
    } catch (e) {
      log(`Some error occured.`, { indent: 1, color: 'red' })

      errors.push({ repo: repoURL, error: e })
    } finally {
      log('\n')
    }
    index++
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
