import { relative } from 'path'

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
} from './dist/modules/repo'
import taskConfig from './tasks.config'
import repos from './repos.json'

const ROOT_DIT = process.cwd()
const BRANCH_NAME = 'chore/community-chores'

async function main() {
  const tasks = Object.values(taskConfig.tasks)
  const repoURLs = repos.map(repo => `git@github.com:${repo}.git`)
  const errors = []

  for await (const repoURL of repoURLs) {
    try {
      console.log(`- Repo: ${repoURL}`)
      if (!(await hasRepoCloned(repoURL))) {
        console.log(
          `  - Cloning "${repoURL}" into "${relative(
            ROOT_DIT,
            getRepoTmpDir(repoURL)
          )}"`
        )
        shallowClone(repoURL)
      }
      console.log(`  - Entering directory`)

      enterRepo(repoURL)

      if (!hasBranch(BRANCH_NAME)) {
        console.log(`  - Creating "${BRANCH_NAME}" branch`)
        createBranch(BRANCH_NAME)
      } else {
        console.log(
          `  - Updating the local repo and resetting "${BRANCH_NAME}" branch`
        )
        updateCurrentRepo()
        resetBranch(BRANCH_NAME)
        switchToBranch(BRANCH_NAME)
      }

      for await (const task of tasks) {
        const taskResult = await task()
        if (taskResult == null) continue

        createCommit(taskResult.commitMessage)
        await updateCurrentChangelog(taskResult.changeLog)
      }
    } catch (e) {
      console.log(`  - Some error occured.`)
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
      console.log(`  - Exiting and deleting directory`)
      exitRepo()
      // deleteRepo(repo)

      console.log('\n')
    }
  }

  // eslint-disable-next-line vtex/prefer-early-return
  if (errors.length) {
    console.log('\nErrors:\n')
    errors.forEach(({ repo, message, error }) => {
      console.error(`[${parseRepoUrl(repo).fullName}] ${message || error}`)
    })
  }
}

main()
