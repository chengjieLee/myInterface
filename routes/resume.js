const router = require('koa-router')();
const services = require('../query')
const xss = require('xss');

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
  const {
    resumeBase
  } = ctx.request.body
  let {
    name,
    education,
    profession,
    skillList
  } = resumeBase;
  let responseData = {};
  name = name ? xss(name) : '--';
  education = education ? xss(education) : '--';
  profession = profession ? xss(profession) : '--';
  let stringifySkillList = JSON.stringify(skillList);
  let hasUser = await checkHasUser(user);
  // 表中有该用户字段则更新  没有该用户字段 插入新数据
  if (hasUser) {  
    let updateSql = `update resumes set name='${name}',education='${education}',
    profession='${profession}',skills='${stringifySkillList}' where user='${user}';`;
    let updateRes = await services.query(updateSql);
    if (updateRes.fieldCount == 0 && updateRes.warningCount == 0) {
      console.log('保存成功')
      responseData = {
        code: 0,
        data: {},
        msg: '保存成功'
      }
    } else {
      responseData = {
        code: 1,
        msg: '保存失败'
      }
      console.log('updateRes', updateRes)
    }
  } else {
    // 插入语句
    let insertSql = `insert into resumes (user, name, education, skills, profession)
        values ('${user}','${name}','${eduction}','${stringifySkillList}','${profession}');`
    const insertRes = await services.query(insertSql);
    if (insertRes.fieldCount == 0 && insertRes.warningCount == 0) {
      console.log('插入成功')
      responseData = {
        code: 0,
        data: {},
        msg: '保存成功'
      }
    } else {
      responseData = {
        code: 1,
        msg: '保存失败'
      }
      console.log('insertRes', insertRes)
    }
  }
  ctx.body = responseData;
})

router.get('/resume', async (ctx) => {
  // 查不到返回个默认
  const user = ctx.header['x-token']

  let responseJson = {};
  let hasUser = await checkHasUser(user);

  if (hasUser) { // 包含该user时， 触发搜索查询 不包含则返回默认
    let queryResumeSql = `select * from resumes where user='${user}';`;
    let queryResume = await services.query(queryResumeSql);
    let resumeRes = queryResume[0];
    let resumeData = {
      avatar: resumeRes.avatar ? resumeRes.avatar : '',
      name: resumeRes.name ? resumeRes.name : '',
      education: resumeRes.education ? resumeRes.education : '',
      profession: resumeRes.profession ? resumeRes.profession : '',
      skillList: resumeRes.skills ? JSON.parse(resumeRes.skills) : [],
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
