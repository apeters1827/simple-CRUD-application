import 'dotenv/config';
import gulp from 'gulp';
import repl from 'repl';
import getServer from '.';
import container from './container';

gulp.task('console', () => {
  const replServer = repl.start({
    prompt: '> ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});

gulp.task('initDb', async () => {
  const { sequelize } = container.db;
  await sequelize.sync({ force: true });
  await sequelize.close();
});

gulp.task('server', () => {
  const port = process.env.PORT || 3000;
  getServer().listen(port, () => {
    console.log(`Listening on ${port}`);
  });
});
