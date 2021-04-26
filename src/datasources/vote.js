const { DataSource } = require('apollo-datasource');
class VoteAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  async getTicket() {
    const ticket = await this.store.tickets.findByPk(0);
    return {
      token: ticket.token,
      used: ticket.used,
      total: ticket.total,
    };
  }

  async getPeople({ names }) {
    const people = await this.store.people.findAll({
      attributes: ['name', 'voteCount'],
      where: {
        name: names,
      },
    });
    return people;
  }

  async voteFor({ names, token }) {
    const result = {
      success: true,
      message: '',
      updated: [],
    };
    const updated = [];
    try {
      for (const name of names) {
        const t = await this.store.db.transaction();
        try {
          const ticketdb = await this.store.tickets.increment('used', {
            by: 1,
            where: { token },
            transaction: t,
            returning: true,
          });

          // Put this outside and we get a performance boost, why?
          const ticket = await this.store.tickets.findByPk(0, {
            transaction: t,
            lock: true,
          });

          if (!ticketdb[0][0][0]) {
            throw new Error(
              `Token(${token}) doesn't match with dbtoken(${ticket.token})`,
            );
          }

          const persondb = await this.store.people.increment('voteCount', {
            by: 1,
            where: { name },
            transaction: t,
            returning: true,
          });

          if (!persondb[0][0][0]) {
            await t.rollback();
            console.error(
              `The name '${name}' doesn't exist in the DB, but we'll continue`,
            );
            continue;
          }

          // If the execution reaches this line, no errors were thrown.
          // We commit the transaction.
          await t.commit();

          console.log(
            `[VOTE] Updated ticket: ${JSON.stringify(ticketdb[0][0][0])}`,
          );
          console.log(
            `[VOTE] Updated person: ${JSON.stringify(persondb[0][0][0])}`,
          );
          console.log(`[VOTE] Successfully updated vote count for: ${name}`);
          // logging who's been successfully updated after the transaction occured
          updated.push(persondb[0][0][0]);
        } catch (error) {
          // If the execution reaches this line, an error was thrown.
          // We rollback the transaction.
          await t.rollback();
          throw error; // break the loop
        }
      }

      // If the execution reaches this line, the transaction has been committed successfully
      // `result` is whatever was returned from the transaction callback (the `user`, in this case)

      result.success = names.length === updated.length;
      result.message = result.success
        ? 'All candidates were successfully updated.'
        : 'Not all candidates were updated.';
      result.updated = updated;
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      result.success = false;
      result.message = `Voting interrupted by error: ${error.message}`;
      result.updated = updated;
      console.error(`[VOTE] Error during voting: ${error}`);
    }
    return result;
  }
}

module.exports = VoteAPI;
