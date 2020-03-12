import { resolve } from 'path'

import fs from 'fs-extra'

import { ConfigObject } from './types'

const PR_TEMPLATE_TITLE_PATTERN = /^#(?:\s|\w)(.*)$/im

export const ROOT_DIR = process.cwd()
export const TMP_DIR = resolve(ROOT_DIR, '.tmp')
export const CONFIG_DIR = resolve(ROOT_DIR, 'config')

let config

export function getConfig(): ConfigObject {
  if (config) return config
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  config = require(resolve(ROOT_DIR, 'config', 'config.js')).default
  return config
}

export function resolveTmpDir(...paths: string[]) {
  return resolve(TMP_DIR, ...paths)
}

export function getAssetsDir() {
  return resolve(ROOT_DIR, 'assets')
}

export async function getPullRequestTemplate() {
  const templatePath = resolve(CONFIG_DIR, 'PR_TEMPLATE.md')
  const templateContent = await fs
    .readFile(templatePath, { encoding: 'utf-8' })
    .catch(() => '')

  const titleMatch = templateContent.match(PR_TEMPLATE_TITLE_PATTERN)

  if (titleMatch == null || titleMatch.index == null) {
    throw new Error('Missing "# {PR title}" in pull request template')
  }

  const [fullMatch, title] = titleMatch
  const body = templateContent
    .substring(titleMatch.index + fullMatch.length)
    .trim()

  return { title, body }
}

export async function getRepoList() {
  const listPath = resolve(CONFIG_DIR, 'repos.json')
  const repoList = await fs.readJson(listPath)
  return repoList
}
