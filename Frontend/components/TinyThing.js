import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import psl from 'psl';
import AdminBar from './AdminBar';
import Error from './ErrorMessage.js';
import { convertISOtoAgo, extractHostname } from '../lib/utils';

const StyledTinyThing = styled.article`
    position: relative;
    margin: .5rem;
    background: ${props => props.theme.veryLowContrastCoolGrey};
    padding: .75rem 1.25rem;
    border-radius: 0 2px 2px 0;
    max-width: 1000px;
    overflow: hidden;
    overflow-wrap: break-word;
    word-wrap: break-word;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.lowContrastGrey};
    :before {
        content: '';
        background: ${props => props.theme.majorColor};
        width: .5rem;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        opacity: .8
    }
    h3 {
        font-size: 2.5rem;
        cursor: pointer;
        margin: 0rem;
        line-height: 1.25;
        white-space: normal;
    }
    div.meta {
    }
    .metaContainer {
      display: flex;
      align-items: center;
      margin-top: .4rem;
      p.meta, a.SubTitleLink {
         color: ${props => props.theme.highContrastGrey};
         font-size: 1.25rem;
         line-height: 1;
         opacity: .4;
         display: inline-block;
      }
      a.SubTitleLink {
         text-decoration: underline;
         max-width: 50%;
         margin-left: .25rem;
         &:hover {
            color: ${props => props.theme.mainText};
         }
      }
      p {
         margin: 0;
         span {
         }
      }
    }
    input, textarea {
        font-family: "Proxima Nova", sans-serif;
        width: 100%;
        line-height: 1;
        background: hsla(210, 50%, 40%, .1);
        border: none;
        /* border-bottom: 1px solid ${props => props.theme.highContrastGrey}; */
    }
    input {
        &[name="title"] {
            font-size: 2.25rem;
            font-weight: bold;
            padding: 0;
            margin: 0;
            color: ${props => props.theme.mainText};
        }
        &[name="url"] {
            color: ${props => props.theme.highContrastGrey};
            font-size: 1.25rem;
        }
    }
`;

const UPDATE_SUBMISSION_MUTATION = gql`
   mutation UPDATE_SUBMISSION_MUTATION(
      $id: ID!
      $title: String
      $url: String
      $description: String
   ) {
      updateSubmission(
         id: $id
         title: $title
         url: $url
         description: $description
      ) {
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
            <Link
               href={{
                  pathname: '/thing',
                  query: {
                     id: thing.id
                  }
               }}
            >
               <h3>
                  <a>{thing.title}</a>
               </h3>
            </Link>
            <div className="metaContainer">
               <p className="meta">
                  {convertISOtoAgo(thing.createdAt)}
                  {' AGO '}
                  <span>via</span>
               </p>
               <a
                  className="SubTitleLink"
                  href={thing.originalSource ? thing.originalSource : ''}
                  target="_blank"
               >
                  {thing.originalSource
                     ? psl
                          .parse(extractHostname(thing.originalSource))
                          .sld.toUpperCase()
                     : ''}
               </a>
            </div>
         </StyledTinyThing>
      );
   }
}

TinyThing.propTypes = {
   thing: PropTypes.object.isRequired
};

export default TinyThing;
