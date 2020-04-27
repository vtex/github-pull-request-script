import { resolve } from 'path'

import fs from 'fs-extra'
import 'dotenv/config'

import taskCodeOwners from '../script/tasks/codeowners'
import taskContributors from '../script/tasks/contributors'
import taskGHTemplates from '../script/tasks/gh_templates'
import taskDanger from '../script/tasks/dangerAction'
import taskIOTests from '../script/tasks/testAction'
import taskLint from '../script/tasks/lintAction'
import taskRemoveTravis from '../script/tasks/removeTravis'

const REPO_LIST_FILE = './lists/wf-repos.json'

const BRANCH_NAME = 'chore/pr-actions'

const PR_TITLE = `Add pull request actions for linting, testing and checking the pr content`

const PR_BODY = `
This an [automated pull request](https://github.com/vtex/github-pull-request-script) that aims to:

%task_list%

When approved, feel free to merge it as if it was created by a bot account :robot:.

%trivial%`

const TASKS = [
  [taskCodeOwners, { enabled: false }],
  [taskContributors, { enabled: false }],
  [taskGHTemplates, { enabled: false }],
  [taskDanger, { enabled: true }],
  [taskIOTests, { enabled: true }],
  [taskLint, { enabled: true }],
  [taskRemoveTravis, { enabled: true }],
]

const args = process.argv.slice(2).map(s => s.replace(/^-+/g, ''))
const dryRun = args.includes('dry-run')
const deleteAfter = args.includes('delete-after')

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: BRANCH_NAME,
  deleteAfter,
  dryRun,
  repos: fs.readJsonSync(resolve(__dirname, ...REPO_LIST_FILE.split('/'))),
  pr: {
    title: PR_TITLE.trim(),
    body: PR_BODY.trim(),
  },
  tasks: TASKS,
}
