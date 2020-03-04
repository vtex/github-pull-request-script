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
  getRepoNameFromUrl,
} from './dist/modules/repo'
import taskCodeOwners from './dist/tasks/codeowners'

const TASKS = [taskCodeOwners]

const repos = [
  'vtex-apps/store-theme',
  // 'vtex-apps/store-components',
  // 'vtex-apps/store',
  // 'vtex-apps/shelf',
  // 'vtex-apps/login',
  // 'vtex-apps/product-summary',
  // 'vtex-apps/product-details',
  // 'vtex-apps/sandbox',
  // 'vtex-apps/search-result',
  // 'vtex-apps/menu',
  // 'vtex-apps/product-kit',
  // 'vtex-apps/order-placed',
  // 'vtex-apps/store-header',
  // 'vtex-apps/minicart',
  // 'vtex-apps/category-menu',
  // 'vtex-apps/checkout-coupon',
  // 'vtex-apps/checkout-summary',
  // 'vtex-apps/store-footer',
  // 'vtex-apps/pickup-availability',
  // 'vtex-apps/shop-review-interfaces',
  // 'vtex-apps/store-form',
  // 'vtex-apps/stack-layout',
  // 'vtex-apps/challenge-tp-condition',
  // 'vtex-apps/store-icons',
  // 'vtex-apps/carousel',
  // 'vtex-apps/checkout-cart',
  // 'vtex-apps/shipping-calculator',
  // 'vtex-apps/product-list',
  // 'vtex-apps/product-review-interfaces',
  // 'vtex-apps/order-payment',
  // 'vtex-apps/product-teaser-interfaces',
  // 'vtex-apps/product-specification-badges',
  // 'vtex-apps/responsive-layout',
  // 'vtex-apps/experimental__visibility-layout',
  // 'vtex-apps/pixel-interfaces',
  // 'vtex-apps/product-summary-context',
  // 'vtex-apps/responsive-values',
  // 'vtex-apps/product-context',
  // 'vtex-apps/powerreviews',
  // 'vtex-apps/recommendation-shelf',
  // 'vtex-apps/flex-layout',
  // 'vtex-apps/product-bookmark-interfaces',
  // 'vtex-apps/rebuy',
  // 'vtex-apps/add-to-cart-button',
  // 'vtex-apps/modal-layout',
  // 'vtex-apps/product-customizer',
  // 'vtex-apps/structured-data',
  // 'vtex-apps/sticky-layout',
  // 'vtex-apps/order-items',
  // 'vtex-apps/popover-layout',
  // 'vtex-apps/product-price',
  // 'vtex-apps/product-list-context',
  // 'vtex-apps/telemarketing',
  // 'vtex-apps/blog-interfaces',
  // 'vtex-apps/open-graph',
  // 'vtex-apps/drawer',
  // 'vtex-apps/modal',
  // 'vtex-apps/store-link',
  // 'vtex-apps/locale-switcher',
  // 'vtex-apps/store-image',
  // 'vtex-apps/sticky-layout',
  // 'vtex-apps/open-graph',
  // 'vtex-apps/drawer',
  // 'vtex-apps/my-account',
  // 'vtex-apps/wordpress-integration',
  // 'vtex-apps/product-quantity',
  // 'vtex-apps/iframe',
  // 'vtex-apps/shopper-approved',
  // 'vtex-apps/list-context',
  // 'vtex-apps/tab-layout',
  // 'vtex-apps/list-context',
  // 'vtex-apps/tab-layout',
  // 'vtex-apps/reviews-and-ratings',
  // 'vtex-apps/breadcrumb',
  // 'vtex-apps/product-identifier',
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
        if (taskResult == null) continue

        createCommit(taskResult.commitMessage)
        await updateCurrentChangelog(taskResult.changeLog)
      }
    } catch (e) {
      console.log(`  - Some error occured.`)
      if (e.stack.includes('changelog.js')) {
        errors.push({
          repo,
          message: `There's some invalid entry in the CHANGELOG.md of the "${repo}" repository.`,
          error: e,
        })
      } else {
        errors.push({ repo, error: e })
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
    errors.forEach(({ repo, message, error }) =>
      console.error(`[${getRepoNameFromUrl(repo)}] ${message || error}`)
    )
  }
}

main()
