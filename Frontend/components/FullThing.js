import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { convertISOtoAgo } from "../lib/utils";
import Error from './ErrorMessage';
import Member from './Member';
import VoteBar from './ThingParts/VoteBar';
import NarrativesBoxEditable from './ThingParts/NarrativesBoxEditable';
import LinksBox from './ThingParts/LinksBox';
import Summary from './ThingParts/Summary';
import Comments from './ThingParts/Comments';
import FeaturedImageCarousel from './ThingParts/FeaturedImageCarousel';

const StyledFullThing = styled.article`
   position: relative;
   margin: 0.5rem;
   margin-bottom: 60vh;
   padding: 2rem;
   border-radius: 2px 2px;
   width: 100%;
   max-width: 1280px;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   box-shadow: 0 0.1rem 0.4rem
      ${props => props.theme.highContrastSecondaryAccent};
   :before {
      content: "";
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
      h3.headline {
         font-size: ${props => props.theme.bigHead};
         margin: 0rem;
         line-height: 1;
         position: absolute;
         bottom: 0;
         left: 0;
         width: 100%;
         padding: 12rem 2rem 1.25rem;
         text-shadow: 0px 0px 2px black;
         background: black;
         background: -moz-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* FF3.6-15 */
         background: -webkit-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* Chrome10-25,Safari5.1-6 */
         background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
         filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 ); /* IE6-9 */
      }
   }
   .meta {
      color: ${props => props.theme.lightGrey};
      font-size: ${props => props.theme.tinyText};
      line-height: 1;
      opacity: 0.6;
      display: flex;
      justify-content: space-between;
      margin-top: 0.4rem;
   }
   h5 {
      font-size: ${props => props.theme.smallText};
      margin: 0 0 1.5rem;
      text-align: center;
   }
`;

class FullThing extends Component {
   render() {
      const { thing } = this.props;

      return (
         <Member>
            {({ data: memberData }) => (
               <StyledFullThing>
                  <div className="lede">
                     <FeaturedImageCarousel
                        featuredImage={thing.featuredImage}
                        includedLinks={thing.includedLinks}
                        headline={thing.title}
                        thingID={thing.id}
                        member={memberData.me}
                        key={'FeaturedImageCarousel-' + thing.id}
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
                     member={memberData.me}
                     key={'Summary-' + thing.id}
                  />
                  <NarrativesBoxEditable
                     partOfNarratives={thing.partOfNarratives}
                     thingID={thing.id}
                     member={memberData.me}
                     key={'NarrativesBoxEditable-' + thing.id}
                  />
                  <VoteBar key={thing.id} />
                  <LinksBox
                     things={thing.includedThings}
                     links={thing.includedLinks}
                     thingID={thing.id}
                     member={memberData.me}
                     key={'LinksBox-' + thing.id}
                  />
                  <Comments
                     comments={thing.comments}
                     thingID={thing.id}
                     member={memberData.me}
                     key={'Comments-' + thing.id}
                  />
               </StyledFullThing>
            )}
         </Member>
      );
   }
}

// Thing.propTypes = {
//     thing: PropTypes.object.isRequired,
// };

export default FullThing;
