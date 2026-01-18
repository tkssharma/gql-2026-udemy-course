export const typeDefs = /* GraphQL */ `
  type Query {
    hello: String!
    greeting(name: String!): String!
    sayHi(mesage: String!): String!
  }
  type Mutation {
    createUser(name: String!): String!
  }
`;