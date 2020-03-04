import { updateChangelog, getUnreleasedSection } from './changelog'

const baseChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](htt
ps://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n`
const changes = `\n### Added\n\n- New Feature\n`
const version = `\n## [0.2.0] - 2020-02-21\n\n### Fixed\n\n- Bug\n\n###Added\n\n- New feature`

describe('Unreleased section', () => {
  it('Empty changelog', () => {
    const result = getUnreleasedSection(baseChangelog)

    expect(result).toMatchObject({ unreleased: baseChangelog, rest: '' })
  })

  it('Changelog with unreleased changes', () => {
    const result = getUnreleasedSection(baseChangelog + changes)
    expect(result).toMatchObject({
      unreleased: baseChangelog + changes,
      rest: '',
    })
  })

  it('Changelog with released version', () => {
    const result = getUnreleasedSection(baseChangelog + version)

    expect(result).toMatchObject({
      unreleased: baseChangelog,
      rest: version,
    })
  })

  it('Changelog with unreleased changes and released version', () => {
    const result = getUnreleasedSection(baseChangelog + changes + version)

    expect(result).toMatchObject({
      unreleased: baseChangelog + changes,
      rest: version,
    })
  })
})

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
