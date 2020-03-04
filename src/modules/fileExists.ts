import { accessSync } from 'fs'

export function fileExists(filePath: string) {
  try {
    accessSync(filePath)
    return true
  } catch (e) {
    return false
  }
}
