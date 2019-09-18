import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import VoteBar from './ThingParts/VoteBar';
import Member from './Member';
import { convertISOtoAgo } from '../lib/utils';

const GET_VOTES = gql`
   query GET_VOTES($id: ID!) {
      votesConnection(where: { onThing: { id: $id } }) {
         edges {
            node {
               voter {
                  id
                  displayName
                  avatar
                  roles
               }
               value
            }
         }
      }
   }
`;

const StyledThing = styled.article`
   display: flex;
   flex-direction: column;
    position: relative;
    padding: 0 1rem;
    grid-column: 1 / -1;
    background: ${props => props.theme.veryLowContrastCoolGrey};
    padding: 2rem;
    box-shadow: 0 0 .4rem ${props => props.theme.secondaryAccentGlow};
    div.body {
        position: relative;
        flex-grow: 1;
        :before {
            content: '';
            background: ${props => props.theme.majorColor};
            z-index: -1;
            width: 5rem;
            height: 100%;
            position: absolute;
            right: 0;
            top: 0;
            opacity: .8;
            border-radius; 2px;
        }
        .imageWrapper {
            width: 100%;
            max-width: 77%;
            height: calc(100% - 2rem);
            position: absolute;
            right: 2rem;
            top: 1rem;
            z-index: -1;
            img.featuredImage {
                object-fit: cover;
                width: 100%;
                height: 100%;
            }
            /* :after {
                content: ' ';
                z-index: 0;
                display: block;
                position: absolute;
                top: -20;
                bottom: 0;
                left: 0;
                right: 0;
                width: 1280px;
                height: 720px;
                background: hsla(0, 0%, 0%, .4);
            } */
        }
        .TopInfo {
            padding: 6rem 3rem;
            max-width: 60%;
            z-index: 1;
            h3 {
                font-size: ${props => props.theme.bigHead};
                text-shadow: ${props => props.theme.background};
                margin: 0;
                background: ${props => props.theme.lowContrastCoolGrey};
                border-radius: 4px;
                padding: 0 1rem;
                display: inline;
            }
            p.meta {
               font-size: ${props => props.theme.smallText};
                color: ${props => props.theme.lowContrastGrey};
                font-style: italic;
            }
        }
        .BottomInfo {
            width: 20%;
            position: absolute;
            left: 3rem;
            bottom: 6rem;
            overflow-wrap: anywhere;
            h5 {
                color: ${props => props.theme.primaryAccent};
                font-size: ${props => props.theme.bigText};
                font-weight: 400;
                margin: 0 0 1rem;
            }
            span {
                /* margin-right: .5rem; */
            }
            a {
                color: ${props => props.theme.highContrastGrey};
                font-size: ${props => props.theme.smallText};
                font-weight: 300;
            }
        }
    }
    .VoteBarWrapper {
        width: 100%;
    }
`;

class Thing extends Component {
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
                  ,{' '}
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
         <div>
            <h5>PART OF</h5>
            {narrativeLinks}
         </div>
      );

      return (
         <StyledThing className="thing">
            <div className="body">
               <div className="TopInfo">
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
                  <p className="meta">
                     {convertISOtoAgo(data.createdAt)}
                     {' AGO'}
                  </p>
               </div>
               <div className="BottomInfo">{narratives}</div>
               <div className="imageWrapper">
                  <img
                     className="featuredImage"
                     src={
                        data.featuredImage
                           ? data.featuredImage
                           : '/static/defaultPic.jpg'
                     }
                     alt="featured image"
                  />
               </div>
            </div>
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
         </StyledThing>
      );
   }
}

export default Thing;
export { GET_VOTES };
