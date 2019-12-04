const router = require('koa-router')();

router.get('/welcome', async function (ctx, next) {
  // console.log('ctx:', ctx, 'END');
  ctx.state = {
    title: 'koa2 welcome'
  };

  await ctx.render('welcome', {
    title: ctx.state
  });
})


module.exports = router;
