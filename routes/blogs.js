const router = require('koa-router')();
const services = require('../query')
// const crypto = require('crypto')
// const verify = require('../config/crypto');
const xss = require('xss');

router.post('/blog/add', async (ctx) => {
  let {
    user,
    blogContent,
    blogTitle,
    blogAuthor
  } = ctx.request.body;
  blogTitle = xss(blogTitle);

  blogContent = blogContent.replace(/"/g,'\\\"');

  let createTime = new Date().toLocaleDateString();

  let resData = {}
  if (!user || !blogContent || !blogTitle || !blogAuthor) {
    resData = {
      code: 1,
      data: null,
      msg: 'blog参数不正确'
    }
  } else {
    let insertSql = `insert into blogs (user,blogcontent,blogtitle,blogauthor,createtime,isdelete) VALUES ("${user}","${blogContent}","${blogTitle}","${blogAuthor}","${createTime}",0);`
    const insertRes = await services.query(insertSql);
    if (insertRes.fieldCount == 0 && insertRes.warningCount == 0) {
      resData = {
        code: 0,
        msg: 'success'
      }
    } else {
      resData = {
        code: 2,
        msg: insertRes.message
      }
    }
  }
  ctx.body = resData
})
router.post('/blog/modify', async (ctx) => {
  const {
    user,
    blogAuthor,
    blogId
  } = ctx.request.body;
  let blogTitle = xss(ctx.request.body.blogTitle);
  let blogContent = ctx.request.body.blogContent;
  blogContent = blogContent.replace(/\\\"|"/g,'\\\"');
  let updateSql = `update blogs set blogcontent="${blogContent}",blogtitle="${blogTitle}",
  blogauthor="${blogAuthor}" where user="${user}" and id=${blogId};`;
  const updateRes = await services.query(updateSql);
  if(updateRes.fieldCount == 0 && updateRes.warningCount == 0) {
    let responseJson = {
      code: 0,
      msg: 'success'
    }
    ctx.body = responseJson
  }else {
    ctx.body = {
      code: 1,
      msg: 'error'
    }
  }
})
router.get('/blog/list', async (ctx) => {
  const queryObj = ctx.query;
  const isEmptyObject = (obj) => {
    for (var i in obj) {
      return true;
    }
    return false
  }
  let haveQueryObj = isEmptyObject(queryObj);
  if (haveQueryObj) {
    let querySql = `select blogtitle,blogauthor,createtime,id,user from blogs where user='${queryObj.user}' and isdelete=0 Order by id desc;`
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
        blogId: item.id,
        user: item.user
      }
    })
    ctx.body = responseData;
  } else {
    let querySql = `select blogtitle,blogauthor,createtime,id,user from blogs where isdelete=0 Order by id DESC;`;
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
        blogId: item.id,
        user: item.user
      }
    })
    ctx.body = responseData;
  }
})
router.get('/blog/detail', async (ctx) => {
  const {
    blogId
  } = ctx.query;
  if (blogId !== undefined) {
    let querySql = `select blogcontent,blogtitle,blogauthor,createtime from blogs where id='${blogId}';`;
    const queryRes = await services.query(querySql);
    let responseData = {};
    if (queryRes.length) {
      responseData = {
        code: 0,
        data: {
          blogContent: queryRes[0].blogcontent,
          blogTitle: queryRes[0].blogtitle,
          author: queryRes[0].blogauthor,
          createTime: queryRes[0].createtime
        }
      }
    } else {
      responseData = {
        code: 1,
        data: {},
        msg: '没找到相关文章'
      }
    }
    ctx.body = responseData;
  } else {
    let responseData = {
      code: 1,
      data: {},
      msg: '请传入blog ID!'
    }
    ctx.body = responseData
  }

})

router.delete('/blog/delete', async (ctx) => {
  const { blogId } = ctx.query;
  if (blogId) {
    let mildDeleteSql = `update blogs set isdelete=1 where id=${blogId};`;
    const mildDeleteRes = await services.query(mildDeleteSql);
    if(mildDeleteRes.fieldCount==0&&mildDeleteRes.warningCount==0){
      let responseJson = {
        code: 0,
        data: {},
        msg: '删除成功'
      }
      ctx.body = responseJson
    }
  } else {
    let responseJson = {
      code: 1,
      data: {},
      msg: '删除失败'
    }
    ctx.body = responseJson
  }
})

router.get('/blog/permission', async(ctx) => {
  const user = ctx.header['x-token'];
  const id = ctx.request.query.id;
  let safeId = xss(id);
  let querySql = `select id from blogs where id=${safeId} and user='${user}';`;
  const result = await services.query(querySql);
  if(result.length > 0) {
    ctx.body = {
      code: 0,
      msg: 'success'
    }
  }else {
    ctx.body = {
      code: 1,
      msg: 'error'
    }
  }
})

module.exports = router;
