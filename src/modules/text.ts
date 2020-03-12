export function uncapitalize(str: string) {
  return str.charAt(0).toLocaleLowerCase() + str.slice(1)
}
