import welcome from './root';
import users from './users';
import user from './user';
import sessions from './sessions';
import notFound from './notFound';

const controllers = [welcome, users, user, sessions, notFound];

export default (router, { db }) => controllers.forEach(f => f(router, db));
