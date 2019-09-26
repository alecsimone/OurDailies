import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Router from 'next/router';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import { CURRENT_MEMBER_QUERY } from './Member';

const RESET_MUTATION = gql`
   mutation RESET_MUTATION(
      $resetToken: String!
      $password: String!
      $confirmPassword: String!
   ) {
      resetPassword(
         resetToken: $resetToken
         password: $password
         confirmPassword: $confirmPassword
      ) {
         id
         email
         displayName
      }
   }
`;

const Reset = props => {
   const propTypes = {
      resetToken: PropTypes.string.isRequired
   };

   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');

   const saveToState = function(e) {
      console.log(e.target.name);
      if (e.target.name === 'password') {
         setPassword(e.target.value);
      }
      if (e.target.name === 'confirmPassword') {
         setConfirmPassword(e.target.value);
      }
   };
   return (
      <Mutation
         mutation={RESET_MUTATION}
         variables={{
            resetToken: props.resetToken,
            password,
            confirmPassword
         }}
         refetchQueries={[{ query: CURRENT_MEMBER_QUERY }]}
      >
         {(reset, { error, loading, called }) => (
            <form
               method="post"
               onSubmit={async e => {
                  e.preventDefault();
                  await reset();
                  Router.push({
                     pathname: '/'
                  });
               }}
            >
               <fieldset disabled={loading} aria-busy={loading}>
                  <h2>Enter a new password</h2>
                  <Error error={error} />
                  <label htmlFor="password">
                     Password
                     <input
                        type="password"
                        name="password"
                        placeholder="password"
                        value={password}
                        onChange={saveToState}
                     />
                  </label>
                  <label htmlFor="confirmPassword">
                     Confirm Password
                     <input
                        type="password"
                        name="confirmPassword"
                        placeholder="confirmPassword"
                        value={confirmPassword}
                        onChange={saveToState}
                     />
                  </label>

                  <button type="submit">Reset Password</button>
               </fieldset>
            </form>
         )}
      </Mutation>
   );
};

export default Reset;
