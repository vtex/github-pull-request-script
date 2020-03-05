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
  pushChanges,
  createPullRequest,
  deleteRemoteBranch,
} from './dist/modules/repo'
import { getConfig } from './dist/config'

const ROOT_DIT = process.cwd()
const CONFIG = getConfig()
const TASKS = Object.values(CONFIG.tasks)
const { branchName } = CONFIG

async function main() {
  const repoURLs = CONFIG.repos.map(repo => `git@github.com:${repo}.git`)
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

      if (!hasBranch(branchName)) {
        console.log(`  - Creating "${branchName}" branch`)
        createBranch(branchName)
      } else {
        console.log(
          `  - Updating the local repo and resetting "${branchName}" branch`
        )
        updateCurrentRepo()
        resetBranch(branchName)
        switchToBranch(branchName)
      }

      for await (const task of TASKS) {
        const taskResult = await task()
        if (taskResult == null) continue

        createCommit(taskResult.commitMessage)
        await updateCurrentChangelog(taskResult.changeLog)
      }

      console.log(`  - Pushing to remote "${branchName}" branch`)
      await pushChanges(branchName, true)
      await createPullRequest(repoURL)
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
      console.error(error)
      // console.error(`[${parseRepoUrl(repo).fullName}] ${message || error}`)
    })
  }
}

main()
