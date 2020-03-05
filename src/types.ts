export type ChangeLogType =
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security'

export interface ChangelogChange {
  action: ChangeLogType
  value: string
}

export interface TaskSuccess {
  commitMessage: string
  changeLog: ChangelogChange
}

export type TaskFunction = () => Promise<TaskSuccess | undefined>

export interface ConfigObject {
  githubToken: string
  branchName: string
  repos: string[]
  deleteAfter: boolean
  dryRun: boolean
  tasks: Record<string, TaskFunction>
}
