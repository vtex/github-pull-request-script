import fs from 'fs-extra'

import { TaskFunction } from '../types'
import { resolvePathCurrentRepo, buildCommitMessage } from '../modules/repo'
import { log } from '../modules/Logger'

const CODEOWNERS = {
  '@vtex-apps/store-framework-devs': '*',
  '@vtex-apps/technical-writers': 'docs/',
}

const CodeOwnersTask: TaskFunction = async () => {
  let updatedDir = false
  let updatedContent = false

  const commitMessages: string[] = []
  const rootFilePath = resolvePathCurrentRepo('CODEOWNERS')
  const ghFilePath = resolvePathCurrentRepo('.github', 'CODEOWNERS')

  fs.ensureDirSync(resolvePathCurrentRepo('.github'))

  if (fs.pathExistsSync(rootFilePath)) {
    commitMessages.push('Moved CODEOWNERS to .github/')

    log(`Moving CODEOWNERS to .github/`, { indent: 2, color: 'green' })

    fs.moveSync(rootFilePath, ghFilePath)
    updatedDir = true
  }

  let content: string = await fs
    .readFile(ghFilePath, { encoding: 'utf-8' })
    .then(str => str.trim())
    .catch(() => '')

  for (const [team, glob] of Object.entries(CODEOWNERS)) {
    if (!content.includes(team)) {
      content += `\n${glob} ${team}`
      updatedContent = true
    }
  }

  if (!updatedDir && !updatedContent) {
    log(`Skipping CODEOWNERS file update`, { indent: 2, color: 'yellow' })
    return
  }

  if (updatedContent) {
    commitMessages.push('Update CODEOWNERS content')

    log(`Updating CODEOWNERS file`, { indent: 2, color: 'green' })
    await fs.writeFile(ghFilePath, content.trim())
  }

  return {
    changes: commitMessages.map(msg => ({
      type: 'changed',
      message: msg,
      changelog: false,
    })),
    commitMessage: buildCommitMessage(commitMessages),
  }
}

export default CodeOwnersTask
