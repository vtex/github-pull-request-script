import 'dotenv/config'

import taskCodeOwners from '../dist/tasks/codeowners'
import taskContributors from '../dist/tasks/contributors'

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: 'chore/community-chores',
  deleteAfter: false,
  dryRun: true,
  tasks: {
    codeowners: taskCodeOwners,
    contributors: taskContributors,
  },
}
