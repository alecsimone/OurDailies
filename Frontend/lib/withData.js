import withApollo from 'next-with-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { withClientState } from 'apollo-link-state';
import { ApolloLink, Observable, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import ws from 'ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { getMainDefinition } from 'apollo-utilities';
import { Subscription } from 'react-apollo';
import {
   endpoint,
   endpointNoHTTP,
   prodEndpoint,
   prodEndpointNoHTTP
} from '../config';
import { LOCAL_STATE_QUERY, TOGGLE_MODAL_MUTATION } from '../components/Modal';

function createClient({ headers }) {
   const cache = new InMemoryCache();
   cache.writeData({
      data: {
         modalOpen: false,
         modalContent: "You shouldn't be seeing this"
      }
   });

   const request = async operation => {
      operation.setContext({
         fetchOptions: {
            credentials: 'include'
         },
         headers: {
            cookie: headers && headers.cookie
         }
      });
   };

   const httpLink = new HttpLink({
      uri: process.env.NODE_ENV === 'development' ? endpoint : prodEndpoint,
      credentials: 'same-origin'
   });

   const subscriptionEndpoint = `wss://${
      process.env.NODE_ENV === 'development'
         ? endpointNoHTTP
         : prodEndpointNoHTTP
   }/subscriptions`;

   // const wsClient = process.browser
   //    ? new SubscriptionClient(subscriptionEndpoint, {
   //         reconnect: true
   //      })
   //    : new SubscriptionClient(
   //         subscriptionEndpoint,
   //         {
   //            reconnect: true
   //         },
   //         ws
   //      );

   // const wsLink = process.browser
   //    ? new WebSocketLink(wsClient)
   //    : () => console.log('SSR');

   const wsLink = process.browser
      ? new WebSocketLink({
           uri: subscriptionEndpoint,
           options: {
              reconnect: true
           },
           webSocketImpl: ws.client
        })
      : () => console.log('SSR');

   const link = split(
      ({ query }) => {
         const { kind, operation } = getMainDefinition(query);
         return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLink
   );

   const requestLink = new ApolloLink(
      (operation, forward) =>
         new Observable(observer => {
            let handle;
            Promise.resolve(operation)
               .then(oper => request(oper))
               .then(() => {
                  handle = forward(operation).subscribe({
                     next: observer.next.bind(observer),
                     error: observer.error.bind(observer),
                     complete: observer.complete.bind(observer)
                  });
               })
               .catch(observer.error.bind(observer));

            return () => {
               if (handle) handle.unsubscribe();
            };
         })
   );

   return new ApolloClient({
      link: ApolloLink.from([
         onError(({ graphQLErrors, networkError }) => {
            if (graphQLErrors)
               graphQLErrors.forEach(({ message, locations, path }) =>
                  console.log(
                     `[GraphQL error]: Message ${message}, Location: ${locations}, Path: ${path}`
                  )
               );
            if (networkError) console.log(`[Network error]: ${networkError}`);
         }),
         requestLink,
         link
      ]),
      cache,
      resolvers: {
         Mutation: {
            toggleModal(_, variables, { cache }) {
               const { modalOpen } = cache.readQuery({
                  query: LOCAL_STATE_QUERY
               });
               const data = {
                  data: {
                     modalOpen: !modalOpen,
                     modalContent: variables.modalContent
                  }
               };
               cache.writeData(data);
               return data;
            }
         }
      }
   });
}

export default withApollo(createClient);
