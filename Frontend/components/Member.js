import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import propTypes from 'prop-types';

const CURRENT_MEMBER_QUERY = gql`
   query {
      me {
         id
         email
         displayName
         avatar
         roles
         avatar
         rep
         points
         giveableRep
         twitterUserName
         twitterUserID
         twitterUserToken
         twitterUserTokenSecret
         twitterSinceIDsObject
         twitterSeenIDs
      }
   }
`;

const Member = props => (
   <Query {...props} query={CURRENT_MEMBER_QUERY}>
      {payload => props.children(payload)}
   </Query>
);

Member.propTypes = {
   children: propTypes.func.isRequired
};

export { CURRENT_MEMBER_QUERY };
export default Member;
