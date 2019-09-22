import React, { Component } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Dailies from '../components/Dailies';
import ContextBar from '../components/ContextBar';
import LoadingRing from '../components/LoadingRing';
import { littleThingFields } from '../lib/utils';

const THINGS_FOR_GIVEN_DAY_QUERY = gql`
   query THINGS_FOR_GIVEN_DAY_QUERY($winnerOffset: Int) {
      thingsForGivenDay(winnerOffset: $winnerOffset) {
         ${littleThingFields}
      }
   }
`;

class Home extends Component {
   render() {
      return (
         <div>
            <ContextBar />
            <Query
               query={THINGS_FOR_GIVEN_DAY_QUERY}
               variables={{ winnerOffset: 0 }}
            >
               {({ data, error, loading }) => {
                  if (loading) return <LoadingRing />;
                  if (error) return <p>Error: {error.message}</p>;
                  const [winner] = data.thingsForGivenDay.filter(
                     thing => thing.winner != null
                  );
                  return (
                     <ApolloConsumer>
                        {client => (
                           <Dailies
                              things={data.thingsForGivenDay}
                              client={client}
                           />
                        )}
                     </ApolloConsumer>
                  );
               }}
            </Query>
         </div>
      );
   }
}

export { THINGS_FOR_GIVEN_DAY_QUERY };
export default Home;
