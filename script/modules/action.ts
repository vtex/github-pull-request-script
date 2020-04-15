import yaml from 'js-yaml'
import fs from 'fs-extra'

import { resolvePathCurrentRepo } from './repo'
import { parseJSONAsset } from '../config'

const DEFAULT_ACTION_NAME = 'pull-request'
const DANGER_BASE_ACTION = parseJSONAsset('templates', 'ACTIONS', 'base.json')

export function getActionPath(name = DEFAULT_ACTION_NAME) {
  const actionPath = resolvePathCurrentRepo(
    '.github',
    'workflows',
    `${name}.yml`
  )
  return actionPath
}

export function ensureActionDir() {
  fs.ensureDirSync(resolvePathCurrentRepo('.github', 'workflows'))
}

export function hasAction(name = DEFAULT_ACTION_NAME) {
  return fs.pathExistsSync(getActionPath(name))
}

export function createBaseAction(name = DEFAULT_ACTION_NAME) {
  writeActionJSON(DANGER_BASE_ACTION, name)
}

export function readActionJSON(name = DEFAULT_ACTION_NAME) {
  return yaml.safeLoad(fs.readFileSync(getActionPath(name)))
}

export function writeActionJSON(action: string, name: string) {
  const yml = yaml.safeDump(action)
  fs.writeFileSync(getActionPath(name), yml)
}

export function addJob(name: string, job: JSON, action = DEFAULT_ACTION_NAME) {
  const actionJSON = readActionJSON(action)

  Object.assign(actionJSON.jobs, {
    [name]: job,
  })

  writeActionJSON(actionJSON, action)
}

export function hasJob(name: string, actionName = DEFAULT_ACTION_NAME) {
  const actionJSON = readActionJSON(actionName)
  return name in actionJSON.jobs
}
