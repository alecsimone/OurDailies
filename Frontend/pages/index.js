import React, { Component } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Things from '../components/Things';
import NarrativesBar from '../components/NarrativesBar';
import { littleThingFields } from '../lib/utils';

const THINGS_FOR_MOST_RECENT_DAY_QUERY = gql`
   query THINGS_FOR_MOST_RECENT_DAY_QUERY {
      thingsForMostRecentDay {
         ${littleThingFields}
      }
   }
`;

class Home extends Component {
   render() {
      return (
         <div>
            <NarrativesBar />
            <Query query={THINGS_FOR_MOST_RECENT_DAY_QUERY}>
               {({ data, error, loading }) => {
                  if (loading) return <p>Loading...</p>;
                  if (error) return <p>Error: {error.message}</p>;
                  return (
                     <ApolloConsumer>
                        {client => (
                           <Things
                              things={data.thingsForMostRecentDay}
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

export { THINGS_FOR_MOST_RECENT_DAY_QUERY };
export default Home;
