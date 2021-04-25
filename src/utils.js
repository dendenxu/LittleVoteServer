const SQL = require('sequelize');

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
          cursorIndex + 1,
          Math.min(results.length, cursorIndex + 1 + pageSize),
        )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {
  // const Op = SQL.Op;
  // const operatorsAliases = {
  //   $in: Op.in,
  // };

  const db = new SQL('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './store.sqlite',
    // operatorsAliases,
    logging: false,
  });

  const ticket = db.define('ticket', {
    id: {
      type: SQL.INTEGER,
      defaultValue: '0',
      allowNull: false,
      primaryKey: true,
      validate: {
        equals: '0',
      },
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    token: SQL.STRING,
    used: {
      // this can only increment
      type: SQL.INTEGER,
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
    total: SQL.INTEGER,
  });

  const people = db.define('person', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: SQL.STRING,
    voteCount: SQL.INTEGER,
  });

  const users = db.define('user', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    email: SQL.STRING,
    token: SQL.STRING,
  });

  const trips = db.define('trip', {
    id: {
      type: SQL.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    createdAt: SQL.DATE,
    updatedAt: SQL.DATE,
    launchId: SQL.INTEGER,
    userId: SQL.INTEGER,
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

  return { db, ticket, people, users, trips };
};
