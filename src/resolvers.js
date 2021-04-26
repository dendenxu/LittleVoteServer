module.exports = {
  Query: {
    cas: (_, __, { dataSources }) => dataSources.voteAPI.getTicket(),
    query: (_, { names }, { dataSources }) =>
      dataSources.voteAPI.getPeople({ names }),
  },

  Mutation: {
    vote: async (_, { names, token }, {dataSources}) => {
      const result = await dataSources.voteAPI.voteFor({names, token});
      return result;
    },
  },
};
