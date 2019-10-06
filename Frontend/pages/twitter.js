import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import Member from '../components/Member';
import TwitterReader from '../components/TwitterReader';
import MustSignIn from '../components/MustSignIn';

const START_TWITTER_LOGIN = gql`
   mutation START_TWITTER_LOGIN {
      initiateTwitterLogin {
         message
      }
   }
`;

const FINISH_TWITTER_LOGIN = gql`
   query FINISH_TWITTER_LOGIN($token: String!, $verifier: String!) {
      finishTwitterLogin(token: $token, verifier: $verifier) {
         message
      }
   }
`;

const startLogin = async initiateTwitterLogin => {
   const { data } = await initiateTwitterLogin();
   window.location.replace(data.initiateTwitterLogin.message);
};

const TwitterPage = props => (
   <MustSignIn>
      <Member queryString="twitterUserName, twitterUserID, twitterUserToken, twitterUserTokenSecret twitterSinceIDsObject twitterSeenIDsObject">
         {({ data: memberData }) => (
            <div>
               {/* If we don't have twitter connected for this member */}
               {memberData.me.twitterUserName == null &&
                  memberData.me.twitterUserID == null &&
                  memberData.me.twitterUserToken == null &&
                  memberData.me.twitterUserTokenSecret == null && (
                     <div>
                        {props.query.oauth_token == null &&
                           props.query.oauth_verifier == null && (
                              <Mutation mutation={START_TWITTER_LOGIN}>
                                 {(
                                    initiateTwitterLogin,
                                    { loading, error }
                                 ) => (
                                    <button
                                       onClick={() =>
                                          startLogin(initiateTwitterLogin)
                                       }
                                    >
                                       Login With Twitter
                                    </button>
                                 )}
                              </Mutation>
                           )}
                        {props.query.oauth_token != null &&
                           props.query.oauth_verifier != null && (
                              <Query
                                 query={FINISH_TWITTER_LOGIN}
                                 variables={{
                                    token: props.query.oauth_token,
                                    verifier: props.query.oauth_verifier
                                 }}
                              >
                                 {({ error, loading, data }) => (
                                    <div>Refresh and you'll be logged in!</div>
                                 )}
                              </Query>
                           )}
                     </div>
                  )}
               {/* If we do have Twitter connected for this member */}
               {memberData.me.twitterUserName != null &&
                  memberData.me.twitterUserID != null &&
                  memberData.me.twitterUserToken != null &&
                  memberData.me.twitterUserTokenSecret != null && (
                     <TwitterReader
                        userID={memberData.me.twitterUserID}
                        userName={memberData.me.twitterUserName}
                        userToken={memberData.me.twitterUserToken}
                        userTokenSecret={memberData.me.twitterUserTokenSecret}
                        userSinceIDsObject={memberData.me.twitterSinceIDsObject}
                        userSeenIDsObject={memberData.me.twitterSeenIDsObject}
                        startingList={props.query.listname}
                     />
                  )}
            </div>
         )}
      </Member>
   </MustSignIn>
);

export default TwitterPage;
