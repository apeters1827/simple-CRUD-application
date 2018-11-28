import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaWebpack from 'koa-webpack';
import serve from 'koa-static';
import koaLogger from 'koa-logger';
import session from 'koa-session';
import flash from 'koa-flash-simple';
import bodyParser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import Rollbar from 'rollbar';
import path from 'path';
import _ from 'lodash';

import config from './webpack.config.babel';
import container from './container';

export default () => {
  const app = new Koa();
  const router = new Router();
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR,
    captureUncaught: true,
    captureUnhandledRejections: true,
    reportLevel: 'error',
  });
  const pug = new Pug({
    viewPath: path.resolve(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    locals: [],
    basedir: path.resolve(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });

  app.keys = [process.env.COOKIE_SECRET];
  container.addRoutes(router, container);

  if (process.env.NODE_ENV === 'development') {
    app.use(koaWebpack({ config }));
  }
  app
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        rollbar.error(err, ctx.request);
      }
    })
    .use(koaLogger())
    .use(bodyParser())
    .use(session(app))
    .use(flash())
    .use(methodOverride((req) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        return req.body._method; // eslint-disable-line
      }
      return null;
    }))
    .use(async (ctx, next) => {
      ctx.state = {
        flash: ctx.flash,
        isSignedIn: () => ctx.session.userId !== undefined,
        userId: ctx.session.userId,
      };
      await next();
    })
    .use(serve(path.resolve(__dirname, 'public')))
    .use(router.allowedMethods())
    .use(router.routes());

  pug.use(app);

  return app;
};
