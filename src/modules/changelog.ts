import { resolve } from 'path'
import { promises as fsPromises } from 'fs'

import { addChanges } from '@geut/chan-core'

const { readFile } = fsPromises

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

export function updateChangelog(content: string, changes: ChangelogChange[]) {
  let result: string = content

  addChanges(content, { changes }, (err: any, file: any) => {
    if (err) {
      throw new Error(err)
    }
    result = String(file)
  })

  return result
}

export function getChangelogContent(dir: string = process.cwd()) {
  const filePath = resolve(dir, 'CHANGELOG.md')
  return readFile(filePath).then(res => res.toString())
}
