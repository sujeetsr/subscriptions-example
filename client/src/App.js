import React, { Component } from 'react';
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';

import { Subscription } from 'react-apollo';

import { getMainDefinition } from 'apollo-utilities';
import { ApolloProvider } from "react-apollo";
import gql from "graphql-tag";
import './App.css';

// Create an http link:
const httpLink = new HttpLink({
  uri: 'http://localhost:9001/graphql'
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: `ws://localhost:9001/graphql`,
  options: {
    reconnect: true
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    console.log(`kind: ${kind}, operation: ${operation}`);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

const COUNTER_SUBSCRIPTION = gql`
subscription {
  counter {
    count
  }
}`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { completed: false };
  }

  handleComplete() {
    this.setState({ completed: true });
    console.log('subscription completed!')
  }

  restart() {
    this.setState({ completed: false });
  }

  render() {
    return (

      <ApolloProvider client={client}>

        <div className="App">
          {!this.state.completed ?

          <Subscription
            subscription={COUNTER_SUBSCRIPTION}
            onSubscriptionComplete={() => {
              this.handleComplete();
            }}
          >
            {({ data, loading }) => {
              if (data) {
                console.log('received ' + data.counter.count);
              }
              return <h4>Count value : {!loading && data && data.counter.count}</h4>;
            }}
          </Subscription>
          :
          <div>
            <h2>Completed!</h2>
            <button onClick={() => this.restart()}>Restart</button>
          </div>
          }
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
