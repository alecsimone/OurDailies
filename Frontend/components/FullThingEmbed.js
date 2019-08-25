import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Link from "next/link";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import { convertISOtoAgo } from "../lib/utils";
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
   .embed {
      width: 67%;
      iframe {
         width: 100%;
         height: 100%;
      }
   }
   .thingInfo {
      width: 33%;
      background: ${props => props.theme.veryLowContrastCoolGrey};
      padding: 0.5rem 1.5rem;
      border-radius: 0 3px 3px 0;
      border-left: 3px solid ${props => props.theme.background};
      overflow: auto;
      h3 {
         margin: 0;
         font-size: 2.5rem;
      }
      .meta {
         color: ${props => props.theme.lightGrey};
         font-size: 1.25rem;
         line-height: 1;
         opacity: 0.6;
         display: flex;
         justify-content: space-between;
         margin-top: 0.4rem;
         padding-bottom: 1rem;
         border-bottom: 1px solid ${props => props.theme.lowContrastCoolGrey};
      }
   }
`;

class FullThingEmbed extends Component {
   render() {
      const { thing } = this.props;

      return (
         <StyledFullThing>
            <div className="embed">
               <iframe src={thing.originalSource} frameBorder="0" />
            </div>
            <div className="thingInfo">
               <div className="lede" />
               <h3>{thing.title}</h3>
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
                  key={'Summary-' + thing.id}
               />
               <NarrativesBoxEditable
                  partOfNarratives={thing.partOfNarratives}
                  thingID={thing.id}
                  key={'NarrativesBoxEditable-' + thing.id}
               />
               <VoteBar key={thing.id} />
               <LinksBox
                  things={thing.includedThings}
                  links={thing.includedLinks}
                  thingID={thing.id}
                  key={'LinksBox-' + thing.id}
               />
               <Comments
                  comments={thing.comments}
                  thingID={thing.id}
                  key={'Comments-' + thing.id}
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
