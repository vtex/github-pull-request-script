import { addChanges } from '@geut/chan-core'

type ChangeLogType =
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security'

interface ChangelogChange {
  action: ChangeLogType
  value: string
}

export const updateChangelog = (
  content: string,
  changes: ChangelogChange[]
) => {
  let result

  addChanges(content, { changes }, (err: any, file: any) => {
    if (err) {
      throw new Error(err)
    }
    result = String(file)
  })

  return result
}
