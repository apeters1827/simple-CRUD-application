import 'dotenv/config';
import request from 'supertest';
import faker from 'faker';
import app from '..';
import container from '../container';

const { db } = container;

describe('simple pages', () => {
  let server;
  beforeAll(async () => {
    server = app().listen();
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('root', async () => {
    await request.agent(server)
      .get('/')
      .expect(200);
  });

  it('not found', async () => {
    await request.agent(server)
      .get('/notFound')
      .expect(404);
  });
});

describe('session', () => {
  const userData = {
    email: 'test@mail.com',
    password: 'test',
  };

  let server;
  let agent;
  beforeAll(async () => {
    server = app().listen();
    agent = request.agent(server);
    await db.sequelize.sync({ force: true });
    await db.User.create(userData);
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('#new', async () => {
    await agent
      .get('/session/new')
      .expect(200);
  });

  it('#create fail', async () => {
    await agent
      .post('/session')
      .send({ form: {} })
      .expect('location', '/session/new');
  });

  it('#create success', async () => {
    await agent
      .post('/session')
      .send({ form: userData })
      .expect('location', '/');
  });

  it('#destroy', async () => {
    await agent
      .delete('/session')
      .expect(302);
  });
});

describe('user', () => {
  let server;
  let agent;
  beforeAll(async () => {
    server = app().listen();
    agent = request.agent(server);
    await db.sequelize.sync({ force: true });
  });

  afterAll((done) => {
    server.close();
    done();
  });

  it('#new', async () => {
    await agent
      .get('/users/new')
      .expect(200);
  });

  it('#create fail', async () => {
    await agent
      .post('/users')
      .send({
        form: {
          email: faker.internet.email(),
          password: faker.internet.password(2),
        },
      })
      .expect(200);

    const { count } = await db.User.findAndCount();
    expect(count).toBe(0);
  });

  const password = faker.internet.password();
  it('#create success', async () => {
    await agent
      .post('/users')
      .send({
        form: {
          password,
          email: faker.internet.email(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        },
      })
      .expect(302);

    const { count } = await db.User.findAndCount();
    expect(count).toBe(1);
  });

  it('#index', async () => {
    await agent
      .get('/users')
      .expect(200);
  });

  it('#show', async () => {
    await agent
      .get('/users/1')
      .expect(200);
  });

  it('#edit', async () => {
    await agent
      .get('/account/profile/edit')
      .expect(200);
  });

  it('#update fail', async () => {
    await db.User.create({
      email: 'test@mail.com',
      password: 'aaaa',
    });
    await agent
      .put('/account/profile/')
      .send({
        form: {
          email: 'test@mail.com',
        },
      })
      .expect(200);

    const user = await db.User.findById(1);
    expect(user.email).not.toBe('test@mail.com');
  });

  it('#update success', async () => {
    await agent
      .put('/account/profile/')
      .send({
        form: {
          firstName: 'New',
          lastName: 'Name',
        },
      })
      .expect(302);

    const user = await db.User.findById(1);
    expect(user.fullName).toBe('New Name');
  });

  it('#editPassword', async () => {
    await agent
      .get('/account/password/edit')
      .expect(200);
  });

  it('#updatePassword confirmed fail', async () => {
    await agent
      .put('/account/password')
      .send({
        form: {
          oldPassword: password,
          newPassword: 'newPassword',
          confirmedNewPassword: 'newPassword2',
        },
      })
      .expect('location', '/account/password/edit');
  });

  it('#updatePassword wrong password fail', async () => {
    await agent
      .put('/account/password')
      .send({
        form: {
          oldPassword: `wrong${password}`,
          newPassword: 'newPassword',
          confirmedNewPassword: 'newPassword2',
        },
      })
      .expect('location', '/account/password/edit');
  });

  it('#updatePassword short password fail', async () => {
    await agent
      .put('/account/password')
      .send({
        form: {
          oldPassword: password,
          newPassword: '12',
          confirmedNewPassword: '12',
        },
      })
      .expect('location', '/account/password/edit');
  });

  it('#updatePassword success', async () => {
    await agent
      .put('/account/password')
      .send({
        form: {
          oldPassword: password,
          newPassword: 'newPassword',
          confirmedNewPassword: 'newPassword',
        },
      })
      .expect('location', '/users/1');
  });

  it('#destroy', async () => {
    await agent
      .delete('/account/profile')
      .expect('location', '/');

    const user = await db.User.findById(1);
    expect(user).toBeNull();
  });
});
