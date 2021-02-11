import { TaskFunction } from '../types'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'

const DANGER_JOB = parseJSONAsset('templates', 'ACTIONS', 'jobs', 'danger.json')

const task: TaskFunction = async ({ defaultBranch }) => {
  const commitMessages: string[] = []
  let updatedDanger = false

  Action.ensureActionDir()

  if (!Action.hasAction()) {
    Action.createBaseAction(defaultBranch)
    commitMessages.push('Add github pr action')
    updatedDanger = true
  }

  if (!Action.hasJob('danger-ci')) {
    Action.addJob('danger-ci', DANGER_JOB)
    commitMessages.push('Add danger job')
    updatedDanger = true
  }

  if (!updatedDanger) {
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
  name: 'Danger',
  task,
}
