import buildFormObj, { buildFlashMsg } from '../lib';

export default (router, db) => {
  const { User } = db;
  router
    .get('users#index', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users/index', { users });
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { formObj: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set(buildFlashMsg('Your profile has been created', 'success'));
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('users/new', { formObj: buildFormObj(user, e) });
      }
    })
    .get('users#show', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      try {
        const user = await User.findByPk(id);
        const isLoggedUser = user.id === ctx.session.userId;
        ctx.render('users/user', { user, isLoggedUser });
      } catch (e) {
        ctx.render('pages/notFound');
      }
    });
};
