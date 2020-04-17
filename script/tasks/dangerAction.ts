import fs from 'fs-extra'

import { resolvePathCurrentRepo } from '../modules/repo'
import { TaskFunction } from '../types'
import { runCmd } from '../modules/shell'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'

const DANGER_JOB = parseJSONAsset('templates', 'ACTIONS', 'jobs', 'danger.json')

const DANGERFILE_TEMPLATE = `
// docs at https://github.com/vtex/danger
const { assert } = require('@vtex/danger');

assert();
`.trim()

const task: TaskFunction = async () => {
  const commitMessages: string[] = []
  let updatedDanger = false

  const dangerPath = resolvePathCurrentRepo('dangerfile.js')

  let content = await fs.readFile(dangerPath).catch(() => '')

  if (!content.includes('@vtex/danger')) {
    content = `${DANGERFILE_TEMPLATE}\n\n${content}`.trim()

    fs.writeFileSync(dangerPath, content)
    runCmd(`yarn add -D @vtex/danger@latest`)

    commitMessages.push('Add danger and @vtex/danger')
    updatedDanger = true
  }

  Action.ensureActionDir()

  if (!Action.hasAction()) {
    Action.createBaseAction()
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
