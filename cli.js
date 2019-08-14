#!/usr/bin/env node
const deps = require('./lib/deps')
const fullOrg = require('./')
const log = require('single-line-log').stdout

const ghargs = yargs => {
  yargs.option('ghtoken', {
    default: process.env.GHTOKEN || process.env.GITHUB_TOKEN,
    desc: 'GitHub token, defaults to $GHTOKEN'
  })
}

const lioargs = yargs => {
  yargs.option('liotoken', {
    default: process.env.LIOTOKEN,
    desc: 'Libraries.io token, defaults to $LIOTOKEN'
  })
}

require('yargs') // eslint-disable-line
  .command({
    command: 'repos <pkg>',
    desc: 'Get dependent repos from package in any registry',
    builder: yargs => {
      yargs.positional('pkg', {
        desc: 'Package name. Example: "NPM/ipfs"'
      })
      lioargs(yargs)
    },
    handler: async argv => {
      let d = await deps(argv.pkg, argv.liotoken)
      console.log(d.map(x => x.full_name))
    }
  })
  .command({
    command: 'org <org>',
    desc: 'Get dependent repos for every package of every repo in an entire org',
    builder: yargs => {
      yargs.positional('org', {
        desc: 'Org name. Eample: "ipfs"'
      })
      ghargs(yargs)
      lioargs(yargs)
    },
    handler: async argv => {
      let d = await fullOrg(argv.org, argv.ghtoken, argv.liotoken, log)
      console.log(d.map(x => x.full_name))
    }
  })
  .demandCommand()
  .argv
