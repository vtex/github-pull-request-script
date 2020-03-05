import './config'
import {
  hasBranch,
  resetBranch,
  createBranch,
  createCommit,
} from './modules/repo'
import { TaskFunction } from './types'

interface Params {
  repo: string
  branchName: string
  tasks: TaskFunction[]
}

function assertParams(params: Params) {
  for (const param of ['repo', 'branchName', 'tasks']) {
    if (!params[param]) {
      throw new Error(`Missing required parameter \`${param}\``)
    }
  }

  if (!Array.isArray(params.tasks)) {
    throw new Error('Tasks should be an array')
  }

  if (params.tasks.some(task => typeof task !== 'function')) {
    throw new Error('Tasks should be a function')
  }
}

export async function run(params: Params) {
  assertParams(params)

  const { repo, branchName, tasks } = params

  if (hasBranch(branchName)) {
    resetBranch(branchName)
  } else {
    createBranch(branchName)
  }

  for await (const task of tasks) {
    const result = await task()

    if (!result) {
      continue
    }

    // TODO: change changelog

    createCommit(result.commitMessage)
  }
}
