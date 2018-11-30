import Sequelize from 'sequelize';

let sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    storage: ':memory:',
    dialect: 'sqlite',
    operatorsAliases: Sequelize.Op,
    logging: false,
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    operatorsAliases: Sequelize.Op,
    dialect: 'postgres',
  });
}

const models = {
  User: sequelize.import('./User.js'),
};

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
