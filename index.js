const deps = require('./lib/deps')
const org = require('./lib/org')

const run = async (_org, ghtoken, liotoken, log) => {
  let repos = await org(_org, ghtoken)
  let projects = new Set()
  let len = repos.length
  while (repos.length) {
    let repo = repos.shift()
    if (log) log(`[${len - repos.length}:${len}] PROJECTS: ${repo}`)
    let ret = await deps.projects(repo, liotoken)
    ret.forEach(p => projects.add(`${p.platform}/${p.name}`))
  }
  projects = Array.from(projects)
  let registry = new Map()
  len = projects.length
  while (projects.length) {
    let project = projects.shift()
    if (log) log(`[${len - projects.length}:${len}] DEPS: ${project}`)
    let _repos = await deps(project, liotoken)
    _repos.forEach(repo => {
      registry.set(repo.full_name, repo)
    })
  }
  return Array.from(registry.values())
}

module.exports = run
