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

const REPO_LIST_FILE = './lists/vtex-apps-repos.json'

const BRANCH_NAME = 'fix/unignore-changelog'

const PR_TITLE = `Remove changelog.md from .vtexignore`

const PR_BODY = `
This an [automated pull request](https://github.com/vtex/github-pull-request-script) that aims to:

%task_list%

When approved, feel free to merge it as if it was created by a bot account :robot:.

%trivial%`

const TASKS = [
  [taskCodeOwners, { enabled: false }],
  [taskContributors, { enabled: false }],
  [taskGHTemplates, { enabled: false }],
  [taskDanger, { enabled: false }],
  [taskIOTests, { enabled: false }],
  [taskLint, { enabled: false }],
  [taskRemoveTravis, { enabled: false }],
  [taskVtexIgnoreChangelog, { enabled: false }],
]

// const args = process.argv.slice(2).map(s => s.replace(/^-+/g, ''))
// const dryRun = args.includes('dry-run')
// const deleteAfter = args.includes('delete-after')

export default {
  // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
  githubToken: process.env.GITHUB_TOKEN,
  branchName: BRANCH_NAME,
  deleteAfter: false,
  dryRun: true,
  repos: fs.readJsonSync(resolve(__dirname, ...REPO_LIST_FILE.split('/'))),
  pr: {
    title: PR_TITLE.trim(),
    body: PR_BODY.trim(),
  },
  tasks: [],
}
