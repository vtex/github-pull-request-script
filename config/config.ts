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
import taskVtexIgnoreChangelog from '../script/tasks/vtexignore-changelog'

const REPO_LIST_FILE = './lists/vtex-apps.json'

const BRANCH_NAME = 'codeowners'

const PR_TITLE = 'Add localization team to CODEOWNERS'

const PR_BODY = `
This an [automated pull request](https://github.com/vtex/github-pull-request-script) that aims to:

%task_list%

When approved, feel free to merge it as if it was created by a bot account :robot:.

%trivial%`

const TASKS = [[taskCodeOwners, { enabled: true }]]

const args = process.argv.slice(2).map(s => s.replace(/^-+/g, ''))
const dryRun = args.includes('dry-run')
const deleteAfter = args.includes('delete-after')

export default {
  githubToken: 'seu token',
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
