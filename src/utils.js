const Sequelize = require('sequelize');

// NOTE: Install and create the progress database before trying to connect to it
// Linux:
// sudo -u postgres createuser -P -s xzdd
// createdb littlevotedb -U xzdd
//
// Windows:
// psql -U postgres # to login the database
// create user xzdd with encrypted password 'xzdd';
// create database littlevotedb owner xzdd;

const database = 'littlevotedb';
const username = 'xzdd';
const password = 'xzdd'; // ENTER YOUR PASSWORD HERE
const host = 'localhost';
const port = '5432'; // default

module.exports.createStore = () => {
  const db = new Sequelize(database, username, password, {
    dialect: 'postgres',
    host,
    port,
    logging: false,
    // timestamps: false,
    updatedAt: false,
    createdAt: false,
  });

  const ticket = db.define('ticket', {
    // should have a validate, removed for performance reason
    id: {
      type: Sequelize.INTEGER,
      defaultValue: '0',
      allowNull: false,
      primaryKey: true,
      equals: '0',
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    token: Sequelize.STRING,
    used: {
      // this can only increment
      type: Sequelize.INTEGER,
      defaultValue: '0',
    },
    total: Sequelize.INTEGER,
  });

  const people = db.define('person', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    voteCount: Sequelize.INTEGER,
  });

  return { db, ticket, people };
};
