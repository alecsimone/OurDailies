import React, { Component } from 'react';
import styled from 'styled-components';
import LittleThing from "./LittleThing";

const StyledFInalists = styled.div`
   .littleThings {
      margin-top: 4rem;
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: flex-start;
   }
`;

class Finalists extends Component {
   render() {
      const littleThingsArray = this.props.things.map(thing => (
         <LittleThing thing={thing} key={thing.id} />
      ));

      return (
         <StyledFInalists>
            {" "}
            <div className="littleThings">{littleThingsArray}</div>
         </StyledFInalists>
      );
   }
}

export default Finalists;
