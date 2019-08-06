import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';
import Error from './ErrorMessage.js';

const CREATE_SUBMISSION_MUTATION = gql`
    mutation CREATE_SUBMISSION_MUTATION($title: String!, $url: String!, $description: String!, $author: MemberCreateOneInput!) {
        createSubmission(
            title: $title
            url: $url
            description: $description
            author: $author
        ) {
            id
        }
    }
`;

const StyledSubmitForm = styled.form`
    max-width: 800px;
    margin: auto;
    text-align: center;
    h2 {
        margin: 1rem auto;
    }
    fieldset {
        border: none;
    }
    input, textarea {
        font-size: 1.5rem;
        width: 100%;
        margin: 1rem 0;
        padding: .75rem;
        border-radius: 3px;
        border: 1px solid ${props => props.theme.darkGrey};
    }
    textarea {
        font-family: "Proxima Nova", sans-serif; 
    }
    button {
        background: ${props => props.theme.blue};
        border: none;
        border-radius: 2px;
        font-size: 1.5rem;
        margin-top: 1rem;
        padding: .75rem 2.25rem;
        color: ${props => props.theme.white};
        cursor: pointer;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
    }

`;

class SubmitForm extends Component {
    state = {
        title: '',
        url: '',
        description: '',
        author: {
            connect: {
                id: "cjyyzqs1zvnjo0b55cvpycxqs"
            }
        }
    }

    handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({ [name]: val});
    }

    render() {
        return (
            <Mutation mutation={CREATE_SUBMISSION_MUTATION} variables={this.state} >
                {(createSubmission, {loading, error, called, data}) => (    
                    <StyledSubmitForm onSubmit={async e => {
                        e.preventDefault();
                        const res = await createSubmission();
                        Router.push({
                            pathname: '/thing',
                            query: { 
                                id: res.data.createSubmission.id,
                                type: "submission"
                            }
                        });
                    }}>
                        <h2>Share a Thing</h2>
                        <Error error={error} />
                        <fieldset disabled={loading} aria-busy={loading} >
                            <label htmlFor="title">
                                <input type="text" id="title" name="title" placeholder="Title" required value={this.state.title} onChange={this.handleChange} />
                            </label>
                            <label htmlFor="url">
                                <input type="text" id="url" name="url" placeholder="URL" required value={this.state.url} onChange={this.handleChange} />
                            </label>
                            <label htmlFor="description">
                                <textarea type="textarea" id="description" name="description" placeholder="Why should anyone care?" required value={this.state.description} onChange={this.handleChange} />
                            </label>
                            <button type="submit">Submit</button>
                        </fieldset>
                    </StyledSubmitForm>
                )}
            </Mutation>
        );
    }
}

export default SubmitForm;
export { CREATE_SUBMISSION_MUTATION }