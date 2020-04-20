import fs from 'fs-extra'

import { resolvePathCurrentRepo } from '../modules/repo'
import { TaskFunction } from '../types'
import { runCmd } from '../modules/shell'
import { parseJSONAsset } from '../config'
import * as Action from '../modules/action'

const DANGER_JOB = parseJSONAsset('templates', 'ACTIONS', 'jobs', 'danger.json')

const DANGERFILE_TEMPLATE = `
// docs at https://github.com/vtex/danger
const { verify } = require('@vtex/danger')

verify({
  keepachangelog: {
    // set to 'true' to require a new version defined in the changelog change
    changeVersion: false,
  },
})`

const task: TaskFunction = async () => {
  const commitMessages: string[] = []
  let updatedDanger = false

  const dangerPath = resolvePathCurrentRepo('dangerfile.js')
  const eslintIgnorePath = resolvePathCurrentRepo('.eslintignore')

  let dangerContent = await fs.readFile(dangerPath).catch(() => '')
  const eslintIgnoreContent = await fs
    .readFile(eslintIgnorePath)
    .catch(() => '')

  if (!dangerContent.includes('@vtex/danger')) {
    dangerContent = `${DANGERFILE_TEMPLATE}`.trim()

    fs.writeFileSync(dangerPath, dangerContent)
    runCmd(`yarn add -D @vtex/danger@latest`)

    commitMessages.push('Add danger and @vtex/danger')
    updatedDanger = true
  }

  if (!eslintIgnoreContent.includes('dangerfile.js')) {
    const newContent = `${eslintIgnoreContent}\ndangerfile.js`

    commitMessages.push('Add dangerfile.js to .eslintignore')
    fs.writeFileSync(eslintIgnorePath, newContent)
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
