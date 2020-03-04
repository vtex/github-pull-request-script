import { resolve } from 'path'

export const ROOT_DIR = process.cwd()
export const TMP_DIR = resolve(process.cwd(), '.tmp')

export function resolveTmpDir(...paths: string[]) {
  return resolve(TMP_DIR, ...paths)
}
