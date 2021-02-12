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
}

export type TaskFunction = (args: {
  defaultBranch: string
  owner: string | null
  repo: string | null
}) => Promise<TaskSuccess | void>

export interface TaskModule {
  name: string
  task: TaskFunction
}

export interface TaskOptions {
  enabled: boolean
}

export interface ConfigObject {
  githubToken: string
  branchName: string
  repos: string[]
  deleteAfter: boolean
  dryRun: boolean
  tasks: Array<[TaskModule, TaskOptions]>
  pr: {
    title: string
    body: string
  }
}

export interface AppManifest {
  builders: Record<string, string>
  [key: string]: any
}
