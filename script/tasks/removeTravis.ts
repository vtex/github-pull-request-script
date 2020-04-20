import fs from 'fs-extra'

import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'

const task: TaskFunction = async () => {
  const commitMessages: string[] = []

  const travisPath = resolvePathCurrentRepo('.travis.yml')

  if (!fs.pathExistsSync(travisPath)) {
    log(`No .travis.yml found. Skipping.`, { indent: 2, color: 'yellow' })
    return
  }

  fs.removeSync(travisPath)
  commitMessages.push('Remove .travis.yml in favour of using github actions')

  return {
    changes: commitMessages.map(msg => ({
      type: 'changed',
      message: msg,
      changelog: false,
    })),
  }
}

export default {
  name: 'Remove travis',
  task,
}
