import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import AdminBar from './AdminBar';
import Error from './ErrorMessage.js';

const StyledTinyThing = styled.article`
    position: relative;
    margin: .5rem;
    background: hsla(0, 0%, 50%, .1);
    padding: .5rem 1.25rem;
    border-radius: 0 2px 2px 0;
    max-width: 1000px;
    overflow: hidden;
    overflow-wrap: break-word;
    word-wrap: break-word;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.darkGrey};
    :before {
        content: '';
        background: ${props => props.theme.blue};
        width: .5rem;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: .8
    }
    h3 {
        font-size: 2.25rem;
        cursor: pointer;
        margin: 0rem;
        line-height: 1;
    }
    p.meta, a.SubTitleLink {
        color: ${props => props.theme.lightGrey};
        font-size: 1.25rem;
        line-height: 1;
        opacity: .6;
    }
    a.SubTitleLink {
        font-style: italic;
        text-decoration: underline;
        margin-right: .5rem;
    }
    p {
        margin: .25rem 0 0 0;
    }
    input, textarea {
        font-family: "Proxima Nova", sans-serif;
        width: 100%;
        line-height: 1;
        background: hsla(210, 50%, 40%, .1);
        border: none;
        /* border-bottom: 1px solid ${props => props.theme.lightGrey}; */
    }
    input {
        &[name="title"] {
            font-size: 2.25rem;
            font-weight: bold;
            padding: 0;
            margin: 0;
            color: ${props => props.theme.white};
        }
        &[name="url"] {
            color: ${props => props.theme.lightGrey};
            font-size: 1.25rem;
        }
    }
`;

const UPDATE_SUBMISSION_MUTATION = gql`
    mutation UPDATE_SUBMISSION_MUTATION($id: ID!, $title: String, $url: String, $description: String) {
        updateSubmission(id: $id, title: $title, url: $url, description: $description) {
            id
            title
            url
            description
        }
    }
`;


class TinyThing extends Component {
    state = {
        editable: false,
        // title: this.props.thing.title,
        // link: this.props.thing.link,
    }

    handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({
            [name]: val
        });
    }

    detectSubmit = async (e, updateSubmissionMutation) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            const res = await updateSubmissionMutation({
                variables: {
                    id: this.props.thing.id,
                    ...this.state.edits,
                }
            });
            this.toggleEditing();
        }
    }

    toggleEditing = () => {
        this.setState({editable: !this.state.editable});
    }

    render() {
        const { thing } = this.props;

        return (
            <Mutation mutation={UPDATE_SUBMISSION_MUTATION} variables={this.state}>
                {(updateSubmission, { loading, error }) => (
                    <StyledTinyThing>
                        <Error error={error} />
                        {
                            this.state.editable ? 
                                <input type="text" id="title" name="title" placeholder="Title" defaultValue={thing.title} onChange={this.handleChange} onKeyDown={(e) => this.detectSubmit(e, updateSubmission)} />
                            : 
                                <Link href={{
                                    pathname: '/thing',
                                    query: { 
                                        id: thing.id,
                                        type: "submission"
                                    },
                                }}>
                                    <h3><a>{this.state.title ? this.state.title : thing.title}</a></h3>
                                </Link>
                        }
                        {
                            this.state.editable ?
                                <input type="text" id="url" name="url" placeholder="URL" defaultValue={thing.url} onChange={this.handleChange} onKeyDown={(e) => this.detectSubmit(e, updateSubmission)} />
                            :
                                <a className="SubTitleLink" href={this.state.url ? this.state.url : thing.url} target="_blank">{thing.url}</a>
                        }
                        <p className="meta">Created at {thing.createdAt} by {thing.author.displayName}</p>
                    </StyledTinyThing>
                )}
            </Mutation>
        );
    }
}

TinyThing.propTypes = {
    thing: PropTypes.object.isRequired,
};

export default TinyThing;