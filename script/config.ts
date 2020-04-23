import { resolve } from 'path'

import fs from 'fs-extra'

import { ConfigObject } from './types'

export const ROOT_DIR = process.cwd()
export const TMP_DIR = resolve(ROOT_DIR, '.tmp')
export const CONFIG_DIR = resolve(ROOT_DIR, 'config')
export const ASSETS_DIR = resolve(ROOT_DIR, 'assets')

let config

export function getConfig(): ConfigObject {
  if (config) return config
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  config = require(resolve(ROOT_DIR, 'config', 'config.ts')).default
  return config
}

export function resolveTmp(...paths: string[]) {
  return resolve(TMP_DIR, ...paths)
}

export function resolveAsset(...paths: string[]) {
  return resolve(ASSETS_DIR, ...paths)
}

export function parseJSONAsset(...paths: string[]) {
  return fs.readJsonSync(resolveAsset(...paths))
}

export async function getPullRequestTemplate() {
  const {
    pr: { title, body },
  } = getConfig()

  return { title, body }
}
