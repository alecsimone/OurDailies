import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Router from 'next/router';
import Error from './ErrorMessage';
import {CURRENT_MEMBER_QUERY} from './Member';

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
        email: "",
        password: "",
    }

    saveToState = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }
    render() {
        return (
            <Mutation 
                mutation={LOGIN_MUTATION} 
                variables={this.state}
                refetchQueries={[{query: CURRENT_MEMBER_QUERY}]}
            >
                {(login, {error, loading}) => {
                    return(<form 
                        method="post" 
                        onSubmit={async e => {
                            e.preventDefault();
                            await login();
                            Router.push({
                                pathname: '/',
                            });
                        }
                    }>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Log In</h2>
                            <Error error={error} />
                            <label htmlFor="email">
                                Email
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="email" 
                                    value={this.state.email} 
                                    onChange={this.saveToState} 
                                    />
                            </label>
                            <label htmlFor="password">
                                Password
                                <input 
                                type="password" 
                                name="password" 
                                placeholder="password" 
                                value={this.state.password} 
                                onChange={this.saveToState} 
                                />
                            </label>

                            <button type="submit">Log In</button>
                        </fieldset> 
                    </form>)
                }}
            </Mutation>
        );
    }
}

export default Login;