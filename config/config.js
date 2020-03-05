import 'dotenv/config'

import taskCodeOwners from '../dist/tasks/codeowners'
import taskContributors from '../dist/tasks/contributors'
import repos from './repos.json'

export default {
  githubToken: process.env.GH_TOKEN,
  branchName: 'chore/community-chores',
  repos,
  deleteAfter: false,
  tasks: {
    codeowners: taskCodeOwners,
    contributors: taskContributors,
  },
}
