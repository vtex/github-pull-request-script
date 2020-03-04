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

export function getUnreleasedSection(content: string) {
  const unreleased = '[Unreleased]\n'
  const index = content.indexOf(unreleased) + unreleased.length
  const nextSectionIndex = content.indexOf('\n## [', index)
  const hasNextSection = nextSectionIndex !== -1

  return {
    unreleased: content.substring(
      0,
      hasNextSection ? nextSectionIndex : undefined
    ),
    rest: hasNextSection ? content.substring(nextSectionIndex) : '',
  }
}

export function updateChangelog(content: string, changes: ChangelogChange[]) {
  // we do this because there's some changelogs with invalid keep-a-changelog parts and it breaks the parser
  // so we only pass the `unreleased` part and concatenate it with the rest after adding the changes
  const { unreleased, rest } = getUnreleasedSection(content)
  let result: string = content

  addChanges(unreleased, { changes }, (err: any, file: any) => {
    if (err) {
      throw new Error(err)
    }
    result = `${file}${rest}`
  })

  return result
}

export function getChangelogContent(dir: string = process.cwd()) {
  const filePath = resolve(dir, 'CHANGELOG.md')
  return readFile(filePath).then(res => res.toString())
}
