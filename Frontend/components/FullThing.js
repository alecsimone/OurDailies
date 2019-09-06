import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation, Subscription } from 'react-apollo';
import gql from 'graphql-tag';
import { convertISOtoAgo } from '../lib/utils';
import Error from './ErrorMessage';
import VoteBar from './ThingParts/VoteBar';
import NarrativesBoxEditable from './ThingParts/NarrativesBoxEditable';
import LinksBox from './ThingParts/LinksBox';
import Summary from './ThingParts/Summary';
import Comments from './ThingParts/Comments';
import FeaturedImageCarousel from './ThingParts/FeaturedImageCarousel';

const StyledFullThing = styled.article`
   position: relative;
   margin: 0.5rem;
   padding: 1rem;
   margin-bottom: 6rem;
   @media screen and (min-width: 800px) {
      margin-bottom: 60vh;
      padding: 2rem;
      background: ${props => props.theme.veryLowContrastCoolGrey};
      box-shadow: 0 0.1rem 0.4rem
         ${props => props.theme.highContrastSecondaryAccent};
   }
   border-radius: 2px 2px;
   width: 100%;
   max-width: 1280px;
   background: none;
   :before {
      content: '';
      background: ${props => props.theme.majorColor};
      z-index: -1;
      height: 5rem;
      width: 100%;
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.8;
      border-radius: 2px 2px 0 0;
      box-shadow: 0 -0.2rem 0.4rem ${props => props.theme.majorColor};
   }
   .lede {
      position: relative;
   }
   div.meta {
      color: ${props => props.theme.highContrastGrey};
      font-size: ${props => props.theme.smallText};
      line-height: 1;
      opacity: 1;
      display: flex;
      justify-content: space-between;
      margin-top: 0.8rem;
      padding: 2rem 1rem;
      @media screen and (min-width: 800px) {
         font-size: ${props => props.theme.tinyText};
         margin-top: 0.4rem;
         padding: 0;
         opacity: 0.6;
      }
   }
   h5 {
      font-size: ${props => props.theme.smallText};
      margin: 0 0 1.5rem;
      text-align: center;
   }
   .thingsAndLinks {
      @media screen and (min-width: 800px) {
         flex-wrap: nowrap;
         .things {
            max-width: 66%;
            margin: 3rem 0;
         }
         .links {
            max-width: 50%;
            margin: 3rem 0;
            ul {
               padding-left: 4rem;
            }
         }
      }
   }
`;

class FullThing extends Component {
   render() {
      const { thing, member } = this.props;

      return (
         <StyledFullThing>
            <div className="lede">
               <FeaturedImageCarousel
                  thing={thing}
                  featuredImage={thing.featuredImage}
                  includedLinks={thing.includedLinks}
                  originalSource={thing.originalSource}
                  headline={thing.title}
                  thingID={thing.id}
                  member={member.me}
                  key={`FeaturedImageCarousel-${  thing.id}`}
               />
            </div>
            <div className="meta">
               {convertISOtoAgo(thing.createdAt)}
               {' AGO '}
               {thing.author ? (
                  <div>Submitted by {thing.author.displayName}</div>
               ) : (
                  ''
               )}
            </div>
            <Summary
               summary={thing.summary}
               thingID={thing.id}
               member={member.me}
               key={`Summary-${  thing.id}`}
            />
            <NarrativesBoxEditable
               partOfNarratives={thing.partOfNarratives}
               thingID={thing.id}
               member={member.me}
               key={`NarrativesBoxEditable-${  thing.id}`}
            />
            <VoteBar
               key={thing.id}
               voteData={thing.votes}
               passData={thing.passes}
               finalistDate={thing.finalistDate}
               thingID={thing.id}
               member={member.me}
            />
            <LinksBox
               things={thing.includedThings}
               links={thing.includedLinks}
               thingID={thing.id}
               member={member.me}
               key={`LinksBox-${  thing.id}`}
            />
            <Comments
               comments={thing.comments}
               thingID={thing.id}
               member={member.me}
               key={`Comments-${  thing.id}`}
            />
         </StyledFullThing>
      );
   }
}

// Thing.propTypes = {
//     thing: PropTypes.object.isRequired,
// };

export default FullThing;
