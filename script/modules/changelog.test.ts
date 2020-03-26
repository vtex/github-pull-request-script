import { updateChangelog, getUnreleasedSection } from './changelog'

const baseChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](htt
ps://semver.org/spec/v2.0.0.html).\n\n`
const unreleased = `## [Unreleased]`
const changes = `\n### Added\n\n- New Feature\n`
const version = `\n## [0.2.0] - 2020-02-21\n\n### Fixed\n\n- Bug\n\n###Added\n\n- New feature`

describe('Unreleased section', () => {
  it('Empty changelog', () => {
    const result = getUnreleasedSection(baseChangelog + unreleased)

    expect(result).toMatchObject({
      before: baseChangelog,
      unreleased,
      after: '',
    })
  })

  it('Changelog with unreleased changes', () => {
    const result = getUnreleasedSection(baseChangelog + unreleased + changes)
    expect(result).toMatchObject({
      before: baseChangelog,
      unreleased: unreleased + changes,
      after: '',
    })
  })

  it('Changelog with released version', () => {
    const result = getUnreleasedSection(baseChangelog + unreleased + version)

    expect(result).toMatchObject({
      before: baseChangelog,
      unreleased,
      after: version,
    })
  })

  it('Changelog with unreleased changes and released version', () => {
    const result = getUnreleasedSection(
      baseChangelog + unreleased + changes + version
    )

    expect(result).toMatchObject({
      before: baseChangelog,
      unreleased: unreleased + changes,
      after: version,
    })
  })
})

test('adds an action to the unreleased section of a changelog', () => {
  const result = updateChangelog(baseChangelog + unreleased, [
    {
      action: 'added',
      value: 'That awesome thing.',
    },
  ])

  expect(result).toContain(`### Added\n- That awesome thing.`)
})

test('adds multiple actions to the unreleased section of a changelog', () => {
  const result = updateChangelog(baseChangelog + unreleased, [
    {
      action: 'added',
      value: 'That awesome thing.',
    },
    {
      action: 'removed',
      value: 'That awful thing.',
    },
  ])

  expect(result).toContain(
    `### Added\n- That awesome thing.\n\n### Removed\n- That awful thing.`
  )
})
