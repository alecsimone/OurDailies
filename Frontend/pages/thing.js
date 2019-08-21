import styled from "styled-components";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Head from "next/head";
import FullThing from "../components/FullThing";
import FullThingEmbed from "../components/FullThingEmbed";
import Error from "../components/ErrorMessage";

const SINGLE_THING_QUERY = gql`
   query SINGLE_THING_QUERY($id: ID!) {
      thing(where: { id: $id }) {
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
         createdAt
         updatedAt
      }
      commentsConnection(where: { onThing: { id: $id } }) {
         edges {
            node {
               id
               author {
                  displayName
               }
               comment
               createdAt
               updatedAt
            }
         }
      }
   }
`;

const SingleThingContainer = styled.div`
   display: flex;
   justify-content: center;
   article {
      flex-grow: 1;
   }
`;

const SingleThing = props => (
   <Query
      query={SINGLE_THING_QUERY}
      variables={{
         id: props.query.id
      }}
   >
      {({ error, loading, data }) => {
         if (error) return <Error error={error} />;
         if (loading) return <p>Loading...</p>;
         let title;
         if (!data.thing) {
            return <p>No thing found</p>;
         }
         data.thing.comments = data.commentsConnection.edges;

         let thingComponent = <FullThingEmbed thing={data.thing} />;
         data.thing.includedLinks.forEach(link => {
            if (
               link.url.includes('jpg') ||
               link.url.includes('png') ||
               link.url.includes('gif')
            ) {
               thingComponent = <FullThing thing={data.thing} />;
            }
         });

         if (data.thing.featuredImage) {
            thingComponent = <FullThing thing={data.thing} />;
         }

         return (
            <SingleThingContainer>
               <Head>
                  <title>{data.thing.title} - Our Dailies</title>
               </Head>
               {thingComponent}
            </SingleThingContainer>
         );
      }}
   </Query>
);

export default SingleThing;
export { SINGLE_THING_QUERY };
