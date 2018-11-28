import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import Rollbar from 'rollbar';
import path from 'path';
import _ from 'lodash';

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
  
};
