import encrypt from '../lib/secure';
import buildFormObj, { buildFlashMsg } from '../lib';

export default (router, db) => {
  const { User } = db;
  router
    .get('session#new', '/session/new', (ctx) => {
      const { email } = ctx.session;
      delete ctx.session.email;
      ctx.render('sessions/new', { formObj: buildFormObj(email) });
    })
    .post('session#create', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({ where: { email } });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.flash.set(buildFlashMsg('Wrong email or password!', 'danger'));
      ctx.session.email = email;
      ctx.redirect(router.url('session#new'));
    })
    .delete('session#destroy', '/session', (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
