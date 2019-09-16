import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import psl from 'psl';
import Error from './ErrorMessage.js';
import {
   convertISOtoAgo,
   extractHostname,
   getScoreForThing
} from '../lib/utils';

const StyledTinyThing = styled.article`
   display: flex;
   align-items: center;
   position: relative;
   margin: 0.5rem;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   padding: 0.75rem 1.25rem;
   border-radius: 0 2px 2px 0;
   min-width: 30rem;
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
      width: 0.5rem;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.8;
   }
   .featuredImage {
      width: 5rem;
      min-width: 5rem;
      height: 5rem;
      margin-right: 1rem;
      img {
         height: 100%;
         width: 100%;
         object-fit: cover;
      }
   }
   h3 {
      font-size: ${props => props.theme.bigText};
      cursor: pointer;
      margin: 0rem;
      line-height: 1.25;
      white-space: normal;
      text-align: left;
   }
   div.meta {
   }
   .metaContainer {
      display: flex;
      align-items: center;
      margin: 0.5rem 0;
      /* position: relative; */
      p.meta,
      a.SubTitleLink {
         color: ${props => props.theme.highContrastGrey};
         font-size: ${props => props.theme.tinyText};
         line-height: 1;
         opacity: 0.6;
         display: inline-block;
      }
      a.SubTitleLink {
         text-decoration: underline;
         max-width: 50%;
         margin-left: 0.25rem;
         &:hover {
            color: ${props => props.theme.mainText};
         }
      }
      p {
         margin: 0;
         span.score {
            color: ${props => props.theme.secondaryAccent};
            margin-right: 0.25rem;
            font-weight: 600;
         }
      }
      input {
         position: absolute;
         height: 100%;
         right: 0.75rem;
         top: 0;
         margin: 0;
      }
   }
`;

class TinyThing extends Component {
   render() {
      const { thing } = this.props;

      return (
         <StyledTinyThing className="tinyThing">
            <div className="featuredImage">
               <img
                  src={
                     thing.featuredImage != null
                        ? thing.featuredImage
                        : '/static/defaultPic.jpg'
                  }
                  alt="tinyFeaturedImage"
                  className="tinyFeaturedImage"
               />
            </div>
            <div className="thingInfo">
               <Link
                  href={{
                     pathname: '/thing',
                     query: {
                        id: thing.id
                     }
                  }}
               >
                  <a>
                     <h3>{thing.title}</h3>
                  </a>
               </Link>
               <div className="metaContainer">
                  <p className="meta">
                     {thing.votes != null && (
                        <span className="score">
                           +{getScoreForThing(thing)}{' '}
                        </span>
                     )}
                     {convertISOtoAgo(thing.createdAt)}
                     {' AGO '}
                     <span className="via">via</span>
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
                  {this.props.checkbox && (
                     <input
                        type="checkbox"
                        onChange={e => {
                           e.preventDefault();
                           this.props.checkbox(thing.id);
                        }}
                     />
                  )}
               </div>
            </div>
         </StyledTinyThing>
      );
   }
}

TinyThing.propTypes = {
   thing: PropTypes.object.isRequired
};

export default TinyThing;
