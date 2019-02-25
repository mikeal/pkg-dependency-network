const GitHub = require('node-github-graphql')
// application/vnd.github.hawkgirl-preview+json

const run = async (org, ghtoken, deps=new Set()) => {
  const github = new GitHub({ 
    token: ghtoken
  })
  let cursor
  let repoQuery = () => {
    if (!cursor) return 'first: 100'
    else return `first: 100, after: "${cursor}"`
  }

  const next = async () => {
    let ret = await github.query(`
      query {
        organization (login: "${org}") {
          repositories (${repoQuery()}) {
            pageInfo () {
              hasNextPage
              startCursor
              endCursor
            }
            nodes () {
              isPrivate
              nameWithOwner
            }
          }
        }
      }   
    `)
    ret.data.organization.repositories.nodes.forEach(n => {
      if (!n.isPrivate) deps.add(n.nameWithOwner)
    })
    let page = ret.data.organization.repositories.pageInfo
    if (page.hasNextPage) cursor = page.endCursor
    else cursor = null
    return cursor
  }
  while (await next()) {}
  return Array.from(deps)
}

module.exports = run

