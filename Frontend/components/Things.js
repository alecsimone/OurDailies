import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import LoadingRing from './LoadingRing';

const ThingContainer = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 96%;
      max-width: 96%;
   }
   margin: 0 auto 8rem;
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
   grid-template-rows: 8rem;
   grid-auto-rows: 8rem;
   grid-gap: 3rem;
   justify-items: stretch;
   align-items: stretch;
   .thing {
      grid-column: 1 / -1;
      grid-row: span 6;
      @media screen and (min-width: 1921px) {
         grid-row: span 8;
      }
   }
   .littleThing {
      grid-row: span 6;
   }
   .tinyThing {
      grid-row: span 1;
   }
`;

class Things extends Component {
   render() {
      return (
         <ThingContainer id="thingContainer">
            {this.props.things}
         </ThingContainer>
      );
   }
}

export default Things;
