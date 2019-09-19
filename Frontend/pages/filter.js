import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import FullThing from '../components/FullThing';
import Member from '../components/Member';
import Filter from '../components/Filter';
import { THING_SUBSCRIPTION } from './thing';
import { fullThingFields } from '../lib/utils';

const FILTER_THINGS_QUERY = gql`
   query FILTER_THINGS_QUERY {
      thingsForFilter {
         ${fullThingFields}
      }
   }
`;

const StyledFilterPage = styled.div`
   p.nothing {
      color: ${props => props.theme.majorColor};
      text-align: center;
      font-weight: 600;
      font-size: ${props => props.theme.smallHead};
   }
`;

class FilterPage extends Component {
   state = {
      mainThingId: false
   };

   makeMain = id => {
      console.log(`We makin the thing with id ${id} main, baby!`);
      this.setState({ mainThingId: id });
   };

   addSubscription = (subscribeToMore, data) => {
      const IDsToSubscribe = data.thingsForFilter.map(thing => thing.id);
      return subscribeToMore({
         document: THING_SUBSCRIPTION,
         variables: { IDs: IDsToSubscribe },
         updateQuery: (prev, { subscriptionData }) => {
            const newThingData = subscriptionData.data.thing.node;
            const changedThingID = newThingData.id;
            const changedThingIndex = data.thingsForFilter.findIndex(
               thing => thing.id === changedThingID
            );
            if (changedThingIndex === -1) return data;

            data.thingsForFilter[changedThingIndex] = newThingData;
            return data;
         }
      });
   };

   render() {
      return (
         <StyledFilterPage>
            <Head>
               <title>Filter - Our Dailies</title>
            </Head>
            <Member>
               {({ data: memberData }) => (
                  <Query query={FILTER_THINGS_QUERY}>
                     {({
                        error,
                        loading,
                        data,
                        fetchMore,
                        networkStatus,
                        subscribeToMore
                     }) => {
                        if (networkStatus === 1) return <div>Loading...</div>;
                        if (data.thingsForFilter.length > 0) {
                           return (
                              <Filter
                                 things={data.thingsForFilter}
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
                        return <p className="nothing">Nothing to filter</p>;
                     }}
                  </Query>
               )}
            </Member>
         </StyledFilterPage>
      );
   }
}

export default FilterPage;
export { FILTER_THINGS_QUERY };
