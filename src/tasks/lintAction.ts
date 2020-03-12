import fs from 'fs-extra'

import { TaskFunction } from '../types'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'

const CODEOWNERS = {
  '@vtex-apps/us-1st-party-apps': '*',
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
  }
}

export default CodeOwnersTask

// {
//   "name": "Lint",
//   "on": [
//     "push",
//     "pull_request"
//   ],
//   "jobs": {
//     "run-linters": {
//       "name": "Run linters",
//       "runs-on": "ubuntu-latest",
//       "steps": [
//         {
//           "name": "Check out Git repository",
//           "uses": "actions/checkout@v2"
//         },
//         {
//           "name": "Set up Node.js",
//           "uses": "actions/setup-node@v1",
//           "with": {
//             "node-version": 12
//           }
//         },
//         {
//           "name": "Install dependencies",
//           "run": "yarn"
//         },
//         {
//           "name": "Run lint task",
//           "run": "yarn lint"
//         }
//       ]
//     }
//   }
// }
