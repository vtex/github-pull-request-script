import { execSync } from 'child_process'

export function runCmd(cmd: string, { silent = true } = {}) {
  const result = execSync(cmd, {
    stdio: silent ? 'ignore' : 'pipe',
  })

  return String(result).trim()
}
