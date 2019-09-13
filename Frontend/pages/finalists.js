import React, { Component } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import Member from '../components/Member';
import Finalists from '../components/Finalists';
import { THING_SUBSCRIPTION } from './thing';

const FINALIST_THINGS_QUERY = gql`
   query FINALIST_THINGS_QUERY {
      thingsForFinalists {
         __typename
         id
         title
         author {
            displayName
         }
         featuredImage
         originalSource
         summary
         includedLinks {
            title
            url
            id
         }
         includedThings {
            id
            title
            originalSource
            author {
               displayName
            }
            createdAt
         }
         partOfNarratives {
            id
            title
         }
         comments {
            id
            author {
               id
               displayName
               avatar
               rep
            }
            comment
            createdAt
            updatedAt
         }
         votes {
            voter {
               id
               displayName
               avatar
               roles
            }
            value
         }
         passes {
            passer {
               id
               displayName
               avatar
               roles
            }
         }
         finalistDate
         eliminated
         createdAt
         updatedAt
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
   addSubscription = (subscribeToMore, data) =>
      subscribeToMore({
         document: THING_SUBSCRIPTION,
         updateQuery: (prev, { subscriptionData }) => {
            const newThingData = subscriptionData.data.thing.node;
            console.log(newThingData);
            const changedThingID = newThingData.id;
            const changedThingIndex = prev.thingsForFinalists.findIndex(
               thing => thing.id === changedThingID
            );
            if (changedThingIndex === -1) return prev;

            prev.thingsForFinalists[changedThingIndex] = newThingData;
            console.log(prev);
            return prev;
         }
      });

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
