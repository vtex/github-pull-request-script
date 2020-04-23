import { resolve } from 'path'

import fs from 'fs-extra'
import 'dotenv/config'

import taskCodeOwners from '../script/tasks/codeowners'
import taskContributors from '../script/tasks/contributors'
import taskGHTemplates from '../script/tasks/gh_templates'
import taskDanger from '../script/tasks/dangerAction'
import taskTests from '../script/tasks/testAction'
import taskLint from '../script/tasks/lintAction'
import taskRemoveTravis from '../script/tasks/removeTravis'

const REPO_LIST_FILE = './lists/repos.json'
const BRANCH_NAME = 'chore/pr-actions'
const PR_TITLE =
  'Add pull request actions for linting, testing and checking the pr content'
const PR_BODY = `This an [automated pull request](https://github.com/vtex/github-pull-request-script) that aims to:

%task_list%

When approved, feel free to merge it as if it was created by a bot account :robot:.

%trivial%`.trim()

const args = process.argv.slice(2).map(s => s.replace(/^-+/g, ''))
const dryRun = args.includes('dry-run')

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: BRANCH_NAME,
  deleteAfter: false,
  dryRun,
  repos: fs.readJsonSync(resolve(__dirname, ...REPO_LIST_FILE.split('/'))),
  pr: {
    title: PR_TITLE,
    body: PR_BODY,
  },
  tasks: [
    [taskCodeOwners, { enabled: false }],
    [taskContributors, { enabled: false }],
    [taskGHTemplates, { enabled: false }],
    [taskDanger, { enabled: true }],
    [taskTests, { enabled: true }],
    [taskLint, { enabled: true }],
    [taskRemoveTravis, { enabled: true }],
  ],
}
