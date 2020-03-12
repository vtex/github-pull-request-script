import { resolve } from 'path'

import fs from 'fs-extra'

import { getAssetsDir } from '../config'
import { TaskFunction } from '../types'
import { resolvePathCurrentRepo, buildCommitMessage } from '../modules/repo'
import { log } from '../modules/Logger'

const PR_TEMPLATE_FILEPATH = resolve(
  getAssetsDir(),
  'templates',
  'PULL_REQUEST_TEMPLATE.md'
)

const ISSUE_TEMPLATE_DIR = resolve(
  getAssetsDir(),
  'templates',
  'ISSUE_TEMPLATE'
)

const CodeOwnersTask: TaskFunction = async () => {
  const commitMessages: string[] = []
  let updatedPRTemplate = false
  let updatedIssue = false

  fs.ensureDirSync(resolvePathCurrentRepo('.github'))

  const PRTemplatePath = resolvePathCurrentRepo(
    '.github',
    'PULL_REQUEST_TEMPLATE.md'
  )
  const issueTemplatePath = resolvePathCurrentRepo(
    '.github',
    'ISSUE_TEMPLATE.md'
  )
  const issueTemplateDir = resolvePathCurrentRepo('.github', 'ISSUE_TEMPLATE')

  if (!fs.pathExistsSync(PRTemplatePath)) {
    fs.copyFileSync(PR_TEMPLATE_FILEPATH, PRTemplatePath)
    updatedPRTemplate = true
    commitMessages.push('Add PR template')
  } else {
    log(`Skipping PULL_REQUEST_TEMPLATE.`, { indent: 2, color: 'yellow' })
  }

  if (
    !fs.pathExistsSync(issueTemplatePath) &&
    !fs.pathExistsSync(issueTemplateDir)
  ) {
    fs.copySync(ISSUE_TEMPLATE_DIR, issueTemplateDir)
    updatedIssue = true
    commitMessages.push('Add issue templates')
  } else {
    log(`Skipping ISSUE_TEMPLATE.`, { indent: 2, color: 'yellow' })
  }

  if (!updatedIssue && !updatedPRTemplate) {
    return
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
