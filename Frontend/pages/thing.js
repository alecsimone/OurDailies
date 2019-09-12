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
         finalistDate
         createdAt
         updatedAt
      }
   }
`;

const THING_SUBSCRIPTION = gql`
   subscription THING_SUBSCRIPTION {
      thing {
         node {
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
            finalistDate
            createdAt
            updatedAt
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

const SingleThing = props => {
   const addSubscription = (subscribeToMore, data) =>
      subscribeToMore({
         document: THING_SUBSCRIPTION,
         updateQuery: (prev, { subscriptionData }) => {
            const oldThing = data.thing;
            const updates = subscriptionData.data.thing.node;

            if (oldThing.id != updates.id) return data;

            const newThingData = {
               thing: {}
            };
            Object.keys(oldThing).forEach(key => {
               if (updates[key] == null) {
                  newThingData.thing[key] = oldThing[key];
               } else {
                  newThingData.thing[key] = updates[key];
               }
            });

            return newThingData;
         }
      });
   return (
      <Member>
         {({ data: memberData }) => (
            <Query
               query={SINGLE_THING_QUERY}
               variables={{
                  id: props.query.id
               }}
            >
               {({ error, loading, data, subscribeToMore }) => {
                  console.log(data);
                  if (error) return <Error error={error} />;
                  if (loading) return <p>Loading...</p>;
                  let title;
                  if (!data.thing) {
                     return <p>No thing found</p>;
                  }

                  let windowWidth = 800;
                  try {
                     windowWidth = window.innerWidth;
                  } catch (windowError) {}

                  let thingComponent;
                  if (windowWidth < 800) {
                     thingComponent = (
                        <FullThing
                           thing={data.thing}
                           member={memberData}
                           subscribeToUpdates={() =>
                              addSubscription(subscribeToMore, data)
                           }
                        />
                     );
                  } else {
                     thingComponent = (
                        <FullThingEmbed
                           thing={data.thing}
                           member={memberData}
                           subscribeToUpdates={() =>
                              addSubscription(subscribeToMore, data)
                           }
                        />
                     );
                  }
                  if (data.thing.includedLinks != null) {
                     data.thing.includedLinks.forEach(link => {
                        if (
                           link.url.includes('jpg') ||
                           link.url.includes('jpeg') ||
                           link.url.includes('png') ||
                           link.url.includes('gif')
                        ) {
                           thingComponent = (
                              <FullThing
                                 thing={data.thing}
                                 member={memberData}
                                 subscribeToUpdates={() =>
                                    addSubscription(subscribeToMore, data)
                                 }
                              />
                           );
                        }
                     });
                  }

                  if (data.thing.featuredImage) {
                     thingComponent = (
                        <FullThing
                           thing={data.thing}
                           member={memberData}
                           subscribeToUpdates={() =>
                              addSubscription(subscribeToMore, data)
                           }
                        />
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
};
export default SingleThing;
export { SINGLE_THING_QUERY };
