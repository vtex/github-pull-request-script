import { relative } from 'path'

import deepEqual from 'fast-deep-equal'
import allContributors from 'all-contributors-cli'

import { TaskFunction } from '../types'
import {
  resolvePathCurrentRepo,
  getCurrentRepoURL,
  parseRepoUrl,
} from '../modules/repo'
import {
  writeFileContent,
  fileExists,
  readFileContent,
  readJSONFile,
} from '../modules/fs'
import { log } from '../modules/Logger'

const FILENAME = '.all-contributorsrc'

const POSSIBLE_README_FILES = ['docs/README.md', 'README.md']

const CONFIG_TEMPLATE = {
  projectName: null,
  projectOwner: null,
  repoType: 'github',
  repoHost: 'https://github.com',
  files: ['docs/README.md'],
  imageSize: 100,
  commit: true,
  commitConvention: 'none',
  contributors: [],
  contributorsPerLine: 7,
}

const CodeOwnersTask: TaskFunction = async () => {
  let steps = 0
  let readmeFilePath

  for await (const path of POSSIBLE_README_FILES) {
    const absPath = resolvePathCurrentRepo(path)
    if (await fileExists(absPath)) {
      readmeFilePath = absPath
    }
  }

  if (readmeFilePath == null) {
    log(`No readme file found. Skipping .all-contributorsrc task`, {
      indent: 2,
    })
    return
  }

  const allcontributorsPath = resolvePathCurrentRepo(FILENAME)
  const repoUrl = getCurrentRepoURL()
  const { owner, name } = parseRepoUrl(repoUrl)

  const currentAllContributorsConfig = await readJSONFile(allcontributorsPath)

  const configSample = {
    ...CONFIG_TEMPLATE,
    ...currentAllContributorsConfig,
    files: [relative(resolvePathCurrentRepo(), readmeFilePath)],
    projectName: name,
    projectOwner: owner,
  }

  if (deepEqual(configSample, currentAllContributorsConfig)) {
    log(`Skipping .all-contributorsrc file. It's already up to date.`, {
      indent: 2,
      color: 'yellow',
    })
  } else {
    log(`Updating .all-contributorsrc file`, { indent: 2, color: 'green' })
    writeFileContent(allcontributorsPath, JSON.stringify(configSample, null, 2))
    steps += 1
  }

  let readmeContent = (await readFileContent(readmeFilePath)) ?? ''

  if (readmeContent.includes(`ALL-CONTRIBUTORS-LIST:START`)) {
    log(
      `Skipping readme update, because it already contains the all-contributors section.`,
      {
        indent: 2,
        color: 'yellow',
      }
    )
  } else {
    log(`Updating README with contributors section`, {
      indent: 2,
      color: 'green',
    })

    readmeContent = allContributors.initContributorsList(readmeContent)
    readmeContent = allContributors.initBadge(readmeContent)

    await writeFileContent(readmeFilePath, readmeContent.trim())
    steps += 1
  }

  if (steps === 0) {
    return
  }

  return {
    commitMessage: 'Update .all-contributorsrc file',
    changeLog: {
      action: 'added',
      value: 'Updated `.all-contributorsrc`.',
    },
  }
}

export default CodeOwnersTask
