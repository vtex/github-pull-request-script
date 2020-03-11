export type ChangeLogType =
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security'

export interface TaskChange {
  type: ChangeLogType
  message: string
  changelog: boolean
}

export interface ChanChangelogEntry {
  action: ChangeLogType
  value: string
}

export interface TaskSuccess {
  changes: TaskChange[]
  commitMessage: string
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
