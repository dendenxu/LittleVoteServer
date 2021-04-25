const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');
const isEmail = require('isemail');

const LaunchAPI = require('./datasources/launch');
const UserAPI = require('./datasources/user');
const VoteAPI = require('./datasources/vote');

const { predefinedNames } = require('./datasources/names');

const store = createStore();
const crypto = require('crypto');

const TICKET_VALID_INTERVAL = 2000; // ms
const TICKET_TOTAL_USAGE_LIMIT = 100;

const server = new ApolloServer({
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || '';
    const email = Buffer.from(auth, 'base64').toString('ascii');
    if (!isEmail.validate(email)) {
      return { user: null };
    }
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  tracing: true,
  dataSources: () => ({
    launchAPI: new LaunchAPI(), // If you use this.context in a datasource, it's critical to create a new instance in the dataSources function, rather than sharing a single instance
    userAPI: new UserAPI({ store }),
    voteAPI: new VoteAPI({ store }),
  }),
});

var ticketTimer;

async function initialize() {
  // ! DEV-INIT
  const names = await store.people
    .findAll({
      attributes: ['name'],
      raw: true,
    })
    .map(x => {
      return x.name
    });
  if (!names) {
    console.log('[PERSON] Not a single soul in DB, should insert some.');
    for (const name of predefinedNames) {
      const created = await store.people.create({
        name,
        voteCount: 0,
      });
      console.log(
        `[PERSON] Created entry: ${JSON.stringify(created, null, 2)}`,
      );
    }
  } else {
    console.log(
      `[PERSON] Found some names in DB: ${names}, ${
        names.length
      }`,
    );
  }
  // END OF DEV-INIT

  var ticket = await store.ticket.findByPk(0, {
    plain: true,
    attributes: ['token', 'used', 'total'],
  });

  if (!ticket) {
    const token = crypto.randomBytes(16).toString('hex');

    ticket = await store.ticket.create({
      token,
      used: 0,
      total: TICKET_TOTAL_USAGE_LIMIT,
    });
    console.log(
      `[TICKET] Using new ticket: ${JSON.stringify(ticket, null, 2)}`,
    );
  } else {
    console.log(
      `[TICKET] Using ticket loaded from DB: ${JSON.stringify(
        ticket,
        null,
        2,
      )}`,
    );
  }

  ticketTimer = setInterval(async () => {
    const token = crypto.randomBytes(16).toString('hex');
    console.log(`[TICKET] Generating new ticket: ${token}`);

    // ! we assume this.TICKET_TOTAL_USAGE_LIMIT won't change during one application run
    const tickets = await store.ticket.update(
      { token, used: 0, total: TICKET_TOTAL_USAGE_LIMIT },
      { where: { id: 0 } },
    );

    if (tickets[0]) {
      console.log(`[TICKET] Token updated successfully`);
    } else {
      console.log(`[TICKET] Cannot update to new token`);
    }
  }, TICKET_VALID_INTERVAL);
}

initialize()
  .then(() => {
    server.listen().then(() => {
      console.log(`
[MESSAGE]
Server is running!
Listening on port 4000
Explore!
    `);
    });
  })
  .catch(e => {
    console.error(`[INIT] Error: ${e}`);
  });
