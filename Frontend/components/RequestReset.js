import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Router from 'next/router';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION($email: String!) {
        requestReset(email: $email) {
            message
        }
    }
`;

class RequestReset extends Component {
    state = {
        email: "",
    }

    saveToState = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }
    render() {
        return (
            <Mutation 
                mutation={REQUEST_RESET_MUTATION} 
                variables={this.state}
            >
                {(reset, {error, loading, called}) => {
                    return(<form 
                        method="post" 
                        onSubmit={async e => {
                            e.preventDefault();
                            await reset();
                            this.setState({email: ""});
                        }
                    }>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2>Request a password reset</h2>
                            <Error error={error} />
                            {!error && !loading && called && <p>Done. Check your email for the reset link.</p>}
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

                            <button type="submit">Request reset</button>
                        </fieldset> 
                    </form>)
                }}
            </Mutation>
        );
    }
}

export default RequestReset;