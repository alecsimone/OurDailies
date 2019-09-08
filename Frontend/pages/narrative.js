import styled from 'styled-components';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Error from '../components/ErrorMessage';
import Thing from '../components/Thing';
import LittleThing from '../components/LittleThing';
import TinyThing from '../components/TinyThing';

const NARRATIVE_THINGS_QUERY = gql`
   query NARRATIVE_THINGS_QUERY($id: ID!) {
      narrative(where: { id: $id }) {
         title
         connectedThings {
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
            createdAt
            updatedAt
         }
      }
   }
`;

const NarrativeContainer = styled.div`
   width: 96%;
   margin: auto;
   h2 {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 500;
      margin: 4rem 0;
      span {
         color: ${props => props.theme.primaryAccent};
      }
   }
   .littleThings {
      margin-top: 4rem;
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: flex-start;
   }
   p.nothing {
      grid-column: 1 / -1;
      font-size: ${props => props.theme.bigText};
      text-align: center;
   }
`;

const NarrativeFeed = props => (
   <Query
      query={NARRATIVE_THINGS_QUERY}
      variables={{
         id: props.query.id
      }}
   >
      {({ error, loading, data }) => {
         if (error) return <Error error={error} />;
         if (loading) return <p>Loading...</p>;
         let narratives;
         if (data.narrative.connectedThings.length === 0) {
            narratives = (
               <p className="nothing">No things found for that Narrative</p>
            );
         } else {
            let windowWidth = 800;
            try {
               windowWidth = window.innerWidth;
            } catch (windowError) {}

            const sortedThings = data.narrative.connectedThings.sort((a, b) => {
               const aCreated = new Date(a.createdAt).getTime();
               const bCreated = new Date(b.createdAt).getTime();
               return bCreated - aCreated;
            });

            const littleThingsArray = [];
            sortedThings.forEach((connectedThing, index) => {
               if (index !== 0 || windowWidth < 800) {
                  littleThingsArray.push(
                     <LittleThing
                        thing={connectedThing}
                        key={connectedThing.id}
                     />
                  );
               }
            });

            const firstThing = sortedThings[0];
            narratives = (
               <>
                  {windowWidth >= 800 && (
                     <Thing
                        thing={firstThing}
                        key={firstThing.id}
                        client={props.client}
                     />
                  )}
                  <div className="littleThings">{littleThingsArray}</div>
               </>
            );
         }

         return (
            <NarrativeContainer>
               <Head>
                  <title>{data.narrative.title} - Our Dailies</title>
               </Head>
               <h2>
                  <span>NARRATIVE:</span> {data.narrative.title}
               </h2>
               {narratives}
            </NarrativeContainer>
         );
      }}
   </Query>
);

export default NarrativeFeed;
