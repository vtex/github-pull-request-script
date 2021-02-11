import yaml from 'js-yaml'
import fs from 'fs-extra'

import { resolvePathCurrentRepo } from './repo'
import { resolveAsset } from '../config'

const DEFAULT_ACTION_NAME = 'pull-request'

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

export function createBaseAction(
  defaultBranch: string,
  name = DEFAULT_ACTION_NAME
) {
  const dangerBaseActionStr = fs
    .readFileSync(resolveAsset('templates', 'ACTIONS', 'base.json'))
    .toString()
    .replace('%default_branch%', defaultBranch)

  writeActionJSON(JSON.parse(dangerBaseActionStr), name)
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
