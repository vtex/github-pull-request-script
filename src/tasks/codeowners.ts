import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { getFileContent, writeFileContent } from '../modules/fs'

const CODEOWNERS = {
  'vtex-apps/store-framework-devs': '*',
  'vtex-apps/technical-writers': 'docs',
}

const FILENAME = 'CODEOWNERS'

function getCodeOwnersPath() {
  return resolvePathCurrentRepo(FILENAME)
}

const CodeOwnersTask: TaskFunction = async () => {
  const path = getCodeOwnersPath()
  let content = ((await getFileContent(path)) ?? '').trim()

  let updated = false
  for (const [team, glob] of Object.entries(CODEOWNERS)) {
    if (!content.includes(team)) {
      content += `\n${glob} ${team}`
      updated = true
    }
  }

  if (!updated) {
    console.log(`  - Skipping CODEOWNERS file update`)
    return
  }

  console.log(`  - Updating CODEOWNERS file`)

  await writeFileContent(path, content)

  return {
    commitMessage: 'Updating CODEOWNERS file',
    changeLog: {
      action: 'added',
      value:
        'Updated `CODEOWNERS` file with responsible teams for each directory.',
    },
  }
}

export default CodeOwnersTask
