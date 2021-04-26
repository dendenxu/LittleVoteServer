const Sequelize = require('sequelize');

module.exports.createStore = () => {
  // const Op = SQL.Op;
  // const operatorsAliases = {
  //   $in: Op.in,
  // };

  const db = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    // operatorsAliases,
    logging: false,
  });

  const ticket = db.define('ticket', {
    id: {
      type: Sequelize.INTEGER,
      defaultValue: '0',
      allowNull: false,
      primaryKey: true,
      validate: {
        equals: '0',
      },
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    token: Sequelize.STRING,
    used: {
      // this can only increment
      type: Sequelize.INTEGER,
      defaultValue: '0',
      // validate: {
      //   isValid(value) {
      //     if (parseInt(value) > parseInt(this.total)) {
      //       throw new Error(
      //         'Used count of ticket must be smaller than total usable count.',
      //       );
      //     }
      //   },
      // },
    },
    total: Sequelize.INTEGER,
  });

  const people = db.define('person', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
    voteCount: Sequelize.INTEGER,
  });

  db.sync().then(() => {
    console.log('[DATABASE] Database has been synced.');
  });

  db.authenticate()
    .then(() => {
      console.log(
        '[DATABASE] Connection to database has been established successfully.',
      );
    })
    .catch(err => {
      console.error('[DATABASE] Unable to connect to the database:', err);
    });

  db.getQueryInterface()
    .showAllSchemas()
    .then(rows => {
      console.log(JSON.stringify(rows, null, 2));
    });

  // db.query('SELECT name FROM people').then(rows => {
  //   console.log(JSON.stringify(rows, null, 2));
  // });

  return { db, ticket, people };
};
