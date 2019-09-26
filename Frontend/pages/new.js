import React, { useState } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Head from 'next/head';
import FullThing from '../components/FullThing';
import FullThingEmbed from '../components/FullThingEmbed';
import Error from '../components/ErrorMessage';
import Member from '../components/Member';
import MustSignIn from '../components/MustSignIn';
import ThingPicker from '../components/ThingPicker';
import { fullThingFields, getScoreForThing } from '../lib/utils';

const NEW_THINGS_QUERY = gql`
   query NEW_THINGS_QUERY {
      thingsForNew {
         ${fullThingFields}
      }
   }
`;

const StyledNew = styled.div`
   display: flex;
   flex-wrap: wrap;
   @media screen and (min-width: 800px) {
      flex-wrap: nowrap;
      .thingPicker {
         max-width: none;
      }
   }
   p.nothing {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => props.theme.majorColor};
      flex-grow: 1;
   }
   .thingPicker {
      flex-grow: 1;
      margin-left: 2rem;
      max-width: calc(100% - 4rem);
   }
`;

const newPage = () => {
   const [mainThingId, setMainThingId] = useState(false);

   const makeMain = function(id) {
      setMainThingId(id);
   };

   const highScoreSort = (a, b) => {
      const aScore = getScoreForThing(a);
      const bScore = getScoreForThing(b);
      if (aScore === bScore) {
         // Newer things first
         return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
         );
      }
      return bScore - aScore;
   };

   const lowScoreSort = (a, b) => {
      const aScore = getScoreForThing(a);
      const bScore = getScoreForThing(b);
      if (aScore === bScore) {
         // Older things first
         return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
         );
      }
      return aScore - bScore;
   };

   const getMainThing = function(things, memberID) {
      if (mainThingId !== false) {
         const mainThingInAnArray = things.filter(
            thing => thing.id === mainThingId
         );
         if (mainThingInAnArray.length > 0) {
            return mainThingInAnArray[0];
         }
      }
      const unvotedThings = things.filter(thing => {
         let hasVoted = false;
         thing.votes.forEach(vote => {
            if (vote.voter.id === memberID) hasVoted = true;
         });
         let hasPassed = false;
         thing.passes.forEach(pass => {
            if (pass.passer.id === memberID) hasPassed = true;
         });
         return !hasVoted && !hasPassed && !thing.eliminated;
      });
      if (unvotedThings.length === 0) {
         // Return the thing with the highest score
         things.sort(lowScoreSort);
         return things[0];
      }
      // Return the thing with the lowest score
      unvotedThings.sort(lowScoreSort);
      return unvotedThings[0];
   };

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

                     const unEliminatedThings = data.thingsForNew.filter(
                        thing => !thing.eliminated
                     );

                     const mainThing = getMainThing(
                        data.thingsForNew,
                        memberData.me.id
                     );
                     const otherThings = data.thingsForNew.filter(
                        thing => thing.id !== mainThing.id
                     );
                     otherThings.sort(highScoreSort);

                     let thingComponent = (
                        <>
                           <FullThing thing={mainThing} member={memberData} />
                           <ThingPicker
                              things={otherThings}
                              picker={makeMain}
                              defaultFilters={['eliminated']}
                           />
                        </>
                     );

                     if (unEliminatedThings.length === 0) {
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
};

export default newPage;
export { NEW_THINGS_QUERY };
