const bent = require('bent')
const parser = require('parse-link-header')
const get = bent('https://libraries.io/api')

const remaining = headers => parseInt(headers['x-ratelimit-remaining'])

const toJSON = stream => new Promise((resolve, reject) => {
  let buffers = []
  stream.on('data', chunk => buffers.push(chunk))
  stream.on('end', () => resolve(JSON.parse(Buffer.concat(buffers).toString())))
  stream.on('error', reject)
})

const query = async (path) => {
  let resp = await get(path)
  let links = parser(resp.headers.link)
  let json = await toJSON(resp)
  let repos = json
  while (links && links.next) {
    resp = await bent()(links.next.url)
    json = await toJSON(resp)
    repos = repos.concat(json)
    links = parser(resp.headers.link)
    
    let rateLimit = remaining(resp.headers)
    if (!rateLimit) {
      console.log(resp.headers)
      process.exit()
    }
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
  console.log(path)
  let ret = await query(path)
  return ret.filter(r => r.repository_url.endsWith(repo))
}

