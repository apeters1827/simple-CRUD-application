export default (router) => {
  router
    .all('notFound', '*', (ctx) => {
      ctx.status = 404;
      ctx.render('pages/notFound');
    });
};
