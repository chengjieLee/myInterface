const compose = require('koa-compose')
const glob = require('glob')
const { resolve } = require('path')

module.exports = () => {
  let routes = [];
  glob.sync(resolve(__dirname, './', '**/*.js'))
      .filter(value => !value.includes('index.js'))
      .map(router => {
        routes.push(require(router).routes())
        routes.push(require(router).allowedMethods())
      })
  return compose(routes)
}

