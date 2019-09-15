import React, { Component } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import Member from '../components/Member';
import Finalists from '../components/Finalists';
import { THING_SUBSCRIPTION } from './thing';
import { littleThingFields } from '../lib/utils';

const FINALIST_THINGS_QUERY = gql`
   query FINALIST_THINGS_QUERY {
      thingsForFinalists {
         ${littleThingFields}
      }
   }
`;

const StyledFinalistsPage = styled.div`
   p.nothing {
      color: ${props => props.theme.majorColor};
      text-align: center;
      font-weight: 600;
      font-size: ${props => props.theme.smallHead};
   }
`;

class finalists extends Component {
   addSubscription = (subscribeToMore, data) => {
      const IDsToSubscribe = data.thingsForFinalists.map(thing => thing.id);
      return subscribeToMore({
         document: THING_SUBSCRIPTION,
         variables: { IDs: IDsToSubscribe },
         updateQuery: (prev, { subscriptionData }) => {
            const newThingData = subscriptionData.data.thing.node;
            const changedThingID = newThingData.id;
            const changedThingIndex = prev.thingsForFinalists.findIndex(
               thing => thing.id === changedThingID
            );
            if (changedThingIndex === -1) return prev;

            prev.thingsForFinalists[changedThingIndex] = newThingData;
            return prev;
         }
      });
   };

   render() {
      return (
         <StyledFinalistsPage>
            <Head>
               <title>Finalists - Our Dailies</title>
            </Head>
            <Member>
               {({ data: memberData }) => (
                  <Query query={FINALIST_THINGS_QUERY}>
                     {({ error, loading, data, subscribeToMore }) => (
                        <Finalists
                           things={data.thingsForFinalists}
                           member={memberData}
                           subscribeToUpdates={() =>
                              this.addSubscription(subscribeToMore, data)
                           }
                        />
                     )}
                  </Query>
               )}
            </Member>
         </StyledFinalistsPage>
      );
   }
}

export default finalists;
