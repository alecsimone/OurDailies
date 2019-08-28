import withApollo from "next-with-apollo";
import ApolloClient from "apollo-boost";
import { endpoint } from "../config";
import { LOCAL_STATE_QUERY, TOGGLE_MODAL_MUTATION } from '../components/Modal';

function createClient({ headers }) {
   return new ApolloClient({
      uri: process.env.NODE_ENV === "development" ? endpoint : endpoint,
      request: operation => {
         operation.setContext({
            fetchOptions: {
               credentials: "include"
            },
            headers
         });
      },
      clientState: {
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
         },
         defaults: {
            modalOpen: false,
            modalContent: ' '
         }
      }
   });
}

export default withApollo(createClient);
