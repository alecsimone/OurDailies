import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Router from 'next/router';
import Error from './ErrorMessage';
import { CURRENT_MEMBER_QUERY } from './Member';
import { StyledModal } from '../styles/ModalStyles';

const LOGIN_MUTATION = gql`
   mutation LOGIN_MUTATION($email: String!, $password: String!) {
      login(email: $email, password: $password) {
         id
         email
         displayName
      }
   }
`;

const Login = props => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const saveToState = function(e) {
      if (e.target.name === 'email') {
         setEmail(e.target.value);
      }
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
   };

   return (
      <Mutation
         mutation={LOGIN_MUTATION}
         variables={{ email, password }}
         refetchQueries={[{ query: CURRENT_MEMBER_QUERY }]}
      >
         {(login, { error, loading }) => (
            <StyledModal
               method="post"
               onSubmit={async e => {
                  e.preventDefault();
                  await login();
                  if (props.redirect !== false) {
                     Router.push({
                        pathname: '/'
                     });
                  }
                  if (props.callBack) {
                     props.callBack();
                  }
               }}
            >
               <fieldset disabled={loading} aria-busy={loading}>
                  <Error error={error} />
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

                  <button type="submit">Log In</button>
               </fieldset>
            </StyledModal>
         )}
      </Mutation>
   );
};

Login.defaultProps = {
   redirect: '/'
};

export default Login;
