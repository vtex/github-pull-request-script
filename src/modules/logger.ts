import colors from 'colors/safe'

interface LogOptions {
  indent?: number
  type?: 'error' | 'warn' | 'log'
  prefix?: string
  color?:
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | 'grey'
}

export function log(
  msg: string,
  { indent, prefix, color = 'white', type = 'log' }: LogOptions = {}
) {
  let message = ''

  if (indent) {
    message += ' '.repeat(indent * 2)
  }

  if (prefix) {
    message += `${prefix} `
  }

  message += colors[color](msg)

  console[type](message)
}
