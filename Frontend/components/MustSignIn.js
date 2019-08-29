import { Query } from "react-apollo";
import styled from "styled-components";
import { CURRENT_MEMBER_QUERY } from './Member';
import Login from './Login';

const StyledGate = styled.div`
   /* display: flex;
   flex-direction: column;
   align-content: flex-end; */
   height: 100%;
   p.logInPrompt {
      font-size: ${props => props.theme.bigText};
      font-weight: 500;
      /* position: absolute; */
      width: 100%;
      text-align: center;
   }
`;

const MustSignIn = props => (
   <Query query={CURRENT_MEMBER_QUERY}>
      {({ data, loading }) => {
         if (loading) return <p>Loading...</p>;
         if (!data.me) {
            const redirect = props.redirect == null ? false : props.redirect;
            return (
               <StyledGate>
                  <p className="logInPrompt">
                     {props.prompt
                        ? props.prompt
                        : "You must be logged in to do that"}
                  </p>
                  <Login redirect={redirect} />
               </StyledGate>
            );
         }
         return props.children;
      }}
   </Query>
);

export default MustSignIn;
