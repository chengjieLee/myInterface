const router = require('koa-router')();
const services = require('../query')
const crypto = require('crypto')
const verify = require('../config/crypto');
const xss = require('xss');

router.get('/user', async function (ctx, next) {
  // console.log('ctx:', ctx, 'END');
  let Data = {
    code: 200,
    data: {
      nice: true,
      msg: 'success request'
    }
  }
  ctx.body = Data;
})
router.post('/user/login', async (ctx, next) => {
  const username = xss(ctx.request.body.username);
  const password = xss(ctx.request.body.password);
  
  let md5 = crypto.createHash('md5');
  
  let responeseData = {};
  if (!username && !password) {
    responeseData = {
      code: 2,
      msg: '缺少账号或密码'
    }
    ctx.body = responeseData;
    return;
  }
  // let insertSql = `insert into users (name,password) VALUES ('${username}','${md5.update(password).digest(verify)}');`
  let querySql = `select * from users where name='${username}';`
  const userVerify = await services.query(querySql);
  const verifyPass = md5.update(password).digest(verify);

  if(userVerify.length===0) {
    responeseData = {
      code: 1,
      msg: '没有找到该账号，建议注册，亲！'
    }
  }else {
    if(userVerify[0].password == verifyPass) {
      responeseData = {
        code: 0,
        token: username
      }
    }else {
      responeseData = {
        code: 1,
        msg: '密码不正确'
      }
    }
  }
  ctx.body = responeseData
})
router.get('/user/info', async (ctx, next) => {
  const params = ctx.query;
  console.log(params);
  const response = {
    code: 0,
    data: {
      name: 'xukai',
      avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif" 
    } 
  }
  ctx.body = response;
})
router.post('/user/logout', async (ctx, next) => {
  const resData = {
    data: 'success',
    code: 0
  }
  ctx.body = resData;
})
module.exports = router;
