import styled from "styled-components";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import Error from "../components/ErrorMessage";
import Thing from "../components/Thing";
import LittleThing from "../components/LittleThing";
import TinyThing from "../components/TinyThing";

const NARRATIVE_THINGS_QUERY = gql`
   query NARRATIVE_THINGS_QUERY($id: ID!) {
      narrative(where: { id: $id }) {
         title
      }
      thingsConnection(where: { partOfNarratives_some: { id: $id } }) {
         edges {
            node {
               id
               title
               author {
                  displayName
               }
               featuredImage
               originalSource
               summary
               partOfNarratives {
                  id
                  title
               }
               finalistDate
               createdAt
            }
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
         if (data.thingsConnection.edges.length === 0) {
            return (
               <NarrativeContainer>
                  <Head>
                     <title>{data.narrative.title} - Our Dailies</title>
                  </Head>
                  <h2>
                     <span>NARRATIVE:</span> {data.narrative.title}
                  </h2>
                  <div className="thingGrid">
                     <p className="nothing">
                        No things found for that Narrative
                     </p>
                  </div>
               </NarrativeContainer>
            );
         }

         let windowWidth = 800;
         try {
            windowWidth = window.innerWidth;
         } catch (windowError) {}

         const littleThingsArray = [];
         data.thingsConnection.edges.forEach((edge, index) => {
            if (index !== 0 || windowWidth < 800) {
               littleThingsArray.push(
                  <LittleThing thing={edge.node} key={edge.node.id} />
               );
            }
         });

         const firstThing = data.thingsConnection.edges[0].node;

         return (
            <NarrativeContainer>
               <Head>
                  <title>{data.narrative.title} - Our Dailies</title>
               </Head>
               <h2>
                  <span>NARRATIVE:</span> {data.narrative.title}
               </h2>
               {windowWidth >= 800 && (
                  <Thing
                     thing={firstThing}
                     key={firstThing.id}
                     client={props.client}
                  />
               )}
               <div className="littleThings">{littleThingsArray}</div>
            </NarrativeContainer>
         );
      }}
   </Query>
);

export default NarrativeFeed;
