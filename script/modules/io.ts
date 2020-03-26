import { readJsonSync } from 'fs-extra'

import { resolvePathCurrentRepo } from './repo'
import { AppManifest } from '../types'

export function getManifestPath() {
  return resolvePathCurrentRepo('manifest.json')
}

export function getAppManifest(): AppManifest | null {
  try {
    return readJsonSync(getManifestPath())
  } catch {
    return null
  }
}
