import { TaskFunction } from '../types'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'
import { getAppManifest } from '../modules/io'

const IO_TEST_JOB = parseJSONAsset(
  'templates',
  'ACTIONS',
  'jobs',
  'io-tests.json'
)
const GENERIC_TEST_JOB = parseJSONAsset(
  'templates',
  'ACTIONS',
  'jobs',
  'generic-test.json'
)

const task: TaskFunction = async ({ defaultBranch }) => {
  const commitMessages: string[] = []
  let updated = false

  Action.ensureActionDir()

  if (!Action.hasAction()) {
    Action.createBaseAction(defaultBranch)
    commitMessages.push('Add github pr action')
    updated = true
  }

  const isIOApp = !!getAppManifest()
  const jobName = isIOApp ? 'io-app-test' : 'test-ci'

  if (!Action.hasJob(jobName)) {
    if (isIOApp) {
      Action.addJob(jobName, IO_TEST_JOB)
    } else {
      Action.addJob(jobName, GENERIC_TEST_JOB)
    }

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
