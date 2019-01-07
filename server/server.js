const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const { $$asyncIterator, isAsyncIterable, createAsyncIterator } = require('iterall');
const http = require('http');
const express = require('express');
const cors = require('cors');

function DelayCounter(to) {
  this.to = to
}

DelayCounter.prototype[$$asyncIterator] = function () {
  return {
    to: this.to,
    num: 0,
    next () {
      return new Promise(resolve => {
        if (this.num >= this.to) {
          resolve({ value: undefined, done: true })
        } else {
          setTimeout(() => {
            resolve({ value: { counter: { count: this.num++ } }, done: false })
          }, 1000)
        }
      })
    },
    [$$asyncIterator]() {
      return this;
    }
  }
}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String!
  }
  type Counter {
    count: Int!
    countStr: String
  }
  type Subscription {
    counter: Counter!
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return "Hello world!";
    }
  },
  Counter: {
    countStr: counter => `Current count: ${counter.count}`
  },
  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        return new DelayCounter(3);
      }
    }
  }
};

const PORT = 9001;
const app = express();
app.use(cors);

const pubsub = new PubSub();
const server = new ApolloServer({ typeDefs, resolvers, context: { pubsub } });
server.applyMiddleware({app})

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
});

