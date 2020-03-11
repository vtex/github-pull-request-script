# Github Pull Request Script
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

This script automates the process of creating pull requests with specific changes in multiple repositories.

## Running the script

To execute the script run `yarn go` after installing its dependencies.

![example](https://user-images.githubusercontent.com/12702016/76018527-f4346500-5efe-11ea-8ed3-dcd1d6234445.png)

## Configuring

Every configuration needed can be set in the `config/` directory.

- The `PR_TEMPLATE.md` file defines the title (the `h1` tag) of every PR being created and its body.

- The `repos.json` is a list of github repository full names: `owner-or-org/repository-name`.

- The `config.js` file configures multiple settings of the script:

```js
export default {
  // The github token used to create pull requests
  githubToken: process.env.GH_TOKEN,
  // Name of the branch to make the changes
  branchName: 'chore/community-chores',
  // If the script should delete each local clone after creating the pull request
  deleteAfter: false,
  // Execute all the script steps except pushing and creating the pull request.
  dryRun: true,
  // Dictionary of tasks to be executed.
  tasks: {
    codeowners: taskCodeOwners,
    contributors: taskContributors,
  },
}
```

## Tasks

A task is a simple function used to modify the current repository being worked on.

Every task should return `undefined` or an object containing:

- `commitMessage` - the commit message of that change
- `changeLog` - an object with the following properties
  - `action` - a keep-a-changelog action: `added`,`changed`,`deprecated`,`removed`,`fixed`,`security`
  - `value` - the message of this change log entry

The `process.cwd()` is changed for each repository being currently worked on. This way you can use the current working directory to resolve files from the root of each repository.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!