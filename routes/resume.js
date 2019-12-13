const router = require('koa-router')();
const services = require('../query')

const checkHasUser = async (user) => {
  let checkSql = `select resumeid from resumes where user='${user}';`;
  let queryRes = await services.query(checkSql);
  if (queryRes.length) {
    return true;
  } else {
    return false
  }
}

router.post('/resume/edit', async (ctx, next) => {
  const user = ctx.header['x-token']
  let hasUser = null;
  const { resumeBase } = ctx.request.body

  hasUser = await checkHasUser();
  if (hasUser) {

  } else {

  }
  let responseData = {
    code: 0,
    data: {},
    msg: ''
  }
  ctx.body = responseData;
})

router.get('/resume', async (ctx) => {
  // 查不到返回个默认
  const user = ctx.header['x-token']

  let responseJson = {};
  let hasUser = await checkHasUser(user);

  if (hasUser) {
    let queryResumeSql = `select * from resumes where user='${user}';`;
    let queryResume =await services.query(queryResumeSql);
    console.log('queryResume', queryResume);
    let resumeRes = queryResume[0];
    console.log('resumeRes', resumeRes);
    let resumeData = {
      avatar: resumeRes.avatar ? resumeRes.avatar : '',
      name: resumeRes.name ? resumeRes.name : '',
      education: resumeRes.education ? resumeRes.education : '',
      profession: resumeRes.profession ? resumeRes.profession : '',
      skills: resumeRes.skills ? JSON.parse(resumeRes.skills) : [],
      workExperience: resumeRes.workexperience ? JSON.parse(resumeRes.workexperience) : [],
      project: resumeRes.project ? JSON.parse(resumeRes.project) : []
    }
    responseJson = {
      code: 0,
      msg: 'success',
      data: resumeData
    }
  } else {
    let initResume = {
      avatar: '',
      name: '',
      education: '',
      profession: '',
      skills: [],
      workExperience: [],
      project: []
    }
    responseJson = {
      data: initResume,
      msg: 'success',
      code: 0
    }
  }
  ctx.body = responseJson;
})

module.exports = router;
