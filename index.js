import { relative } from 'path'

import {
  shallowClone,
  hasRepoCloned,
  getRepoTmpDir,
  enterRepo,
  exitRepo,
  hasBranch,
  deleteRepo,
  createBranch,
  updateCurrentRepo,
  switchToBranch,
  resetBranch,
} from './dist/modules/git'

const repos = [
  'vtex/github-pull-request-script',
  'vtex-apps/order-placed',
  'vtex-apps/store',
  'vtex-apps/store-image',
  'vtex-apps/order-payment',
  'vtex-apps/product-price',
].map(repo => `git@github.com:${repo}.git`)

const ROOT_DIT = process.cwd()
const BRANCH_NAME = 'chore/community-chores'

async function main() {
  for await (const repo of repos) {
    try {
      console.log(`- Repo: ${repo}`)
      if (!hasRepoCloned(repo)) {
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

      console.log(`  - Exiting and deleting directory`)
      exitRepo()
      deleteRepo(repo)

      console.log('\n')
    } catch (e) {
      console.log(e.code)
    }
  }
}

main()
