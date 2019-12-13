const router = require('koa-router')();
const services = require('../query')
const fs = require('fs');
const path = require('path')
const formidable = require('koa-formidable');

//检测是否包含该用户
const checkHasUser = async (user) => {
  let checkSql = `select resumeid from resumes where user='${user}';`;
  let queryRes = await services.query(checkSql);
  if (queryRes.length) {
    return true;
  } else {
    return false
  }
}

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
router.post('/upload/image', async (ctx, next) => {
  let form = formidable.parse(ctx.request);
  form.encoding = 'utf-8';
  form.keepExtensions = true;
  let resumeUser = '';
  const formImage = () => {
    return new Promise((resolve, reject) => {
      form((opt, {
        fields,
        files
      }) => {
        let user = fields.user;
        resumeUser = user;
        let uid = fields.uid;
        let filename = files.file.name;
        let uploadDir = 'static/upload/';
        let avatarName = uid + '_' + user + '_' + filename;
        mkdirs('static/upload', () => {
          fs.renameSync(files.file.path, uploadDir + avatarName); // 重命名
          resolve('http://localhost:7654/' + 'upload/' + avatarName)
          //+ uploadDir
        })
      })
    })
  }
  let url = await formImage();
  if (resumeUser) {
    const hasUser = await checkHasUser(resumeUser);
    console.log(hasUser);
    if (hasUser) {
      let updateSql = `update resumes set avatar='${url}' where user='${resumeUser}'; `
      let updateAvatar = await services.query(updateSql);
      if (updateAvatar.fieldCount == 0 && updateAvatar.warningCount==0) {
        console.log('头像更新成功');
      }
    } else {
      let insertSql = `insert into resumes (user,avatar) VALUES ('${resumeUser}', '${url}');`;
      let insertRes = await services.query(insertSql);
      if (insertRes.fieldCount == 0 && insertRes.warningCount==0) {
        console.log('用户头像更新');
      }
    }
  }
  let responseData = {
    code: 0,
    data: {
      imgUrl: url,
    },
    msg: ''
  }
  ctx.body = responseData;
})

module.exports = router;
