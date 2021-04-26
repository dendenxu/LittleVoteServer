const { Sequelize, Op, Model, DataTypes } = require('sequelize');
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
    transactionType: 'EXCLUSIVE',
    // timestamps: false,
    // updatedAt: false,
    // createdAt: false,
  });

  const tickets = db.define('tickets', {
    // should have a validate, removed for performance reason
    id: {
      type: DataTypes.INTEGER,
      defaultValue: '0',
      allowNull: false,
      primaryKey: true,
      equals: '0',
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    token: DataTypes.STRING,
    used: {
      // this can only increment
      type: DataTypes.INTEGER,
      defaultValue: '0',
      //      validate: {
      //        isValid(value) {
      //          if (parseInt(value) > parseInt(this.total)) {
      //            throw new Error(
      //              'Used count of ticket must be smaller than total usable count.',
      //            );
      //          }
      //        },
      //      },
    },
    total: DataTypes.INTEGER,
  });

  const people = db.define('people', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    voteCount: DataTypes.INTEGER,
  });

  db.sync()
    .then(() => {
      db.getQueryInterface().addConstraint('tickets', {
        type: 'check',
        name: 'ticket_count',
        fields: ['used'],
        where: {
          used: {
            [Op.lt]: Sequelize.col('total'),
          },
        },
      });
    })
    .catch(e => {
      console.error(`[DATABASE] Error: ${e}`);
    });

  return { db, tickets, people };
};
