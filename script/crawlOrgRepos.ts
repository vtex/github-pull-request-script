import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

import { Octokit } from '@octokit/core'

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const TOKEN = process.env.GITHUB_TOKEN
const ORG = process.env.ORG || 'vtex-apps'

const octokit = new Octokit({
  auth: TOKEN,
  userAgent: 'get-repo-licenses-from-org/v1.0.0',
})

async function getRepoPage(page) {
  const result = await octokit.request('GET /orgs/{org}/repos', {
    org: ORG,
    per_page: 100,
    page,
  })

  const hasNextPage = result.headers.link.includes('rel="next"')

  return {
    hasNextPage,
    pageResult: result.data,
  }
}

async function getAllRepos() {
  let page = 1
  let listOfRepos = []

  console.log('Crawling repos')
  do {
    console.log(`Page ${page}`)

    // eslint-disable-next-line no-await-in-loop
    const { hasNextPage, pageResult } = await getRepoPage(page)

    listOfRepos = listOfRepos.concat(pageResult)

    if (hasNextPage) {
      page++
    } else {
      page = null
    }
  } while (page)

  return listOfRepos
}

async function run() {
  const allRepos = await getAllRepos()

  const compiledRepos = allRepos
    .filter(repo => repo.fork === false)
    .map(repo => repo.full_name)

  const file = path.join(
    __dirname,
    '..',
    'config',
    'lists',
    `${ORG}-repos.json`
  )
  const data = JSON.stringify(compiledRepos, null, 2)

  fs.writeFileSync(file, data, { encoding: 'utf8' })
}

run()
