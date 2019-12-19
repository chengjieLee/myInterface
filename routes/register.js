const captchapng = require('captchapng')

const router = require('koa-router')();
const services = require('../query')
const xss = require('xss');
const verify = require('../config/crypto');
const crypto = require('crypto')



//新建文件
const mkdirs = (dirname, callback) => {
  fs.exists(dirname, (exists) => {
    if (exists) {
      callback();
    } else {
      mkdirs(path.dirname(dirname), () => {
        fs.mkdir(dirname, callback)
      })
    }
  })
}
const includeUser = async (username) => {
  let queryStr = `select name from users where name='${username}';`
  let queryResult = await services.query(queryStr);
  if (queryResult.length === 0) {
    return false;
  } else {
    return true;
  }
}
router.get('/register/captcha', async (ctx, next) => {
  const cap = parseInt(Math.random() * 9000 + 1000); // *9000为了 使 个十百位皆有出现可能 +1000 补充千位
  const p = new captchapng(80, 30, cap);
  p.color(255, 255, 0, 0);
  p.color(255, 255, 255, 255);
  const base64 = p.getBase64();

  ctx.cookies.set('captcha', cap, {
    maxAge: 360000,
    // httpOnly: true
    overwrite: false
  });
  ctx.status = 200;
  let responseData = {
    code: 0,
    data: {
      imgUrl: 'data:image/png;base64,' + base64
    },
    msg: ''
  }
  ctx.body = responseData;
})
router.post('/register', async (ctx) => {
  const {
    registerFormData
  } = ctx.request.body
  const username = xss(registerFormData.username);
  const password = xss(registerFormData.password);
  const captcha = xss(registerFormData.captcha);
  const captchaStr = ctx.cookies.get('captcha');
  console.log(captchaStr)
  let md5 = crypto.createHash('md5');

  let responseData = {};
  let isInclude = await includeUser(username);
  if (captchaStr !== captcha) {
    responseData = {
      code: 1,
      data:{},
      msg:'验证码错误或已过期'
    }
    ctx.body = responseData;
    return;
  }
  if (isInclude === false) {
    let insertSql = `insert into users (name,password) VALUES ('${username}','${md5.update(password).digest(verify)}');`
    const insertResult = await services.query(insertSql);
    if(insertResult.fieldCount==0&&insertResult.warningCount==0){
      responseData = {
        code: 0,
        data:{},
        msg: '注册成功'
      }
    }else {
      console.log(insertResult);
    }
  } else {
    responseData = {
      code: 1,
      data: {},
      msg: '该账号已被注册'
    }
  }

  ctx.body = responseData;
})
module.exports = router;
