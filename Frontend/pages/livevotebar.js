import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Member from '../components/Member';
import VoteBar from '../components/ThingParts/VoteBar';

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

const LiveVoteBar = props => (
   <Member>
      {({ data: memberData }) => (
         <Query
            query={LIVE_VOTEBAR_QUERY}
            variables={{
               id: 'ck0660isb7fnt0b09rh569iu0'
            }}
            pollInterval={2000}
         >
            {({ error, loading, data }) => (
               <VoteBar
                  key={data.thing.id}
                  voteData={data.thing.votes}
                  passData={data.thing.passes}
                  finalistDate={data.thing.finalistDate}
                  thingID={data.thing.id}
                  member={memberData.me}
               />
            )}
         </Query>
      )}
   </Member>
);

export default LiveVoteBar;
