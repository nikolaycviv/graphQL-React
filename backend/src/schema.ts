export const typeDefs = /* GraphQL */ `
  type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
    owner: ID!
  }

  input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    events: [Event!]!
    event(id: ID!): Event
    me: String
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createEvent(eventInput: EventInput!): Event!
    updateEvent(id: ID!, eventInput: EventInput!): Event!
    deleteEvent(id: ID!): Boolean!
  }
`;
