import { Query } from 'react-apollo';
import { CURRENT_MEMBER_QUERY } from './Member';
import Login from './Login';

const MustSignIn = props => (
   <Query query={CURRENT_MEMBER_QUERY}>
      {({ data, loading }) => {
         if (loading) return <p>Loading...</p>;
         if (!data.me) {
            const redirect = props.redirect == null ? false : props.redirect;
            return (
               <div>
                  <p className="logInPrompt">
                     {props.prompt
                        ? props.prompt
                        : 'You must be logged in to do that'}
                  </p>
                  <Login redirect={redirect} />
               </div>
            );
         }
         return props.children;
      }}
   </Query>
);

export default MustSignIn;
