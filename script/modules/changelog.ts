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
  const unreleased = '## [Unreleased]'
  const startIndex = content.indexOf(unreleased)
  const endIndex = startIndex + unreleased.length
  const nextSectionIndex = content.indexOf('\n## [', endIndex)
  const hasNextSection = nextSectionIndex !== -1

  return {
    before: content.substring(0, startIndex),
    unreleased: content.substring(
      startIndex,
      hasNextSection ? nextSectionIndex : undefined
    ),
    after: hasNextSection ? content.substring(nextSectionIndex) : '',
  }
}

export function updateChangelog(content: string, changes: ChangelogChange[]) {
  // we do this because there's some changelogs with invalid keep-a-changelog parts and it breaks the parser
  // so we only pass the `unreleased` part and concatenate it with the rest after adding the changes
  const { unreleased, before, after } = getUnreleasedSection(content)
  let result: string = content

  addChanges(`${before}${unreleased}`, { changes }, (err: any, file: any) => {
    if (err) {
      throw new Error(err)
    }
    // we get the only the unreleased section from the result because `chan-core` removes line breaks from the
    // initial changelog text and we don't want to mess with that.
    const updatedUnreleased = getUnreleasedSection(String(file)).unreleased
    result = `${before}${updatedUnreleased}${after}`
  })

  return result
}

export function getChangelogContent(dir: string = process.cwd()) {
  const filePath = resolve(dir, 'CHANGELOG.md')
  return readFile(filePath).then(res => res.toString())
}
