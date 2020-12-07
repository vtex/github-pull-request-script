import * as path from 'path'
import * as fs from 'fs'

import crawler from 'npm-license-crawler'
import * as json2csv from 'json2csv'

const fields = ['name', 'url', 'license', 'usedIn', 'since']
const opts = { fields }

const options = {
  start: [path.join(__dirname, '..', '.tmp')],
  unknown: false,
  omitVersion: true,
  onlyDirectDependencies: true,
  json: 'abc.json'
}

crawler.dumpLicenses(options, function callback(error, res) {
  if (error) {
    console.error('Error:', error)
    return
  }

  const result = Object.keys(res).reduce((acc, depKey) => {
    const dependency = res[depKey]
    if (['UNKNOWN', 'UNLICENSED'].includes(dependency.licenses)) {
      return acc
    }

    acc.push({
      name: depKey,
      url: dependency.repository,
      license: dependency.licenses,
      usedIn: '',
      since: '',
    })

    return acc
  }, [])

  console.log(result[0])

  try {
    console.log()
    const csv = json2csv.parse(result, opts)
    const fileName = path.join(__dirname, 'licenses.csv')
    fs.writeFileSync(fileName, csv, { encoding: 'utf8' })
  } catch (err) {
    console.error(err)
  }
})
