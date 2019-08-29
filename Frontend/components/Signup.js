import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Router from "next/router";
import Error from "./ErrorMessage.js";
import { CURRENT_MEMBER_QUERY } from "./Member";
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

class Signup extends Component {
   state = {
      displayName: '',
      password: '',
      email: ""
   };

   saveToState = e => {
      this.setState({ [e.target.name]: e.target.value });
   };

   render() {
      return (
         <Mutation
            mutation={SIGNUP_MUTATION}
            variables={this.state}
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
                     if (this.props.callBack) {
                        this.props.callBack();
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
                           value={this.state.displayName}
                           onChange={this.saveToState}
                        />
                     </label>
                     <label htmlFor="email">
                        <input
                           type="email"
                           name="email"
                           placeholder="Email"
                           value={this.state.email}
                           onChange={this.saveToState}
                        />
                     </label>
                     <label htmlFor="password">
                        <input
                           type="password"
                           name="password"
                           placeholder="Password"
                           value={this.state.password}
                           onChange={this.saveToState}
                        />
                     </label>

                     <button type="submit">Sign Up</button>
                  </fieldset>
               </StyledModal>
            )}
         </Mutation>
      );
   }
}

export default Signup;
