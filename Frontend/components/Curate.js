import React, { Component } from 'react';
import styled from 'styled-components';
import FullThing from './FullThing';
import TinyThing from './TinyThing';
import { getScoreForThing } from '../lib/utils';

const StyledCurate = styled.div`
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
      }
   }
`;

class Curate extends Component {
   sortedThings = this.props.things.sort((a, b) => {
      const aScore = getScoreForThing(a);
      const bScore = getScoreForThing(b);
      if (aScore === bScore) {
         const aCreatedAt = new Date(a.createdAt).getTime();
         const bCreatedAt = new Date(b.createdAt).getTime();
         return bCreatedAt - aCreatedAt;
      }
      return bScore - aScore;
   });

   // state = {
   //    mainThingId: this.sortedThings[0].id
   // };

   // makeMain = id => {
   //    console.log(`We makin the thing with id ${id} main, baby!`);
   //    let newMain;
   //    this.props.things.forEach(thing => {
   //       if (thing.id === id) newMain = thing.id;
   //    });
   //    this.setState({ mainThingId: newMain });
   // };

   render() {
      const { things, member } = this.props;

      let mainThingData;
      things.forEach(thing => {
         if (thing.id === this.props.mainThingId) mainThingData = thing;
      });
      if (mainThingData == null) mainThingData = this.sortedThings[0];
      const mainThing = (
         <FullThing
            thing={mainThingData}
            member={member}
            key={mainThingData.id}
         />
      );

      const tinyThingsData = this.sortedThings.filter(
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
         <StyledCurate>
            <div className="mainThingContainer">{mainThing}</div>
            <div className="tinyThingsContainer">{tinyThings}</div>
         </StyledCurate>
      );
   }
}

export default Curate;
