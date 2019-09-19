import React, { Component } from 'react';
import styled from 'styled-components';
import FullThing from './FullThing';
import TinyThing from './TinyThing';
import { getScoreForThing } from '../lib/utils';

const StyledFilter = styled.div`
   display: flex;
   flex-wrap: wrap;
   @media screen and (min-width: 800px) {
      flex-wrap: nowrap;
   }
   .tinyThingsContainer {
      flex-grow: 1;
      margin-left: 2rem;
      .tinyThing {
         margin: 0 0 2rem 0;
         .thingInfo {
            max-width: calc(100% - 1rem);
         }
         input {
            margin-left: 1rem;
            margin-right: -0.25rem;
         }
      }
   }
`;

class Filter extends Component {
   sortThings = (a, b) => {
      const aScore = getScoreForThing(a);
      const bScore = getScoreForThing(b);
      if (aScore === bScore) {
         const aCreatedAt = new Date(a.createdAt).getTime();
         const bCreatedAt = new Date(b.createdAt).getTime();
         return bCreatedAt - aCreatedAt;
      }
      return bScore - aScore;
   };

   componentDidMount() {
      if (this.props.subscribeToUpdates != null) {
         this.props.subscribeToUpdates();
      }
   }

   render() {
      const { things, member } = this.props;

      let mainThingData;
      const thingsToRemove = [];
      things.forEach((thing, index) => {
         if (thing.id === this.props.mainThingId) mainThingData = thing;
         if (thing.eliminated === true || thing.finalistDate != null)
            thingsToRemove.push(index);
      });
      thingsToRemove.forEach(indexToEliminate => {
         things.splice(indexToEliminate, 1);
      });
      const sortedThings = things.sort(this.sortThings);
      if (mainThingData == null)
         mainThingData = sortedThings[sortedThings.length - 1];
      const mainThing = (
         <FullThing
            thing={mainThingData}
            member={member}
            key={mainThingData.id}
         />
      );

      const tinyThingsData = sortedThings.filter(
         thing => thing.id !== mainThingData.id
      );

      const tinyThings = tinyThingsData.map(tinyThingData => (
         <TinyThing
            thing={tinyThingData}
            key={tinyThingData.id}
            checkbox={this.props.makeMain}
         />
      ));

      return (
         <StyledFilter>
            <div className="mainThingContainer">{mainThing}</div>
            <div className="tinyThingsContainer">{tinyThings}</div>
         </StyledFilter>
      );
   }
}

export default Filter;
