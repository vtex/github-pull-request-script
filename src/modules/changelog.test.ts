import { updateChangelog } from './changelog'

const baseChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](htt
ps://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n`

test('adds an action to the unreleased section of a changelog', () => {
  const result = updateChangelog(baseChangelog, [
    {
      action: 'added' as const,
      value: 'That awesome thing.',
    },
  ])

  expect(result).toContain(`### Added
- That awesome thing.`)
})

test('adds multiple actions to the unreleased section of a changelog', () => {
  const result = updateChangelog(baseChangelog, [
    {
      action: 'added' as const,
      value: 'That awesome thing.',
    },
    {
      action: 'removed' as const,
      value: 'That awful thing.',
    },
  ])

  expect(result).toContain(`### Added
- That awesome thing.

### Removed
- That awful thing.`)
})
