import fs from 'fs-extra'

import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'

const CODEOWNERS = {
  '@vtex-apps/store-framework-devs': '*',
  '@vtex-apps/technical-writers': 'docs/',
}

const CodeOwnersTask: TaskFunction = async () => {
  let updated = false

  const rootFilePath = resolvePathCurrentRepo('CODEOWNERS')
  const ghFilePath = resolvePathCurrentRepo('.github', 'CODEOWNERS')

  if (fs.pathExistsSync(rootFilePath)) {
    log(`Moving CODEOWNERS to .github/`, { indent: 2, color: 'green' })
    fs.ensureDirSync(resolvePathCurrentRepo('.github'))
    fs.moveSync(rootFilePath, ghFilePath)
    updated = true
  }

  let content: string = await fs
    .readFile(ghFilePath, { encoding: 'utf-8' })
    .then(str => str.trim())
    .catch(() => '')

  for (const [team, glob] of Object.entries(CODEOWNERS)) {
    if (!content.includes(team)) {
      content += `\n${glob} ${team}`
      updated = true
    }
  }

  if (!updated) {
    log(`Skipping CODEOWNERS file update`, { indent: 2, color: 'yellow' })
    return
  }

  log(`Updating CODEOWNERS file`, { indent: 2, color: 'green' })

  await fs.writeFile(ghFilePath, content.trim())

  return {
    commitMessage: 'Update CODEOWNERS file',
    // changeLog: {
    //   action: 'added',
    //   value:
    //     'Updated `CODEOWNERS` file with responsible teams for each directory.',
    // },
  }
}

export default CodeOwnersTask
