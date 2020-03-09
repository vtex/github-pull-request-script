import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { readFileContent, writeFileContent } from '../modules/fs'
import { log } from '../modules/Logger'

const CODEOWNERS = {
  '@vtex-apps/store-framework-devs': '*',
  '@vtex-apps/technical-writers': 'docs/',
}

const FILENAME = 'CODEOWNERS'

function getCodeOwnersPath() {
  return resolvePathCurrentRepo(FILENAME)
}

const CodeOwnersTask: TaskFunction = async () => {
  const path = getCodeOwnersPath()
  let content = ((await readFileContent(path)) ?? '').trim()

  let updated = false
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

  log(`  - Updating CODEOWNERS file`, { indent: 2, color: 'green' })

  await writeFileContent(path, content.trim())

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
