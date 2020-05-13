import fs from 'fs-extra'

import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'
import { TaskFunction } from '../types'

const task: TaskFunction = async () => {
  const commitMessages: string[] = []

  const vtexIgnorePath = resolvePathCurrentRepo('.vtexignore')

  if (!fs.existsSync(vtexIgnorePath)) {
    log(`Skipping, no .vtexignore found.`, { indent: 2, color: 'yellow' })
    return
  }

  const currentLines = fs
    .readFileSync(vtexIgnorePath)
    .toString()
    .split('\n')
    .filter(Boolean)

  const newLines = currentLines.filter(line => !line.match(/changelog\.md/i))

  if (newLines.length === currentLines.length) {
    log(`Skipping, no "CHANGELOG.md" found in .vtexignore.`, {
      indent: 2,
      color: 'yellow',
    })
    return
  }

  fs.writeFileSync(vtexIgnorePath, newLines.join('\n'))
  commitMessages.push('Remove CHANGELOG.md from .vtexignore')

  return {
    changes: commitMessages.map(msg => ({
      type: 'changed',
      message: msg,
      changelog: false,
    })),
  }
}

export default {
  name: `vtex-ignore-changelog`,
  task,
}
