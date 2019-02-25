const deps = require('./lib/deps')
const org = require('./lib/org')

const run = async (_org) => {
  let repos = await org(_org, process.env.GHTOKEN)
  let projects = new Set()
  while (repos) {
    let repo = repos.shift()
    console.log(repo)
    let ret = await deps.projects(repo, process.env.LIOTOKEN)
    console.log(ret.map(p => [p.platform, p.name]))
    ret.forEach(p => projects.add(`${p.platform}/${p.name}`))
  }
}
run('ipfs')

