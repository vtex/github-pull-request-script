import { TaskFunction } from '../types'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'

const TEST_JOB = parseJSONAsset('templates', 'ACTIONS', 'jobs', 'tests.json')

const task: TaskFunction = async () => {
  const commitMessages: string[] = []
  let updated = false

  Action.ensureActionDir()

  if (!Action.hasAction()) {
    Action.createBaseAction()
    commitMessages.push('Add github pr action')
    updated = true
  }

  if (!Action.hasJob('io-app-test')) {
    Action.addJob('io-app-test', TEST_JOB)
    commitMessages.push('Add test action job')
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
  name: 'IO app tests',
  task,
}
