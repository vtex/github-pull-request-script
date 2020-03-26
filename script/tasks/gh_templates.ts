import fs from 'fs-extra'

import { resolveAsset } from '../config'
import { resolvePathCurrentRepo } from '../modules/repo'
import { log } from '../modules/Logger'
import { TaskFunction } from '../types'

const PR_TEMPLATE_FILEPATH = resolveAsset(
  'templates',
  'PULL_REQUEST_TEMPLATE.md'
)

const ISSUE_TEMPLATE_DIR = resolveAsset('templates', 'ISSUE_TEMPLATE')

const task: TaskFunction = async () => {
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

  if (!fs.pathExistsSync(issueTemplateDir)) {
    if (fs.pathExistsSync(issueTemplatePath)) {
      fs.removeSync(issueTemplatePath)
      commitMessages.push('Replace single issue template with multiple ones')
    } else {
      commitMessages.push('Add issue templates')
    }

    fs.copySync(ISSUE_TEMPLATE_DIR, issueTemplateDir)
    updatedIssue = true
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
  }
}

export default {
  name: `github-templates`,
  task,
}
