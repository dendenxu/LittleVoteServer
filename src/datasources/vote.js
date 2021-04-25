const { DataSource } = require('apollo-datasource');

class VoteAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;

    console.log('VoteAPI loaded.');
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

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */

  async getTicket() {
    const ticket = await this.store.ticket.findByPk(0);
    return {
      token: ticket.token,
      used: ticket.used,
      total: ticket.total,
    };
  }

  async getPeople({ people }) {}

  async voteFor({ names, token }) {
    const result = {
      success: true,
      message: '',
      updated: [],
    };
    try {
      const updated = await this.store.db.transaction(async t => {
        const ticket = await this.store.ticket.findByPk(0, { transaction: t });
        if (ticket.token !== token) {
          throw new Error(
            `User token(${token}) doesn't match with db token(${ticket.token})`,
          );
        } else if (ticket.used === ticket.total) {
          throw new Error(`Token(${token}) has been used up)`);
        }

        console.log('[VOTE] Token valid, updating names');
        // limit on the ticket should be enforced by the database
        await this.store.ticket.increment('used', { by: 1, transaction: t });
        const updated = [];
        // SQLite doesn't support returned updated rows
        for (const name of names) {
          const res = await this.store.people.increment('voteCount', {
            by: 1,
            where: { name },
            transaction: t,
          });
          if (res[0]) {
            updated.push(name);
          }
        }
        console.log(
          `[VOTE] Successfully updated ${JSON.stringify(updated, null, 2)}`,
        );
        return updated;
      });

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
      result.message = error.message;
      result.updated = [];
    }
    return result;
  }
}

module.exports = VoteAPI;
