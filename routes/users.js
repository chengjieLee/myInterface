const router = require('koa-router')();
const services = require('../query')
const crypto = require('crypto')
const verify = require('../config/crypto');
const xss = require('xss');

const queryAvatar = async (user) => {
  let querySql = `select avatar from resumes where user='${user}';`;
  let avatarResult = await services.query(querySql);
  if(avatarResult.length > 0 && avatarResult[0].avatar){
    return avatarResult[0].avatar;
  }else {
    return;
  }
}

router.get('/user/list', async function (ctx, next) {
  // console.log('ctx:', ctx, 'END');
  let responseJson = {};
  if(ctx.cookies.get('vue_admin_token')!== 'chengjie') {
    responseJson = {
      code: 1,
      data: [],
      msg: '没有查询权限'
    }
  }else {
    let UserSql = `select name from users`;
    const sqlRes = await services.query(UserSql);
    let userList = sqlRes.map(item => {
      return {
        user: item.name
      }
    })
    responseJson = {
      code: 0,
      data:userList,
      msg: 'success'
    }
  }
 
  ctx.body = responseJson;
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
  let querySql = `select * from users where name='${username}';`
  const userVerify = await services.query(querySql);
  const verifyPass = md5.update(password).digest(verify);

  if (userVerify.length === 0) {
    responeseData = {
      code: 1,
      msg: '没有找到该账号，建议注册，亲！'
    }
  } else {
    if (userVerify[0].password == verifyPass) {
      responeseData = {
        code: 0,
        token: username
      }
    } else {
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
  const name = params.token;
  let response = {};
  let avatarUrl = "http://localhost:7654/upload/Default.jpg";
  let avatarResult = await queryAvatar(name)
  if (avatarResult){
    avatarUrl = avatarResult;
  }

  if (name == 'chengjie') {
    response = {
      code: 0,
      data: {
        name: name,
        admin: true,
        avatar: avatarUrl
      }
    }
  } else {
    response = {
      code: 0,
      data: {
        name: name,
        avatar: avatarUrl
      }
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
router.delete('/user/delete', async (ctx) => {
  const { username } = ctx.query;
  if(username) {
    let deleteSql = `DELETE FROM users where name='${username}';`
    const deleteRes = await services.query(deleteSql);
    let responseJson = {};
    if(deleteRes.fieldCount==0&&deleteRes.warningCount==0) {
      responseJson = {
        code: 0,
        msg: '移除成功'
      }
    }else {
      responseJson = {
        code: 1,
        msg: '移除失败'
      }
    }
    ctx.body = responseJson;
  }else {
    let responseJson = {
      code: 1,
      msg: '未传入用户名'
    }
    ctx.body = responseJson;
  }
})
module.exports = router;
