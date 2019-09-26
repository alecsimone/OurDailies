import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Router from 'next/router';
import Error from './ErrorMessage.js';
import { CURRENT_MEMBER_QUERY } from './Member';
import { StyledModal } from '../styles/ModalStyles';

const SIGNUP_MUTATION = gql`
   mutation SIGNUP_MUTATION(
      $email: String!
      $displayName: String!
      $password: String!
   ) {
      signup(email: $email, displayName: $displayName, password: $password) {
         id
         email
         displayName
      }
   }
`;

const Signup = props => {
   const [displayName, setDisplayName] = useState('');
   const [password, setPassword] = useState('');
   const [email, setEmail] = useState('');

   const saveToState = function(e) {
      if (e.target.name === 'displayName') {
         setDisplayName(e.target.value);
      }
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
      if (e.target.name === 'email') {
         setEmail(e.target.value);
      }
   };

   return (
      <Mutation
         mutation={SIGNUP_MUTATION}
         variables={{ displayName, password, email }}
         refetchQueries={[{ query: CURRENT_MEMBER_QUERY }]}
      >
         {(signup, { error, loading }) => (
            <StyledModal
               method="post"
               onSubmit={async e => {
                  e.preventDefault();
                  await signup();
                  Router.push({
                     pathname: '/'
                  });
                  if (props.callBack) {
                     props.callBack();
                  }
               }}
            >
               <fieldset disabled={loading} aria-busy={loading}>
                  <Error error={error} />
                  <label htmlFor="displayName">
                     <input
                        type="text"
                        name="displayName"
                        placeholder="Display Name"
                        value={displayName}
                        onChange={saveToState}
                     />
                  </label>
                  <label htmlFor="email">
                     <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={saveToState}
                     />
                  </label>
                  <label htmlFor="password">
                     <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={saveToState}
                     />
                  </label>

                  <button type="submit">Sign Up</button>
               </fieldset>
            </StyledModal>
         )}
      </Mutation>
   );
};

export default Signup;
