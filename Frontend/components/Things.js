import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';

const ThingContainer = styled.div`
   width: 96%;
   margin: auto;
   /* display: grid;
   grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
   grid-auto-rows: auto;
   grid-gap: 6rem;
   justify-content: space-around;
   align-items: stretch; */
   .littleThings {
      margin-top: 4rem;
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: space-around;
   }
`;

class Things extends Component {
   render() {
      // const firstThing =
      // firstThing == null ? this.props.things.shift() : firstThing;

      const littleThingsArray = [];
      this.props.things.forEach((thing, index) => {
         if (index !== 0) {
            littleThingsArray.push(
               <LittleThing thing={thing} key={thing.id} />
            );
         }
      });
      return (
         <ThingContainer>
            <Thing thing={this.props.things[0]} key={this.props.things[0].id} />
            <div className="littleThings">{littleThingsArray}</div>
         </ThingContainer>
      );
   }
}

export default Things;
