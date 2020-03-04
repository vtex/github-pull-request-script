import { promises } from 'fs'

const { access, readFile, writeFile } = promises

export async function fileExists(filePath: string) {
  try {
    await access(filePath)
    return true
  } catch (e) {
    return false
  }
}

export async function getFileContent(filePath: string) {
  if (!(await fileExists(filePath))) {
    return null
  }
  return String(await readFile(filePath))
}

export async function writeFileContent(filePath: string, content: string) {
  return writeFile(filePath, content, {
    encoding: 'UTF-8',
  })
}
