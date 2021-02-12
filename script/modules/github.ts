import { Octokit } from '@octokit/rest'
import { retry } from '@octokit/plugin-retry'
import { throttling } from '@octokit/plugin-throttling'

import { getConfig } from '../config'

const MyOctokit = Octokit.plugin([retry, throttling])

export const octokit = new MyOctokit({
  auth: getConfig().githubToken,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )

      if (options.request.retryCount === 0) {
        // only retries once
        console.log(`Retrying after ${retryAfter} seconds!`)
        return true
      }

      return false
    },
    onAbuseLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`
      )
    },
  },
})

export function createPR(params) {
  return octokit.pulls.create(params)
}

export function listPRs(params) {
  return octokit.pulls.list(params)
}

export function updatePR(params) {
  return octokit.pulls.update(params)
}

export function getDefaultBranch(params) {
  return octokit.repos.get(params).then(({ data }) => data.default_branch)
}
