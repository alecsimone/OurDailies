import styled from 'styled-components';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Member from '../components/Member';
import Things from '../components/Things';
import Thing from '../components/Thing';
import LittleThing from '../components/LittleThing';
import TinyThing from '../components/TinyThing';
import LoadingRing from '../components/LoadingRing';
import Error from '../components/ErrorMessage';
import FeaturedImageCarousel from '../components/ThingParts/FeaturedImageCarousel';
import Summary from '../components/ThingParts/Summary';
import LinksBox from '../components/ThingParts/LinksBox';
import Comments from '../components/ThingParts/Comments';
import { littleThingFields } from '../lib/utils';
import { home, prodHome } from '../config';

const NARRATIVE_THINGS_QUERY = gql`
   query NARRATIVE_THINGS_QUERY($id: ID!) {
      narrative(where: { id: $id }) {
         __typename
         id
         title
         featuredImage
         summary
         includedLinks {
            title
            url
            id
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
         score
         connectedThings {
            ${littleThingFields}
         }
      }
   }
`;

const NarrativeContainer = styled.div`
   width: 100%;
   margin: auto;
   display: flex;
   align-items: flex-start;
   flex-wrap: wrap;
   @media screen and (min-width: 800px) {
      flex-wrap: nowrap;
   }
   .narrativesSidebar {
      min-width: 20%;
      @media screen and (min-width: 800px) {
         max-width: 35%;
      }
      flex-grow: 1;
      overflow: hidden;
      padding: 2rem;
      background: ${props => props.theme.veryLowContrastCoolGrey};
      box-shadow: 0 0.1rem 0.4rem ${props => props.theme.secondaryAccentGlow};
      h3.headline {
         font-size: ${props => props.theme.smallHead};
         input {
            font-size: ${props => props.theme.smallHead};
         }
      }
   }
   .narrativesBody {
      @media screen and (min-width: 800px) {
         max-width: 80%;
      }
      flex-grow: 2;
      h2 {
         text-align: center;
         font-size: ${props => props.theme.smallHead};
         font-weight: 500;
         margin: 4rem 0;
         span {
            color: ${props => props.theme.primaryAccent};
         }
      }
      p.nothing {
         grid-column: 1 / -1;
         font-size: ${props => props.theme.bigText};
         text-align: center;
      }
   }
`;

const ContextPage = props => (
   <Query
      query={NARRATIVE_THINGS_QUERY}
      variables={{
         id: props.query.id
      }}
   >
      {({ error, loading, data }) => {
         if (error) return <Error error={error} />;
         if (loading) return <p>Loading...</p>;
         const { narrative } = data;
         let narratives;
         if (narrative.connectedThings.length === 0) {
            narratives = (
               <p className="nothing">No things found for that Narrative</p>
            );
         } else {
            let windowWidth = 800;
            try {
               windowWidth = window.innerWidth;
            } catch (windowError) {}

            const sortedThings = narrative.connectedThings.sort((a, b) => {
               const aCreated = new Date(a.createdAt).getTime();
               const bCreated = new Date(b.createdAt).getTime();
               return bCreated - aCreated;
            });

            const thingsArray = sortedThings.map(thing => {
               if (!process.browser) {
                  return <LoadingRing />;
               }
               if (thing.winner != null && windowWidth > 800) {
                  return <Thing thing={thing} key={thing.id} />;
               }
               if (thing.finalistDate != null) {
                  return <LittleThing thing={thing} key={thing.id} />;
               }
               return <TinyThing thing={thing} key={thing.id} />;
            });

            narratives = <Things things={thingsArray} />;
         }

         return (
            <Member>
               {({ data: member }) => (
                  <NarrativeContainer>
                     <Head>
                        <title>{narrative.title} - Our Dailies</title>
                     </Head>
                     <div className="narrativesSidebar">
                        <FeaturedImageCarousel
                           featuredImage={narrative.featuredImage}
                           includedLinks={narrative.includedLinks}
                           originalSource={false}
                           headline={narrative.title}
                           thingID={narrative.id}
                           member={member.me}
                           isNarrative
                           key={`FeaturedImageCarousel-${narrative.id}`}
                        />
                        <Summary
                           summary={narrative.summary}
                           thingID={narrative.id}
                           author={false}
                           member={member.me}
                           isNarrative
                           key={`Summary-${narrative.id}`}
                        />
                        <LinksBox
                           links={narrative.includedLinks}
                           thingID={narrative.id}
                           member={member.me}
                           isNarrative
                           key={`LinksBox-${narrative.id}`}
                        />
                        <Comments
                           comments={narrative.comments}
                           thingID={narrative.id}
                           member={member.me}
                           isNarrative
                           key={`Comments-${narrative.id}`}
                        />
                     </div>
                     <div className="narrativesBody">{narratives}</div>
                  </NarrativeContainer>
               )}
            </Member>
         );
      }}
   </Query>
);

export default ContextPage;
export { NARRATIVE_THINGS_QUERY };
