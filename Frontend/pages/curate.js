import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import FullThing from '../components/FullThing';
import Member from '../components/Member';
import Curate from '../components/Curate';
import { THING_SUBSCRIPTION } from './thing';

const CURATE_THINGS_QUERY = gql`
   query CURATE_THINGS_QUERY {
      thingsForCurate {
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
            votes {
               value
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
         createdAt
         updatedAt
      }
   }
`;

const StyledCuratePage = styled.div`
   p.nothing {
      color: ${props => props.theme.majorColor};
      text-align: center;
      font-weight: 600;
      font-size: ${props => props.theme.smallHead};
   }
`;

class CuratePage extends Component {
   state = {
      mainThingId: false
   };

   makeMain = id => {
      console.log(`We makin the thing with id ${id} main, baby!`);
      this.setState({ mainThingId: id });
   };

   addSubscription = (subscribeToMore, data) =>
      subscribeToMore({
         document: THING_SUBSCRIPTION,
         updateQuery: (prev, { subscriptionData }) => {
            // console.log(prev.thingsForCurate[0]);
            const newThingData = subscriptionData.data.thing.node;
            const changedThingID = newThingData.id;
            const changedThingIndex = prev.thingsForCurate.findIndex(
               thing => thing.id === changedThingID
            );
            if (changedThingIndex === -1) return prev;

            prev.thingsForCurate[changedThingIndex] = newThingData;
            return prev;
         }
      });

   render() {
      return (
         <StyledCuratePage>
            <Head>
               <title>Curate - Our Dailies</title>
            </Head>
            <Member>
               {({ data: memberData }) => (
                  <Query query={CURATE_THINGS_QUERY}>
                     {({
                        error,
                        loading,
                        data,
                        fetchMore,
                        networkStatus,
                        subscribeToMore
                     }) => {
                        if (networkStatus === 1) return <div>Loading...</div>;
                        if (data.thingsForCurate.length > 0) {
                           return (
                              <Curate
                                 things={data.thingsForCurate}
                                 member={memberData}
                                 makeMain={this.makeMain}
                                 mainThingId={this.state.mainThingId}
                                 key={networkStatus}
                                 subscribeToUpdates={() =>
                                    this.addSubscription(subscribeToMore, data)
                                 }
                              />
                           );
                        }
                        return <p className="nothing">Nothing to curate</p>;
                     }}
                  </Query>
               )}
            </Member>
         </StyledCuratePage>
      );
   }
}

export default CuratePage;
export { CURATE_THINGS_QUERY };
