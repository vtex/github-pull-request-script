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
} from './dist/modules/repo'
import taskCodeOwners from './dist/tasks/codeowners'

const TASKS = [taskCodeOwners]

const repos = [
  // 'vtex/github-pull-request-script',
  // 'vtex-apps/order-placed',
  'vtex-apps/store',
  // 'vtex-apps/store-image',
  // 'vtex-apps/order-payment',
  // 'vtex-apps/product-price',
].map(repo => `git@github.com:${repo}.git`)

const ROOT_DIT = process.cwd()
const BRANCH_NAME = 'chore/community-chores'

async function main() {
  const errors = []

  for await (const repo of repos) {
    try {
      console.log(`- Repo: ${repo}`)
      if (!(await hasRepoCloned(repo))) {
        console.log(
          `  - Cloning "${repo}" into "${relative(
            ROOT_DIT,
            getRepoTmpDir(repo)
          )}"`
        )
        shallowClone(repo)
      }
      console.log(`  - Entering directory`)

      enterRepo(repo)

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

      for await (const task of TASKS) {
        const taskResult = await task()
        if (!taskResult) continue

        createCommit(taskResult.commitMessage)
        await updateCurrentChangelog(taskResult.changeLog)
      }

      console.log(`  - Exiting and deleting directory`)
      exitRepo()
      // deleteRepo(repo)

      console.log('\n')
    } catch (e) {
      if (e.message.includes("Cannot set property 'changes' of undefined")) {
        errors.push(
          `There's some invalid entry in the CHANGELOG.md of the "${repo}" repository.`
        )
      }
    }
  }

  // eslint-disable-next-line vtex/prefer-early-return
  if (errors.length) {
    console.log('\nErrors:\n')
    errors.forEach(error => console.log(error))
  }
}

main()
