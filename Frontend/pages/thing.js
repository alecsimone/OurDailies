import styled from 'styled-components';
import gql from 'graphql-tag';
import { Query, Subscription } from 'react-apollo';
import Head from 'next/head';
import FullThing from '../components/FullThing';
import FullThingEmbed from '../components/FullThingEmbed';
import Error from '../components/ErrorMessage';
import Member from '../components/Member';

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
                  id
                  displayName
                  avatar
                  rep
               }
               comment
               createdAt
               updatedAt
            }
         }
      }
      votesConnection(where: { onThing: { id: $id } }) {
         edges {
            node {
               voter {
                  id
                  displayName
                  avatar
                  roles
               }
               value
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

// pollInterval = {
//    memberData.me != null && memberData.me.roles.includes("ADMIN")
//       ? 99999999993000
//       : 999999999910000
// }

const SingleThing = props => (
   <Member>
      {({ data: memberData }) => (
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
               data.thing.votes = data.votesConnection.edges;

               let thingComponent = (
                  <FullThingEmbed thing={data.thing} member={memberData} />
               );
               data.thing.includedLinks.forEach(link => {
                  if (
                     link.url.includes("jpg") ||
                     link.url.includes("png") ||
                     link.url.includes("gif")
                  ) {
                     thingComponent = (
                        <FullThing thing={data.thing} member={memberData} />
                     );
                  }
               });

               if (data.thing.featuredImage) {
                  thingComponent = (
                     <FullThing thing={data.thing} member={memberData} />
                  );
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
      )}
   </Member>
);
export default SingleThing;
export { SINGLE_THING_QUERY };
