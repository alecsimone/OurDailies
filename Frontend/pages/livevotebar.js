import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Member from '../components/Member';
import VoteBar from '../components/ThingParts/VoteBar';
import { THING_SUBSCRIPTION } from './thing';

const LIVE_VOTEBAR_QUERY = gql`
   query LIVE_VOTEBAR_QUERY($id: ID!) {
      thing(where: { id: $id }) {
         id
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
      }
   }
`;

{
   /*  */
}

const LiveVoteBar = props => {
   const liveThingID = 'ck0660isb7fnt0b09rh569iu0';
   const addSubscription = (subscribeToMore, data) =>
      subscribeToMore({
         document: THING_SUBSCRIPTION,
         variables: { IDs: liveThingID },
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
               query={LIVE_VOTEBAR_QUERY}
               variables={{
                  id: liveThingID
               }}
            >
               {({ error, loading, data, subscribeToMore }) => (
                  <VoteBar
                     key={data.thing.id}
                     voteData={data.thing.votes}
                     passData={data.thing.passes}
                     finalistDate={data.thing.finalistDate}
                     thingID={data.thing.id}
                     member={memberData.me}
                     subscribeToUpdates={() =>
                        addSubscription(subscribeToMore, data)
                     }
                  />
               )}
            </Query>
         )}
      </Member>
   );
};

export default LiveVoteBar;
