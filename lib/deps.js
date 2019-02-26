const bent = require('bent')
const sleep = require('sleep-promise')
const parser = require('parse-link-header')

const toJSON = stream => new Promise((resolve, reject) => {
  let buffers = []
  stream.on('data', chunk => buffers.push(chunk))
  stream.on('end', () => resolve(JSON.parse(Buffer.concat(buffers).toString())))
  stream.on('error', reject)
})

const req = async (url) => {
  let resp = await bent(200, 404, 429)(url)
  if (resp.statusCode === 404) return { json: [], links: null }
  if (resp.statusCode === 429) {
    await sleep(10 * 1000) // wait 10 seconds to try and reset rate limit
    return req(url)
  }
  let links = parser(resp.headers.link) || null
  return { json: await toJSON(resp), links }
}

const query = async (path) => {
  let { json, links } = await req('https://libraries.io/api' + path)
  let repos = json
  let _links = links
  while (_links && _links.next) {
    let { json, links } = await req(_links.next.url)
    _links = links
    repos = repos.concat(json)
  }
  return repos
}

const run = async (project, token) => {
  let path = `/${project}/dependent_repositories?api_key=${token}&per_page=100`
  return query(path)
}

module.exports = run
module.exports.projects = async (repo, token) => {
  let path = `/github/${repo}/projects?api_key=${token}&per_page=100`
  let ret = await query(path)
  return ret.filter(r => r.repository_url.endsWith(repo))
}
