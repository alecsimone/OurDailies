import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Router from "next/router";
import Error from "./ErrorMessage";
import { CURRENT_MEMBER_QUERY } from "./Member";
import { StyledModal } from "../styles/ModalStyles";

const LOGIN_MUTATION = gql`
   mutation LOGIN_MUTATION($email: String!, $password: String!) {
      login(email: $email, password: $password) {
         id
         email
         displayName
      }
   }
`;

class Login extends Component {
   state = {
      email: '',
      password: ""
   };

   saveToState = e => {
      this.setState({ [e.target.name]: e.target.value });
   };

   render() {
      return (
         <Mutation
            mutation={LOGIN_MUTATION}
            variables={this.state}
            refetchQueries={[{ query: CURRENT_MEMBER_QUERY }]}
         >
            {(login, { error, loading }) => (
               <StyledModal
                  method="post"
                  onSubmit={async e => {
                     e.preventDefault();
                     await login();
                     if (this.props.redirect !== false) {
                        Router.push({
                           pathname: '/'
                        });
                     }
                     if (this.props.callBack) {
                        this.props.callBack();
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

                     <button type="submit">Log In</button>
                  </fieldset>
               </StyledModal>
            )}
         </Mutation>
      );
   }
}

Login.defaultProps = {
   redirect: '/'
};

export default Login;
