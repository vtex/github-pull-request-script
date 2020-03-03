import { getUnreleasedSection, readChangelog } from './changelog'

const baseChangelog = `# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](htt
ps://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n`
const changes = `\n###Added\n\n- New Feature\n`
const version = `\n## [0.2.0] - 2020-02-21\n\n### Fixed\n\n- Bug\n\n###Added\n\n- New feature`

describe('Unreleased section', () => {
  it('Empty changelog', () => {
    const result = getUnreleasedSection(baseChangelog)

    expect(result).toBe('')
  })

  it('Changelog with unreleased changes', () => {
    const result = getUnreleasedSection(baseChangelog + changes)

    expect(result).toBe('\n###Added\n\n- New Feature\n')
  })

  it('Changelog with released version', () => {
    const result = getUnreleasedSection(baseChangelog + version)

    expect(result).toBe('\n')
  })

  it('Changelog with unreleased changes and released version', () => {
    const result = getUnreleasedSection(baseChangelog + changes + version)

    expect(result).toBe('\n###Added\n\n- New Feature\n\n')
  })
})
