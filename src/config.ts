import { resolve } from 'path'
// import { tmpdir } from 'os'
// import { realpathSync } from 'fs'

export const ROOT_DIR = process.cwd()
export const TMP_DIR = resolve(process.cwd(), '.tmp') // resolve(realpathSync(tmpdir()), 'gh-pr-script')

export function resolveTmpDir(...paths: string[]) {
  return resolve(TMP_DIR, ...paths)
}
