const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const { createStore } = require('./utils');
const resolvers = require('./resolvers');
const crypto = require('crypto');

const store = createStore();
const VoteAPI = require('./datasources/vote');

const TICKET_VALID_INTERVAL = 2000; // ms
const TICKET_TOTAL_USAGE_LIMIT = 100;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // tracing: true,
  dataSources: () => ({
    voteAPI: new VoteAPI({ store }),
  }),
});

var ticketTimer;

function getRandomInt(max) {
  return Math.floor(Math.random() * max); // (inclusive of 0, but not 1)
}

async function initialize() {
  await store.db.sync();
  console.log('[DATABASE] Database has been synced.');

  await store.db.authenticate();
  console.log(
    '[DATABASE] Connection to database has been established successfully.',
  );

  const names = await store.people
    .findAll({
      attributes: ['name'],
      raw: true,
    })
    .map(x => {
      return x.name;
    });

  console.log(`[PERSON] Found some names in DB: ${names}, ${names.length}`);

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
      console.log(
        `[TICKET] Token updated successfully: ${token}, used: ${0}, total: ${TICKET_TOTAL_USAGE_LIMIT}`,
      );
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
    process.exit(1);
  });
