import { relative } from 'path'

import fs from 'fs-extra'
import deepEqual from 'fast-deep-equal'
import allContributors from 'all-contributors-cli'

import { TaskFunction } from '../types'
import {
  resolvePathCurrentRepo,
  getCurrentRepoURL,
  parseRepoUrl,
  getCurrentBranch,
} from '../modules/repo'
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
    if (fs.pathExistsSync(absPath)) {
      readmeFilePath = absPath
      break
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

  const currentAllContributorsConfig = fs.readJSONSync(allcontributorsPath)
  const allContributorsConfig = {
    ...CONFIG_TEMPLATE,
    ...currentAllContributorsConfig,
    files: [relative(resolvePathCurrentRepo(), readmeFilePath)],
    projectName: name,
    projectOwner: owner,
  }

  if (deepEqual(allContributorsConfig, currentAllContributorsConfig)) {
    log(`Skipping .all-contributorsrc file. It's already up to date.`, {
      indent: 2,
      color: 'yellow',
    })
  } else {
    log(`Updating .all-contributorsrc file`, { indent: 2, color: 'green' })
    fs.writeJsonSync(allcontributorsPath, allContributorsConfig, {
      spaces: 2,
    })
    steps += 1
  }

  let readmeContent = await fs
    .readFile(readmeFilePath, { encoding: 'utf-8' })
    .catch(() => '')

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

    fs.writeFileSync(readmeFilePath, readmeContent.trim())
    steps += 1
  }

  if (steps === 0) {
    return
  }

  return {
    commitMessage: 'Update .all-contributorsrc file',
    // changeLog: {
    //   action: 'added',
    //   value: 'Updated `.all-contributorsrc`.',
    // },
  }
}

export default CodeOwnersTask
