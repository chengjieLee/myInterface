const Koa = require('koa')
const router = require('koa-router')()
const app = new Koa()

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')
const cors = require('koa-cors')
const static = require('koa-static')
const config = require('./config')
const registerRouter = require('./routes')

onerror(app)

// middlewares
app.use(bodyparser({
  jsonLimit: '5mb',
  formLimit: '4096kb'
}))
  .use(json())
  .use(logger())
  .use(cors())
  .use(static((__dirname+'/static/')))
  // .use(require('koa-static')(__dirname + '/public'))
  .use(views(path.join(__dirname, '/views'), {
    options: {settings: {views: path.join(__dirname, 'views')}},
    map: {'ejs': 'ejs'},
    extension: 'ejs'
  }))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(registerRouter())
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

// home
router.get('/', async (ctx, next) => {
  ctx.state = {
    title: 'Koa2'
  }
  await ctx.render('index', ctx.state)
})


app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://47.103.116.19:${config.port}`)
})
