import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Link from 'next/link';
import { getScoreForThing } from '../lib/utils';

const ALL_NARRATIVES_QUERY = gql`
   query ALL_NARRATIVES_QUERY {
      narratives(last: 10) {
         id
         title
      }
   }
`;

const FRESHEST_NARRATIVES_QUERY = gql`
   query FRESHEST_NARRATIVES_QUERY {
      narratives(first: 200, orderBy: updatedAt_DESC) {
         id
         title
         updatedAt
         connectedThings {
            title
            createdAt
            votes {
               value
            }
         }
      }
   }
`;

const StyledNarrativesBar = styled.div`
   width: 90%;
   margin: 2rem auto 3rem;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-wrap: wrap;
   line-height: 1.6;
   @media screen and (min-width: 800px) {
      width: 96%;
   }
   h5 {
      color: ${props => props.theme.primaryAccent};
      display: inline;
      font-size: ${props => props.theme.bigText};
      margin: 0 0.5rem 0 0;
      font-weight: 500;
   }
   span {
      margin: 0 0.5rem 0 0;
   }
   a {
      font-size: ${props => props.theme.bigText};
      color: ${props => props.theme.highContrastGrey};
      &:hover {
         color: ${props => props.theme.mainText};
      }
      &:visited {
         color: ${props => props.theme.highContrastGrey};
      }
   }
`;

class NarrativesBar extends Component {
   numberToDisplay = 15;

   pickTheNarratives = data => {
      const { narratives } = data;
      // Go through each narrative and give it a score property
      narratives.forEach((narrativeObject, index) => {
         const score = narrativeObject.connectedThings.reduce(
            (narrativeScore, thingObject) => {
               const createdDaysAgo = Math.floor(
                  (new Date() - new Date(thingObject.createdAt)) /
                     (1000 * 60 * 60 * 24)
               );
               if (createdDaysAgo > 7) {
                  return narrativeScore;
               }
               const thisThingScore = getScoreForThing(thingObject);
               return narrativeScore + thisThingScore;
            },
            0
         );
         narratives[index].score = score;
      });
      const sortedNarratives = narratives.sort((a, b) => b.score - a.score);
      const topNarratives = sortedNarratives.slice(0, this.numberToDisplay);
      return topNarratives;
   };

   render() {
      return (
         <Query query={FRESHEST_NARRATIVES_QUERY}>
            {({ data, error, loading }) => {
               if (loading) return <p>Loading...</p>;
               if (error) return <p>Error: {error.message}</p>;
               const topNarrativesArray = this.pickTheNarratives(data);
               return (
                  <StyledNarrativesBar>
                     <h5>BIG THIS WEEK: </h5>
                     {topNarrativesArray.map((narrative, index) => {
                        if (index < topNarrativesArray.length - 1) {
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
                     })}
                  </StyledNarrativesBar>
               );
            }}
         </Query>
      );
   }
}

export default NarrativesBar;
