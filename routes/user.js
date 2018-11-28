import encrypt from '../lib/secure';
import buildFormObj, { buildFlashMsg, requiredAuth } from '../lib';

export default (router, db) => {
  const { User } = db;
  router
    .get('profile#edit', '/account/profile/edit', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      ctx.render('users/profile', { user, formObj: buildFormObj(user) });
    })
    .put('profile#update', '/account/profile', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      const { form } = ctx.request.body;
      try {
        await user.update(form, { fields: ['email', 'firstName', 'lastName'] });
        ctx.flash.set(buildFlashMsg('Your profile has been updated', 'success'));
        ctx.redirect(router.url('users#show', user.id));
      } catch (e) {
        ctx.flash.set(buildFlashMsg('there was errors', 'danger'));
        ctx.render('users/profile', { user, formObj: buildFormObj(user, e) });
      }
    })
    .get('profilePassword#edit', '/account/password/edit', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      ctx.render('users/changePassword', { user, formObj: buildFormObj(user) });
    })
    .put('profilePassword#update', '/account/password', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      const { form } = ctx.request.body;
      const { oldPassword, newPassword, confirmedNewPassword } = form;
      if (user.passwordDigest !== encrypt(oldPassword)) {
        ctx.flash.set(buildFlashMsg('Password is wrong', 'danger'));
        ctx.redirect(router.url('profilePassword#edit'));
      } else if (newPassword !== confirmedNewPassword) {
        ctx.flash.set(buildFlashMsg("Password confirmation doesn't match the password", 'danger'));
        ctx.redirect(router.url('profilePassword#edit'));
      } else {
        try {
          await user.update({ password: newPassword });
          ctx.flash.set(buildFlashMsg('Your password was successfully changed', 'success'));
          ctx.redirect(router.url('users#show', user.id));
        } catch (e) {
          ctx.flash.set(buildFlashMsg('There was errors', 'danger'));
          ctx.redirect(router.url('profilePassword#edit'));
        }
      }
    })
    .get('profile#delete', '/account/profile/delete', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      ctx.render('users/delete', { user });
    })
    .delete('profile#destroy', '/account/profile', requiredAuth, async (ctx) => {
      const id = ctx.session.userId;
      const user = await User.findByPk(id);
      try {
        await user.destroy();
        ctx.flash.set(buildFlashMsg('Your profile was deleted', 'info'));
        delete ctx.session.userId;
      } catch (e) {
        ctx.status = 422;
        ctx.flash.set(buildFlashMsg('There were errors', 'danger'));
        console.error(e);
      }
      ctx.redirect(router.url('root'));
    });
};
