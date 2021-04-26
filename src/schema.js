const { gql } = require('apollo-server');

const typeDefs = gql`

  type Person {
    id: ID!
    name: String!
    voteCount: Int!
  }

  type Ticket {
    token: String! # shoule be a random ticket
    used: Int!
    total: Int!
  }

  type Query {
    query(names: [String]!): [Person]!
    
    cas: Ticket!
  }

  type Mutation {
    vote(names: [String]!, token: String!): VoteUpdateResponse!
  }

  type VoteUpdateResponse {
    success: Boolean!
    message: String
    updated: [Person] # array of Person modified by this mutation, no need to fetch again
  }
`;

module.exports = typeDefs;
