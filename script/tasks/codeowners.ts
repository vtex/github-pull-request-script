import fs from 'fs-extra'

import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'

const CODEOWNERS: Record<string, string> = {}

const task: TaskFunction = async () => {
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

  const content: string = await fs
    .readFile(ghFilePath, { encoding: 'utf-8' })
    .then(str => str.trim())
    .catch(() => '')

  const parsedContent = content
    .split('\n')
    .reduce<Record<string, string[]>>((acc, line) => {
      const [lineGlob, ...teams] = line.split(/\s+/)
      for (const team of teams) {
        if (acc[lineGlob] == null) acc[lineGlob] = []
        acc[lineGlob].push(team)
      }
      return acc
    }, {})

  for (const [team, glob] of Object.entries(CODEOWNERS)) {
    if (glob in parsedContent) {
      if (!parsedContent[glob].includes(team)) {
        parsedContent[glob].push(team)
        updatedContent = true
      }
    } else {
      parsedContent[glob] = [team]
      updatedContent = true
    }
  }

  parsedContent['messages/'] = ['@vtex-apps/localization']
  parsedContent['src/i18n/'] = ['@vtex-apps/localization']

  const newContent = Object.entries(parsedContent)
    .map(([glob, teams]) => `${glob} ${teams.join(' ')}`)
    .join('\n')

  let mainCommitMessage = 'Update CODEOWNERS content'

  if (content !== newContent && !updatedContent) {
    updatedContent = true
    mainCommitMessage = 'Fix CODEOWNERS content'
  }

  if (!updatedDir && !updatedContent) {
    log(`Skipping CODEOWNERS file update`, { indent: 2, color: 'yellow' })
    return
  }

  if (updatedContent) {
    commitMessages.push(mainCommitMessage)

    log(`Updating CODEOWNERS file`, { indent: 2, color: 'green' })
    await fs.writeFile(ghFilePath, newContent.trim())
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
  name: `codeowners`,
  task,
}
