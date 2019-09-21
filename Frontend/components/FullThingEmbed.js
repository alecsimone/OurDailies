import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import { convertISOtoAgo } from '../lib/utils';
import VoteBar from './ThingParts/VoteBar';
import NarrativesBoxEditable from './ThingParts/NarrativesBoxEditable';
import LinksBox from './ThingParts/LinksBox';
import Summary from './ThingParts/Summary';
import Comments from './ThingParts/Comments';

const StyledFullThing = styled.article`
   position: relative;
   width: 100%;
   display: flex;
   border: 2px solid ${props => props.theme.lowContrastGrey};
   border-radius: 3px;
   max-height: 90vh;
   height: 100%;
   .embed {
      width: 67%;
      position: relative;
      iframe {
         width: 100%;
         height: 100%;
         z-index: 2;
      }
      .warning {
         position: absolute;
         top: 0;
         width: 80%;
         left: 10%;
         top: 40%;
         z-index: -1;
      }
   }
   .thingInfo {
      /* width: 33%;
      background: ${props => props.theme.veryLowContrastCoolGrey}; */
      padding: 0.5rem 1.5rem;
      border-radius: 0 3px 3px 0;
      /* border-left: 3px solid ${props => props.theme.background}; */
      overflow: auto;
      h3.headline {
         margin: 0;
         font-size: ${props => props.theme.smallHead};
      }
      .meta {
         color: ${props => props.theme.highContrastGrey};
         font-size: ${props => props.theme.tinyText};
         line-height: 1;
         opacity: 0.6;
         display: flex;
         justify-content: space-between;
         margin-top: 0.4rem;
         padding-bottom: 1rem;
         border-bottom: 1px solid ${props => props.theme.lowContrastCoolGrey};
      }
      .metaContainer p.meta {
         border: none;
         padding: 0;
         margin: 0;
      }
      scrollbar-width: thin;
      &::-webkit-scrollbar {
         width: 0.5rem;
         background: ${props => props.theme.background};
      }
      &::-webkit-scrollbar-track {
         -webkit-box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.3);
      }
      &::-webkit-scrollbar-thumb {
         border-radius: 3px;
         -webkit-box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.5);
         background: ${props => props.theme.lowContrastGrey};
      }
   }
   .autocompleteSuggestions {
      max-width: 500px;
   }
`;

class FullThingEmbed extends Component {
   componentDidMount() {
      if (this.props.subscribeToUpdates != null) {
         this.props.subscribeToUpdates();
      }
   }

   render() {
      const { thing, member } = this.props;

      return (
         <StyledFullThing>
            <div className="embed">
               <iframe src={thing.originalSource} frameBorder="0" />
               <div className="warning">
                  Many news sites do not allow their content to be embedded. If
                  you're seeing a big black box here, that's probably what's
                  happening. You can click the title over on the right and go
                  straight to the content. Sorry about that.
               </div>
            </div>
            <div className="thingInfo">
               <div className="lede" />
               <h3 className="headline">
                  <a href={thing.originalSource} target="_blank">
                     {thing.title}
                  </a>
               </h3>
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
                  author={thing.author}
                  member={member.me}
                  key={`Summary-${thing.id}`}
               />
               <NarrativesBoxEditable
                  partOfNarratives={thing.partOfNarratives}
                  thingID={thing.id}
                  member={member.me}
                  key={`NarrativesBoxEditable-${thing.id}`}
               />
               <VoteBar
                  key={thing.id}
                  voteData={thing.votes}
                  passData={thing.passes}
                  finalistDate={thing.finalistDate}
                  winner={thing.winner}
                  thingID={thing.id}
                  member={member.me}
               />
               <LinksBox
                  things={thing.includedThings}
                  links={thing.includedLinks}
                  thingID={thing.id}
                  member={member.me}
                  key={`LinksBox-${thing.id}`}
               />
               <Comments
                  comments={thing.comments}
                  thingID={thing.id}
                  member={member.me}
                  key={`Comments-${thing.id}`}
               />
            </div>
         </StyledFullThing>
      );
   }
}

// Thing.propTypes = {
//     thing: PropTypes.object.isRequired,
// };

export default FullThingEmbed;
