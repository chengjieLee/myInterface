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

// 修改个人资料
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
        values ('${user}','${name}','${education}','${stringifySkillList}','${profession}');`
    const insertRes = await services.query(insertSql);
    if (insertRes.fieldCount == 0 && insertRes.warningCount == 0) {
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

// 个人技能查询 个人简历资料查询
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

// 个人技能查询
router.get('/resume/skill', async (ctx) => {
  const user = ctx.header['x-token']
  let responseJson = {};
  let hasUser = await checkHasUser(user);
  if (hasUser) { // 包含该user时， 触发搜索查询 不包含则返回默认
    let queryResumeSql = `select skills from resumes where user='${user}';`;
    let queryResume = await services.query(queryResumeSql);
    let resumeRes = queryResume[0];
    let resumeData = {
      skillList: resumeRes.skills ? JSON.parse(resumeRes.skills) : [],
    }
    responseJson = {
      code: 0,
      msg: 'success',
      data: resumeData
    }
  } else {
    let initResume = {
      skills: [],
    }
    responseJson = {
      data: initResume,
      msg: 'success',
      code: 0
    }
  }
  ctx.body = responseJson;
})

// 新增个人经历
router.post('/resume/addExperience', async (ctx) => {
  const pageName = ctx.request.body.pageName;
  let responseJson = {};
  let {
    name,
    timeRange,
    workPosition,
    description
  } = ctx.request.body.experienceData;
  name = xss(name);
  workPosition = xss(workPosition);
  description = xss(description);
  const user = ctx.header['x-token'];
  if (pageName === 'work') {
    let insertSql = `insert into experience_work (user, experience_name, timeRange, workPosition, description)
    values ('${user}','${name}', '${timeRange}','${workPosition}','${description}');`;
    try {
      const insertResult = await services.query(insertSql);
      if (insertResult.warningCount == 0 && insertResult.errorCount == 0) {
        responseJson = {
          code: 0,
          msg: 'success',
          data: {}
        }
      }
    } catch (err) {
      responseJson = {
        code: 1,
        msg: err,
        data: {}
      }
    }
    ctx.body = responseJson
  } else if (pageName === 'project') {
    let insertSql = `insert into experience_project (user, experience_name, timeRange, description)
    values ('${user}','${name}', '${timeRange}', '${description}');`;
    try {
      const insertResult = await services.query(insertSql);
      if (insertResult.warningCount == 0 && insertResult.errorCount == 0) {
        responseJson = {
          code: 0,
          msg: 'success',
          data: {}
        }
      }
    } catch (err) {
      responseJson = {
        code: 1,
        msg: err,
        data: {}
      }
    }
    ctx.body = responseJson
  }
})

// 获取经历列表
router.get('/resume/experienceList', async (ctx) => {
  const user = ctx.header['x-token'];
  const { id } = ctx.query;
  const { pagename } = ctx.query;
  let responseJson = {};
  if (pagename === 'project') {
    if (id) {  // 传入ID  查询单个信息
      let querySql = `select experience_name, timeRange, description from experience_project where user='${user}' and experience_id=${id};`;
      const queryResult = await services.query(querySql);
      let tempData = queryResult[0]
      let experienceData={
        name: tempData.experience_name,
        id: tempData.experience_id,
        timeRange: tempData.timeRange,
        description:tempData.description
      }
      responseJson = {
        code: 0,
        data: experienceData,
        msg: 'success'
      }
    } else {
      let querySql = `select experience_id, experience_name, timeRange, description from experience_project where user='${user}';`;
      const queryResult = await services.query(querySql);
      if (queryResult.length > 0) {
        let experienceData = queryResult.map(item => {
          return {
            name: item.experience_name,
            id: item.experience_id,
            timeRange: item.timeRange,
            description: item.description
          }
        })
        responseJson = {
          code: 0,
          data: experienceData,
          msg:'success'
        }
      }else {
        responseJson = {
          code: 0,
          data: [],
          msg:'success'
        }
      }
    }
    ctx.body = responseJson
  } else if (pagename === 'work') {
    if (id) {
      let querySql = `select experience_name, timeRange,workPosition, description from experience_work where user='${user}' and experience_id=${id};`;
      const queryResult = await services.query(querySql);
      let tempData = queryResult[0]
      let experienceData={
        name: tempData.experience_name,
        id: tempData.experience_id,
        timeRange: tempData.timeRange,
        workPosition: tempData.workPosition,
        description:tempData.description
      }
      responseJson = {
        code: 0,
        data: experienceData,
        msg: 'success'
      }
    } else {
      let querySql = `select experience_id, workPosition, experience_name, timeRange, description from experience_work where user='${user}';`;
      const queryResult = await services.query(querySql);
      if (queryResult.length > 0) {
        let experienceData = queryResult.map(item => {
          return {
            name: item.experience_name,
            id: item.experience_id,
            timeRange: item.timeRange,
            workPosition: item.workPosition,
            description: item.description
          }
        })
        responseJson = {
          code: 0,
          data: experienceData,
          msg:'success'
        }
      }else {
        responseJson = {
          code: 0,
          data: [],
          msg:'success'
        }
      }
    }
    ctx.body = responseJson

  }
})

// 编辑经历
router.post('/resume/editExperience', async (ctx) => {
  const user = ctx.header['x-token'];
  const {
    experienceBase
  } = ctx.request.body

  let { experienceId, pageName, timeRange, name, workPosition, description } = experienceBase;
  let responseJson = {};
  name = xss(name);
  workPosition = xss(workPosition);
  description = xss(description);
  if (pageName === 'work') {
    let updateSql = `update experience_work set experience_name='${name}', timeRange='${timeRange}', workPosition='${workPosition}', description='${description}' where user='${user}' and experience_id=${experienceId};`;
    try {
      const updateResult = await services.query(updateSql);
      if (updateResult.warningCount == 0 && updateResult.fieldCount == 0) {
        responseJson = {
          code: 0,
          msg: 'success',
          data: {}
        }
      }
    } catch (err) {
      responseJson = {
        code: 1,
        msg: err,
        data: {}
      }
    }
    ctx.body = responseJson
  } else if (pageName === 'project') {
    let updateSql = `update experience_project set experience_name='${name}', timeRange='${timeRange}', workPosition='${workPosition}', description='${description}' where user='${user}' and experience_id=${experienceId};`;
    try {
      const updateResult = await services.query(updateSql);
      if (updateResult.warningCount == 0 && updateResult.fieldCount == 0) {
        responseJson = {
          code: 0,
          msg: 'success',
          data: {}
        }
      }
    } catch (err) {
      responseJson = {
        code: 1,
        msg: err,
        data: {}
      }
    }
    ctx.body = responseJson
  }
})
module.exports = router;
