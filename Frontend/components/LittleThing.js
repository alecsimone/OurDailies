import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import VoteBar from './ThingParts/VoteBar';
import Member from './Member';
import { convertISOtoAgo } from '../lib/utils';
import { GET_VOTES } from './Thing';

const StyledLittleThing = styled.article`
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   position: relative;
   padding: 1.25rem 1rem 0 1rem;
   /* justify-self: center; */
   align-items: flex-start;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   border-radius: 2px;
   box-shadow: 0 0 0.25rem ${props => props.theme.secondaryAccentGlow};
   :before {
      content: '';
      background: ${props => props.theme.majorColor};
      box-shadow: 0 -0.1rem 0.2rem ${props => props.theme.majorColor};
      z-index: -1;
      width: 100%;
      height: 2.75rem;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.8;
      border-radius: 2px 2px 0 0;
   }
   div.lede {
      width: 100%;
      flex-grow: 1;
      max-height: 50%;
      position: relative;
      h3 {
         position: absolute;
         bottom: 0;
         left: 0;
         margin: 0;
         width: 100%;
         font-size: ${props => props.theme.smallHead};
         text-shadow: 0 3px 6px black;
         z-index: 2;
         padding: 6rem 1.5rem 0.75rem;
         background: -moz-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.8) 10rem,
            rgba(0, 0, 0, 1) 100%
         ); /* FF3.6-15 */
         background: -webkit-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.8) 10rem,
            rgba(0, 0, 0, 1) 100%
         ); /* Chrome10-25,Safari5.1-6 */
         background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.8) 10rem,
            rgba(0, 0, 0, 1) 100%
         ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
         filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 ); /* IE6-9 */
      }
      img {
         width: 100%;
         height: 100%;
         object-fit: cover;
         z-index: -2;
      }
   }
   p.meta {
      color: ${props => props.theme.lowContrastGrey};
      font-style: italic;
      margin: 0.5rem 1.5rem;
   }
   div.narratives {
      padding: 6rem 1.5rem 3rem;
      flex-grow: 1;
      width: 95%;
      h5 {
         color: ${props => props.theme.primaryAccent};
         font-size: ${props => props.theme.bigText};
         font-weight: 400;
         margin: 0 0 1rem;
      }
      span {
         margin-right: 0.5rem;
      }
      a {
         color: ${props => props.theme.highContrastGrey};
         font-size: ${props => props.theme.smallText};
         font-weight: 300;
      }
   }
   .VoteBarWrapper {
      width: calc(100% + 2rem);
      margin-left: -1rem;
      .voteAndPassBars {
         display: flex;
         flex-direction: column-reverse;
         .votebar {
            margin: 1.6rem 0 0;
         }
      }
   }
`;

class LittleThing extends Component {
   render() {
      const data = this.props.thing;

      const narrativeLinks = data.partOfNarratives.map((narrative, index) => {
         if (index < data.partOfNarratives.length - 1) {
            return (
               <span key={narrative.title}>
                  <Link
                     href={{
                        pathname: '/narrative',
                        query: {
                           id: narrative.id
                        }
                     }}
                  >
                     <a>{narrative.title}</a>
                  </Link>
                  ,
               </span>
            );
         }
         return (
            <span key={narrative.title}>
               <Link
                  href={{
                     pathname: '/narrative',
                     query: {
                        id: narrative.id
                     }
                  }}
               >
                  <a>{narrative.title}</a>
               </Link>
            </span>
         );
      });
      const narratives = (
         <div className="narratives">
            <h5>PART OF</h5>
            {narrativeLinks}
         </div>
      );

      return (
         <StyledLittleThing
            className={
               this.props.finalistNumber
                  ? `finalist-${this.props.finalistNumber}`
                  : 'littleThing'
            }
         >
            <div className="lede">
               <h3>
                  <Link
                     href={{
                        pathname: '/thing',
                        query: {
                           id: data.id
                        }
                     }}
                  >
                     <a>{data.title}</a>
                  </Link>
               </h3>
               <img
                  src={
                     data.featuredImage
                        ? data.featuredImage
                        : '/static/defaultPic.jpg'
                  }
                  alt="featured image"
               />
               <p className="meta">
                  {convertISOtoAgo(data.createdAt)}
                  {' AGO'}
               </p>
            </div>
            {narratives}
            <div className="VoteBarWrapper">
               <Member>
                  {({ data: memberData }) => (
                     <VoteBar
                        key={data.id}
                        voteData={data.votes}
                        passData={data.passes}
                        finalistDate={data.finalistDate}
                        winner={data.winner}
                        thingID={data.id}
                        member={memberData.me}
                     />
                  )}
               </Member>
            </div>
         </StyledLittleThing>
      );
   }
}

export default LittleThing;
