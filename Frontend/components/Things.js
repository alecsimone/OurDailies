import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';
import LoadingRing from './LoadingRing';
import { getScoreForThing } from '../lib/utils';

const ThingContainer = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 96%;
      max-width: 96%;
   }
   margin: 0 auto 8rem;
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
   grid-template-rows: max-content;
   grid-auto-rows: max-content;
   grid-gap: 4rem 2rem;
   grid-auto-flow: dense;
   justify-items: stretch;
   .thing {
      grid-column: 1 / -1;
      grid-row: span 10;
   }
   .littleThing {
      grid-row: span 8;
      margin: auto;
      min-height: 40rem;
   }
   .tinyThing {
      grid-row: span 1;
      align-self: stretch;
   }
`;

class Things extends Component {
   render() {
      let windowWidth = 800;
      try {
         windowWidth = window.innerWidth;
      } catch (windowError) {}

      this.props.things.sort((a, b) => {
         if (a.winner && !b.winner) {
            return -1;
         }
         if (!a.winner && b.winner) {
            return 1;
         }
         if (a.finalistDate != null && b.finalistDate == null) {
            return -1;
         }
         if (a.finalistDate == null && b.finalistDate != null) {
            return 1;
         }
         const scoreA = getScoreForThing(a);
         const scoreB = getScoreForThing(b);
         return scoreB - scoreA;
      });

      // const thingsArray = [];
      // this.props.things.forEach((thing, index) => {
      //    if (index !== 0 || windowWidth < 800) {
      //       littleThingsArray.push(
      //          <LittleThing thing={thing} key={thing.id} />
      //       );
      //    }
      // });
      const thingsArray = this.props.things.map(thing => {
         if (!process.browser) {
            return <LoadingRing />;
         }
         if (thing.winner && windowWidth > 800) {
            return <Thing thing={thing} key={thing.id} />;
         }
         if (thing.finalistDate != null) {
            return <LittleThing thing={thing} key={thing.id} />;
         }
         return <TinyThing thing={thing} key={thing.id} />;
      });

      return <ThingContainer id="thingContainer">{thingsArray}</ThingContainer>;
   }
}

export default Things;
