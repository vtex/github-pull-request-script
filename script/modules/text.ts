export function uncapitalize(str: string) {
  return str.charAt(0).toLocaleLowerCase() + str.slice(1)
}

export function buildCommitMessage(parts: string[]) {
  // uncapitalize every part but the first one
  parts = parts.map((p, i) => (i === 0 ? p : uncapitalize(p)))

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`

  let index = 0
  let output = ''
  while (index < parts.length - 1) {
    output += `${parts[index]}, `
    index++
  }

  output += `and ${parts[parts.length - 1]}`

  return output
}
