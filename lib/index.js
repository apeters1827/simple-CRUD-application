import _ from 'lodash';

export default (object, error = { errors: [] }) => ({
  name: 'form',
  object,
  errors: _.groupBy(error.errors, 'path'),
});

export const buildFlashMsg = (text, type = 'info') => ({ text, type });

export const requiredAuth = async (ctx, next) => {
  if (!ctx.state.isSignedIn()) {
    if (ctx.req.method !== 'GET') {
      ctx.throw(401);
    }
    ctx.flash.set(buildFlashMsg('Authentication is required', 'info'));
    ctx.redirect(ctx.router.url('session#new'));
    return;
  }
  await next();
};
