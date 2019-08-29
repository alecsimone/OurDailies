import React, { Component } from 'react';
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from 'styled-components';
import Head from "next/head";
import FullThing from '../components/FullThing';
import FullThingEmbed from '../components/FullThingEmbed';
import Error from "../components/ErrorMessage";
import Member from "../components/Member";
import MustSignIn from "../components/MustSignIn";

const NEW_THINGS_QUERY = gql`
   query NEW_THINGS_QUERY {
      thingsForNew {
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

const StyledNew = styled.div`
   p.nothing {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => props.theme.majorColor};
   }
`;

class newPage extends Component {
   render() {
      return (
         <MustSignIn>
            <Member>
               {({ data: memberData }) => (
                  <Query query={NEW_THINGS_QUERY}>
                     {({ error, loading, data }) => {
                        if (error) return <Error error={error} />;
                        if (loading) return <p>Loading...</p>;

                        let windowWidth = 800;
                        try {
                           windowWidth = window.innerWidth;
                        } catch (windowError) {}

                        const firstThing = data.thingsForNew[0];

                        let thingComponent;
                        if (windowWidth < 800) {
                           thingComponent = (
                              <FullThing
                                 thing={firstThing}
                                 member={memberData}
                              />
                           );
                        } else {
                           thingComponent = (
                              <FullThingEmbed
                                 thing={firstThing}
                                 member={memberData}
                              />
                           );
                        }

                        if (data.thingsForNew.length === 0) {
                           thingComponent = (
                              <p className="nothing">No new things!</p>
                           );
                        }

                        return (
                           <StyledNew>
                              <Head>
                                 <title>New - Our Dailies</title>
                              </Head>
                              {thingComponent}
                           </StyledNew>
                        );
                     }}
                  </Query>
               )}
            </Member>
         </MustSignIn>
      );
   }
}

export default newPage;
export { NEW_THINGS_QUERY };
