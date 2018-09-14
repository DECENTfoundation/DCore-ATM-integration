const CWD = process.cwd()
const config = require(CWD + '/config.json')
const r2 = require('r2')
let d = config.decentd.local
d.uri = `http://${config.decentd.local.host}:${config.decentd.local.port}/rpc`

// if (process.env.DECENTREMOTE) {
//   d = config.decentRemote
//   d.uri = `http://${config.decentd.remote.host}:${config.decentd.remote.port}/rpc`
// }
if (process.env.VPS === 'dev') {
  d = config.decentd.dev
  d.uri = `http://${config.decentd.dev.host}:${config.decentd.dev.port}/rpc`
  l.info(`dcore wallet at ${d.uri}`)
}
if (process.env.VPS === 'production') {
  d = config.decentd.production
  d.uri = `http://${config.decentd.production.host}:${config.decentd.production.port}/rpc`
}

let dOpts = {
  uri: d.uri,
  body: {
    jsonrpc: '2.0',
    params: [],
    id: 1
  }
}

const getInfo = async () => {
  dOpts.body.method = 'info'

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const importKey = async (params) => {
  dOpts.body.method = 'import_key'
  dOpts.body.params = params.split(',')

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const setPassword = async () => {
  dOpts.body.method = 'set_password'
  dOpts.body.params = [d.password]

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const unlock = async () => {
  dOpts.body.method = 'unlock'
  dOpts.body.params = [d.password]

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const isLocked = async () => {
  dOpts.body.method = 'is_locked'

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const isNew = async () => {
  dOpts.body.method = 'is_new'

  return r2.post(dOpts.uri, {
    json: dOpts.body
  }).json
}

const initialSetup = async (params) => {
  try {
    const is_new = await isNew()
    const accounts = await listMyAccounts()
    if (is_new.result === true &&
      accounts === 0) {
        const setPass = await setPassword()
        await unlock()
        l.info(setPass)
        const import_Key = await importKey(params)
        l.info({import_Key})

        return 'imported account'
      }

    if (is_new.result === false) {
      return 'already configured, remove wallet.json to start initialSetup'
    }

  } catch (err) {
    l.error(`initial setup ${err}`)
  }
}

const checkAvailability = async () => {
  try {
    const infoStatus = await getInfo()

    if (typeof infoStatus.result.head_block_num === 'number') {
      const islockedStatus = await isLocked()

      if (islockedStatus.result === true) {
        await unlock()
      }

      l.info(`decent connected & unlocked
        chain ${infoStatus.result.chain_id}
        account ${d.account}`)

      return 'ok'
    } else {
      l.warn(`decent not ready`)
    }
  } catch (err) {
    l.error(`decent not ready ${err}`)
  }
}

const getAccount = async (account) => {
  dOpts.body.method = 'get_account'
  dOpts.body.params = [account]
  const acc = await r2.post(dOpts.uri, {
    json: dOpts.body
  }).json

  return acc
}

const doesAccExists = async (account) => {
  const checkExistence = await getAccount(account)
  if (checkExistence.error && checkExistence.error.code === 1) {
    return checkExistence
  }
  return 1
}

const getBalance = async (account) => {
  dOpts.body.method = 'list_account_balances'
  dOpts.body.params = [account]
  const balance = await r2.post(dOpts.uri, {
    json: dOpts.body
  }).json

  if (!balance.result[0]) {
    return 0
  }

  return balance.result[0] && balance.result[0].amount
}

const listMyAccounts = async () => {
  dOpts.body.method = 'list_my_accounts'
  const accounts = await r2.post(dOpts.uri, {
    json: dOpts.body
  }).json

  // l.info({accounts})
  if (accounts.result.length === 0) {
    return 0
  }
  let allAccounts = []
  for (let a of accounts.result) {
    allAccounts.push(a.name)
  }

  return allAccounts
}

const listFirstAccount = async () => {
  const accounts = await listMyAccounts()
  const firstAccount = accounts[0]
  return firstAccount
}

const transfer = async (from, to, amountSat, asset) => {
  const exists = await doesAccExists(to)
  if (exists !== 1) {
    return exists
  }

  dOpts.body.method = 'transfer2'
  dOpts.body.params = [from , to, amountSat, asset, 'atm' , true]
  l.info(`${JSON.stringify(dOpts)}`)
  const transferOp = await r2.post(dOpts.uri, {
    json: dOpts.body
  }).json

  l.info({transferOp})

  return transferOp
}

module.exports = {
  doesAccExists,
  listFirstAccount,
  getBalance,
  getAccount,
  getInfo,
  transfer,
  isLocked,
  initialSetup,
  listMyAccounts,
  unlock,
  isNew,
  checkAvailability
}
