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
const cors = require('koa-cors')        // 跨域
const static = require('koa-static')    // 静态资源
const config = require('./config')
const registerRouter = require('./routes')  // 路由注册

onerror(app)

// middlewares
app.use(bodyparser({           // 上传大小限制
  jsonLimit: '5mb',
  formLimit: '4096kb'
}))
  .use(json())
  .use(logger())
  .use(cors({
    origin: function(ctx) {
      const whiteList = ['http://47.103.116.19', 'http://chengjielee.top', 'https://chengjielee.top']; // 允许cookie时 origin不可以设置为*（安全问题）
      let url = ctx.header.referer.substr(0,ctx.header.referer.length - 1);
      if(whiteList.includes(url)){
          return url //注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了
      }else {
        return 'http://chengjielee.top'
      }
    },
    credentials: true
  }))
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
