import { readFileSync } from 'fs'
import { join } from 'path'

export function readChangelog() {
  return readFileSync(join('.', 'CHANGELOG.md'), { encoding: 'utf8' })
}

export function getUnreleasedSection(changelog) {
  const unreleased = '[Unreleased]\n'
  const index = changelog.indexOf(unreleased) + unreleased.length
  const nextSection = changelog.indexOf('## [', index)

  return changelog.substring(
    index,
    nextSection !== -1 ? nextSection : undefined
  )
}
