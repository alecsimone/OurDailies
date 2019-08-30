import React, { Component } from "react";
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from "styled-components";
import Head from 'next/head';
import FullThing from "../components/FullThing";
import Member from '../components/Member';
import Curate from '../components/Curate';

const CURATE_THINGS_QUERY = gql`
   query CURATE_THINGS_QUERY {
      thingsForCurate {
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
   render() {
      return (
         <StyledCuratePage>
            <Head>
               <title>Curate - Our Dailies</title>
            </Head>
            <Member>
               {({ data: memberData }) => (
                  <Query
                     query={CURATE_THINGS_QUERY}
                     pollInterval={
                        memberData.me != null &&
                        memberData.me.roles.includes("Admin")
                           ? 3000
                           : 10000
                     }
                  >
                     {({ error, loading, data }) => {
                        if (data.thingsForCurate.length > 0) {
                           return (
                              <Curate
                                 things={data.thingsForCurate}
                                 member={memberData}
                                 key={loading}
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
