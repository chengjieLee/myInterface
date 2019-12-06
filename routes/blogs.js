const router = require('koa-router')();
const services = require('../query')
// const crypto = require('crypto')
// const verify = require('../config/crypto');
// const xss = require('xss');

router.post('/blog/add', async (ctx) => {
  const {user, blogContent, blogTitle, blogAuthor} = ctx.request.body;
  let createTime = new Date().toLocaleDateString();
  let resData = {}
  if(!user||!blogContent||!blogTitle||!blogAuthor){
    resData = {
      code: 1,
      data:null,
      msg: 'blog参数不正确'
    }
  }else {
    let insertSql = `insert into blogs (user,blogcontent,blogtitle,blogauthor,createtime) VALUES ('${user}','${blogContent}','${blogTitle}','${blogAuthor}','${createTime}');`
    const insertRes = await services.query(insertSql);
    if(insertRes.fieldCount==0&&insertRes.warningCount==0){
      resData={
        code: 0,
        msg: 'success'
      }
    }else {
      resData={
        code: 2,
        msg: insertRes.message
      }
    }
  }
  ctx.body = resData
})

router.get('/blog/list', async (ctx) => {
  const queryObj = ctx.query;
  const isEmptyObject = (obj) => {
    for (var i in obj) {
      return true;
    }
    return false
  }
  let haveQueryObj = isEmptyObject(queryObj)

  if(haveQueryObj) {
    let querySql = `select blogtitle,blogauthor,createtime,id from blogs where user='${queryObj.user}';`
    const queryRes = await services.query(querySql);
    let responseData = {
      code: 0,
      data: [] 
    }
    responseData.data = queryRes.map(item => {
      return {
        blogTitle: item.blogtitle,
        author: item.blogauthor,
        createTime: item.createtime,
        blogId: item.id
      }
    })
    ctx.body = responseData;
  }else {
    let querySql = `select blogtitle,blogauthor,createtime,id from blogs;` ;
    const queryRes = await services.query(querySql);
    let responseData = {
      code: 0,
      data: [] 
    }
    responseData.data = queryRes.map(item => {
      return {
        blogTitle: item.blogtitle,
        author: item.blogauthor,
        createTime: item.createtime,
        blogId: item.id
      }
    })
    ctx.body = responseData;
  }
})
router.get('/blog/detail', async (ctx)=> {
  const { blogId }  = ctx.query;

  if(blogId !== undefined) {
    let querySql = `select blogcontent from blogs where id='${blogId}';` ;
    const queryRes = await services.query(querySql);
    let responseData = {
      code: 0,
      data:{
        blogContent: queryRes[0].blogcontent
      }
    }
    ctx.body = responseData;
  }else {
    let responseData = {
      code: 1,
      data:{},
      msg: '请传入blog ID!'
    }
    ctx.body = responseData
  }

})

module.exports = router;