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
        const status = await this.store.db.transaction(async t => {
          const ticket = await this.store.ticket.findByPk(0, {
            transaction: t,
          });

          if (ticket.token !== token) {
            throw new Error(
              `User token(${token}) doesn't match with db token(${ticket.token})`,
            );
          }

          // limit on the ticket should be enforced
          if (ticket.used === ticket.total) {
            // throw an error and ROLLBACK
            throw new Error(`Token(${token}) has been used up`);
          }

          console.log(`[VOTE] Token valid, updating ${name}'s vote count`);

          const res = await this.store.people.increment('voteCount', {
            by: 1,
            where: { name },
            transaction: t,
          });
          if (res[0]) {
            console.log('[VOTE] Vote count incremented');

            // now we're in a transaction and we've validated the token
            await this.store.ticket.increment('used', {
              by: 1,
              where: { id: '0' },
              transaction: t,
            });
            console.log(
              `[VOTE] Token usage incremented, now: ${
                ticket.used + 1
              }, total: ${ticket.total}`,
            );
            console.log(`[VOTE] Successfully updated vote count for: ${name}`);
            return true;
          } else {
            console.log(
              `[VOTE] The name '${name}' doesn't exist in the DB, but we'll continue`,
            );
            return false;
          }
        });

        if (status) {
          // logging who's been successfully updated after the transaction occured
          updated.push(name);
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
      result.message = error.message;
      result.updated = updated;
    }
    return result;
  }
}

module.exports = VoteAPI;
