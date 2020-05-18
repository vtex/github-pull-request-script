# Github Pull Request Script

This script automates the process of creating pull requests with specific changes in multiple repositories.

## Running the script

Use the package manager [yarn](https://yarnpkg.com/) to install the dependencies.

```bash
yarn install
```

To execute the script, run `yarn go`. Example:

![example](https://user-images.githubusercontent.com/26108090/81767321-7c5e5a00-94ae-11ea-964d-d4d15d793c74.png)

Command line options:

```
--delete-after  Delete each local clone after creating the pull request
--dry-run       Execute all the script steps except pushing and creating the pull request
```

## Configuring

Every configuration needed can be set in the `config/` directory.

- The `repos.json` is a list of github repository full names: `owner-or-org/repository-name`.

- The `config.ts` file configures multiple settings of the script:

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
  // Title and body of the PR that's going to be created
  // Use `%task_list%` to insert a list of changes made.
  pr: {
    title: 'A pr title',
    body: `
A pr body

With the following changes:

%task_list%`,
  },
  // Dictionary of tasks to be executed.
  tasks: {
    codeowners: taskCodeOwners,
    contributors: taskContributors,
  },
}
```

## Tasks

A task is an object containing a `name`, and a `task` function used to modify the current repository being worked on.

Every task should return `undefined` or an object containing:

- `changes` - an object with the following properties
- `type` - a keep-a-changelog action: `added`,`changed`,`deprecated`,`removed`,`fixed`,`security`
- `message` - a message pointing out the change made
- `changelog` - a boolean. If set to `true`, this change will be added to the `CHANGELOG.md`.

The `process.cwd()` is changed for each repository being currently worked on. This way you can use the current working directory to resolve files from the root of each repository.
