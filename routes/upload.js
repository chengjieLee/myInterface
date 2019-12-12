const router = require('koa-router')();
// const services = require('../query')
const fs = require('fs');
const path = require('path')
const formidable = require('koa-formidable');


//新建文件
const mkdirs = (dirname, callback) => {
  fs.exists(dirname,(exists) => {
    if(exists){
      callback();
    }else {
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
  formImage = () => {
    return new Promise((resolve, reject) => {
      form((opt, {fields, files}) => {
        let user = fields.user;
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