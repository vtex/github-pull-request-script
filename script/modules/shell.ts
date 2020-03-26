import { execSync } from 'child_process'

export function runCmd(cmd: string) {
  const result = execSync(cmd, {
    encoding: 'utf-8',
    stdio: 'pipe',
  })

  return String(result).trim()
}
