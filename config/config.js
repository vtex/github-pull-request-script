/* eslint-disable no-unused-vars */
import 'dotenv/config'

import taskCodeOwners from '../dist/tasks/codeowners'
import taskContributors from '../dist/tasks/contributors'
import ghTemplates from '../dist/tasks/gh_templates'

const PR_TITLE = 'Sample pr title'
const PR_BODY = `
This an automated pull request that aims to:

%task_list%`.trim()

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: 'chore/community-chores-foo',
  deleteAfter: false,
  dryRun: true,
  tasks: {
    codeowners: taskCodeOwners,
    contributors: taskContributors,
    // ghTemplates,
  },
  pr: {
    title: PR_TITLE,
    body: PR_BODY,
  },
}
