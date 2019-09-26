import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TinyThing from './TinyThing';

const StyledThingPicker = styled.div`
   .filterButtons {
      display: flex;
      align-items: center;
      justify-content: space-around;
      margin: 0 0 2rem 0;
      text-transform: uppercase;
      button {
         font-size: ${props => props.theme.smallText};
         line-height: 1;
         font-weight: 700;
         padding: 0.5rem;
         display: flex;
         align-items: center;
         &.inactive:hover {
            background: ${props => props.theme.lowContrastCoolGrey};
         }
         &.active {
            background: ${props => props.theme.lowContrastCoolGrey};
            &:hover {
               background: none;
            }
         }
         img {
            height: ${props => props.theme.smallText};
            width: ${props => props.theme.smallText};
            min-width: ${props => props.theme.smallText};
         }
      }
   }
   .tinyThing {
      margin: 0 0 2rem 0;
      .thingInfo {
         max-width: calc(100% - 1rem);
         flex-grow: 1;
      }
      input {
         margin-left: 1rem;
         margin-right: -0.25rem;
      }
   }
`;

const ThingPicker = props => {
   const [activeFilters, setActiveFilters] = useState([]);

   useEffect(() => {
      if (props.defaultFilters != null) {
         setActiveFilters(props.defaultFilters);
      }
   }, [props.defaultFilters]);

   const toggleFilter = function(filterName) {
      if (activeFilters.includes(filterName)) {
         const newFilters = activeFilters.filter(
            filter => filter !== filterName
         );
         setActiveFilters(newFilters);
      } else {
         const newFilters = activeFilters.concat([filterName]);
         setActiveFilters(newFilters);
      }
   };

   const { things } = props;

   let filteredThings = things;
   if (activeFilters.includes('voteless')) {
      filteredThings = things.filter(thing => thing.votes.length > 0);
   }
   if (activeFilters.includes('eliminated')) {
      filteredThings = filteredThings.filter(thing => !thing.eliminated);
   }

   const tinyThings = filteredThings.map(thing => (
      <TinyThing thing={thing} key={thing.id} checkbox={props.picker} />
   ));

   return (
      <StyledThingPicker className="thingPicker">
         <div className="filterButtons">
            Filter Out:
            <button
               className={
                  activeFilters.includes('voteless') ? 'active' : 'inactive'
               }
               onClick={() => toggleFilter('voteless')}
            >
               Voteless
            </button>
            <button
               className={
                  activeFilters.includes('eliminated') ? 'active' : 'inactive'
               }
               onClick={() => toggleFilter('eliminated')}
            >
               Eliminated
            </button>
         </div>
         {tinyThings}
      </StyledThingPicker>
   );
};

export default ThingPicker;
