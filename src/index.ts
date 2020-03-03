import { Octokit } from '@octokit/rest'
import { retry } from '@octokit/plugin-retry'
import { throttling } from '@octokit/plugin-throttling'
import { execSync } from 'child_process'

const TOKEN = process.env.TOKEN
const USER_AGENT = process.env.USER_AGENT

const MyOctokit = Octokit.plugin([retry, throttling])

const octokit = new MyOctokit({
  auth: TOKEN,
  userAgent: USER_AGENT,
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
    },
    onAbuseLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`
      )
    },
  },
})

type ChangeLogType =
  | 'Added'
  | 'Changed'
  | 'Deprecated'
  | 'Removed'
  | 'Fixed'
  | 'Security'

interface TaskSuccess {
  commitMessage: string
  changeLog: {
    type: ChangeLogType
    entry: string
  }
}

type TaskFunction = () => Promise<TaskSuccess | undefined>

interface Params {
  branchName: string
  tasks: TaskFunction[]
}

export async function run({ branchName, tasks }: Params) {
  if (!tasks) {
    throw new Error('Missing required parameter `tasks`')
  }
  if (!Array.isArray(tasks)) {
    throw new Error('Tasks should be an array')
  }
  if (!tasks.every(task => typeof task === 'function')) {
    throw new Error('Tasks should be a function that returns a Promise')
  }

  let branchCreated = false

  for (const task of tasks) {
    const result = await task()

    if (!result) {
      continue
    }

    if (!branchCreated) {
      createBranch(branchName)
      branchCreated = true
    }

    // TODO: change changelog

    createCommit(result.commitMessage)
  }

  return
}

function createBranch(branchName) {
  execSync(`git checkout -b ${branchName}`)
}

function createCommit(commitMessage) {
  execSync('git add --all')
  execSync(`git commit -m "${commitMessage}"`)
}

function pushChanges(branchName) {
  execSync(`git push origin ${branchName}`)
}

function createPR({ owner, repo, title, head, base }) {
  octokit.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
  })
}
