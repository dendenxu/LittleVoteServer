const Sequelize = require('sequelize');

// sudo -u postgres createuser -P -s xzdd
// createdb LittleVoteDB -U xzdd
const database = "LittleVoteDB"
const username = "xzdd"
const password = "xzdd" // ENTER YOUR PASSWORD HERE
const host = "localhost"
const port = "5432"

module.exports.createStore = () => {
  // const Op = SQL.Op;
  // const operatorsAliases = {
  //   $in: Op.in,
  // };

  const db = new Sequelize(database, username, password, {
    dialect: 'postgres',
    host,
    port,
    // storage: './store.sqlite',
    // operatorsAliases,
    logging: false,
//    transactionType: 'IMMEDIATE',
    timestamps: false,
  });
  
  const ticket = db.define('ticket', {
    id: {
      type: Sequelize.INTEGER,
      defaultValue: '0',
      allowNull: false,
      primaryKey: true,
//      validate: {
//        equals: '0',
//      },
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

  return { db, ticket, people };
};
