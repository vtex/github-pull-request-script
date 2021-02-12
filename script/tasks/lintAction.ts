import { TaskFunction } from '../types'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'

const LINT_JOB = parseJSONAsset('templates', 'ACTIONS', 'jobs', 'lint.json')

const task: TaskFunction = async ({ defaultBranch }) => {
  const commitMessages: string[] = []
  let updated = false

  Action.ensureActionDir()

  if (!Action.hasAction()) {
    Action.createBaseAction(defaultBranch)
    commitMessages.push('Add github pr action')
    updated = true
  }

  if (!Action.hasJob('lint')) {
    Action.addJob('lint', LINT_JOB)
    commitMessages.push('Add lint action job')
    updated = true
  }

  if (!updated) {
    return
  }

  return {
    changes: commitMessages.map(msg => ({
      type: 'changed',
      message: msg,
      changelog: false,
    })),
  }
}

export default {
  name: 'Lint action',
  task,
}
