import { resolve } from 'path'

import { resolveAsset } from '../config'
import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'
import { getAppManifest } from '../modules/io'

const BUILDERS_WITH_TOOLING = new Set(['react', 'node'])

const task: TaskFunction = async () => {
  const commitMessages: string[] = []

  const appManifest = getAppManifest()
  if (appManifest == null) {
    throw new Error('App manifest not found.')
  }

  const { builders } = appManifest

  console.log({ builders })

  // return {
  //   changes: commitMessages.map(msg => ({
  //     type: 'changed',
  //     message: msg,
  //     changelog: false,
  //   })),
  // }
}

export default {
  name: `lint-format-tooling`,
  task,
}
