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
    padding: .75rem 1.25rem;
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
        line-height: 1.25;
        white-space: normal;
    }
    div.meta {
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
    render() {
        const { thing } = this.props;
        const type = thing.__typename.toLowerCase();

        return (
            <StyledTinyThing>
                <Link href={{
                    pathname: '/thing',
                    query: { 
                        id: thing.id,
                        type,
                    },
                }}>
                    <h3><a>{thing.title}</a></h3>
                </Link>
                <a className="SubTitleLink" href={thing.url ? thing.url : ""} target="_blank">{thing.url ? thing.url : ""}</a>
                <p className="meta">Created at {thing.createdAt} {thing.author ? ` by ${thing.author.displayName}` : ''}</p>
            </StyledTinyThing>
        );
    }
}

TinyThing.propTypes = {
    thing: PropTypes.object.isRequired,
};

export default TinyThing;