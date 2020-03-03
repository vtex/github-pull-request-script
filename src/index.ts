import 'dotenv/config'

import { execSync } from 'child_process'

import { octokit } from './modules/octokit'

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
    throw new Error('Tasks should be a function')
  }

  let branchCreated = false

  for await (const task of tasks) {
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
