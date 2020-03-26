import 'dotenv/config'

import taskCodeOwners from '../script/tasks/codeowners'
import taskContributors from '../script/tasks/contributors'
import taskGHTemplates from '../script/tasks/gh_templates'
import taskLintFormatTooling from '../script/tasks/lint_format_tooling'

const PR_TITLE = 'Sample pr title'
const PR_BODY = `
This an automated pull request that aims to:

%task_list%`.trim()

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: 'chore/community-chores-foo',
  deleteAfter: false,
  dryRun: true,
  pr: {
    title: PR_TITLE,
    body: PR_BODY,
  },
  tasks: [
    [taskCodeOwners, { enabled: false }],
    [taskContributors, { enabled: false }],
    [taskGHTemplates, { enabled: false }],
    [taskLintFormatTooling, { enabled: true }],
  ],
}
