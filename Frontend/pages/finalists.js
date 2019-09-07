import React, { Component } from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import Member from '../components/Member';
import Finalists from '../components/Finalists';

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
   render() {
      return (
         <StyledFinalistsPage>
            <Head>
               <title>Finalists - Our Dailies</title>
            </Head>
            <Member>
               {({ data: memberData }) => (
                  <Query
                     query={FINALIST_THINGS_QUERY}
                     pollInterval={
                        memberData.me != null &&
                        memberData.me.roles.includes('Admin')
                           ? 3000
                           : 10000
                     }
                     updateQuery={(proxy, data) => {
                        console.log('hello');
                        console.log(proxy);
                        console.log(data);
                        return true;
                     }}
                  >
                     {({ error, loading, data }) => (
                        <Finalists
                           things={data.thingsForFinalists}
                           member={memberData}
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
