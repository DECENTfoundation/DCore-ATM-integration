const CWD = process.cwd()
const config = require(`${CWD}/config.json`)
const fastify = require('fastify')()
const validator = require('validator')
const pino = require('pino')
global.l = pino(config.pino)
const decentd = require(`${CWD}/lib/decentd.js`)

let d = config.decentd.local
if (process.env.VPS === 'dev') {
  d = config.decentd.dev
}
if (process.env.VPS === 'production') {
  d = config.decentd.production
}

fastify.get('/', (request, reply) => {
  l.info(`GET /`)
  reply.send({ everything: "is_fine"})
})

fastify.get('/d/:method', async (request, reply) => {
  l.info(request.params.method)
  const d = await decentd[request.params.method]()
  reply.send(d)
})

fastify.get('/de/:method/:p1', async (request, reply) => {
  l.info(request.params.method)
  const d = await decentd[request.params.method](request.params.p1)
  reply.send(d)
})

fastify.get('/help', (request, reply) => {
  reply.send({
    amount: "in satoshi",
    username: "from config",
    password: "from config",
    address: "valid Decent address"})
})

fastify.get('/info', async (request, reply) => {
  const info = await decentd.getInfo()
  return reply.send(info)
})

fastify.get('/balance', async (request, reply) => {
  const accounts = await decentd.listMyAccounts()
  const balance = await decentd.getBalance(accounts[0])
  l.info(`first account ${accounts[0]} balance ${balance}`)
  return reply.send({balance})
})

// fastify.get('/balance/:account', async (request, reply) => {
//   if (request.params.account) {
//     const balance = await decentd.getBalance(request.params.account)
//     l.info(`GET /balance - ${balance}`)
//     return reply.send({balance})
//   }
//
//   const balance = await decentd.getBalance('public-account-1')
//   l.info(`GET /balance - ${balance}`)
//   return reply.send({balance})
// })

fastify.get('/accounts', async (request, reply) => {
  const accounts = await decentd.listMyAccounts()
  l.info(`GET /accounts - ${accounts}`)
  return reply.send({accounts})
})

fastify.post('/buy', async (request, reply) => {
  // if (request.headers.host !== `localhost:${config.port}`) {
  //   return reply.send({ error: "not allowed host"})
  // }

  if (request.body === null) {
    return reply.send({ error: "body is empty"})
  }

  const b = request.body

  if (b.username !== config.auth.username
    || b.password !== config.auth.password) {
    return reply.send({ error: "username or password did not match configured credentials"})
  }

  if (!Number.isInteger(parseInt(b.amount))) {
    l.info(`${typeof b.amount}`)
    return reply.send({ error: "amount is not integer"})
  }

  if (parseFloat(b.amount) === 0) {
    l.info(`requested to send 0 DCT`)
    return reply.send({ error: "not issuing transaction for 0 DCT"})
  }

  const accountRegexp = /^(?=.{5,63}$)([a-z][a-z0-9-]+[a-z0-9])(\.[a-z][a-z0-9-]+[a-z0-9])*$/

  if (!b.address.match(accountRegexp)) {
    l.info(`not valid Decent account address ${b.address}`)
    return reply.send({ error: "not valid decent account address"})
  }

  const transferOp = await decentd.transfer(await decentd.listFirstAccount(), b.address, b.amount, 'DCT')
  let r
  if (transferOp.error) {
    l.error(`account ${b.address} not found`)
    reply
      .status(404)
      .send({b, error: transferOp.error, transferOp})
  }
  if (transferOp.result) {
    r = {
      amount_left_in_wallet: await decentd.getBalance(await decentd.listFirstAccount()),
      txid: transferOp.result[0],
      to: transferOp.result[1].operations[0][1].to,
      from: transferOp.result[1].operations[0][1].from,
      amount: transferOp.result[1].operations[0][1].amount.amount,
      asset: transferOp.result[1].operations[0][1].amount.asset_id
    }
      l.info({b, r})
      reply.send({b, r, transferOp})
    }
})

fastify.listen(config.server.port, config.server.host, async (err) => {
  l.info(`server listening @ ${config.server.host}:${config.server.port}`)
  const available = await decentd.checkAvailability()
  if (available === 'ok') {
    l.info(`wallet is ready & unlocked`)
  }
  if (err) {
    l.error({err})
    fastify.log.error(err)
    process.exit(1)
  }
})
