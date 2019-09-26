import React, { Component, useState, useEffect } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import DayContainer from './DayContainer';
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';
import LoadingRing from './LoadingRing';
import { THINGS_FOR_GIVEN_DAY_QUERY } from '../pages/index';
import { littleThingFields } from '../lib/utils';

const ThingContainer = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 96%;
   }
   margin: auto;
   p.nextDayStatus {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => props.theme.majorColor};
   }
`;

const Dailies = props => {
   const [thingDays, setThingDays] = useState([]);
   const [winnerOffset, setWinnerOffset] = useState(1);
   const [pullingMore, setPullingMore] = useState(false);
   const [noMorePosts, setNoMorePosts] = useState(false);

   const handleScroll = e => {
      const thingContainer = document.getElementById('thingContainer');
      if (thingContainer == null) {
         window.removeEventListener('scroll', handleScroll);
         return;
      }
      const thingContainerBottom =
         thingContainer.offsetTop + thingContainer.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPos = e.pageY ? e.pageY : document.documentElement.scrollTop;
      const bottomOfWindow = scrollPos + windowHeight;
      if (bottomOfWindow + 500 > thingContainerBottom && !pullingMore) {
         setPullingMore(true);
         getNextDaysThings();
      }
   };

   useEffect(() => {
      window.addEventListener('scroll', handleScroll);
   }, [handleScroll]);

   const getNextDaysThings = async function() {
      const { client } = props;
      const { data } = await client.query({
         query: THINGS_FOR_GIVEN_DAY_QUERY,
         variables: { winnerOffset }
      });
      if (data.thingsForGivenDay.length === 0) {
         setPullingMore(false);
         setNoMorePosts(true);
         window.removeEventListener('scroll', handleScroll);
         return;
      }
      thingDays.push(data.thingsForGivenDay);
      const { thingsForGivenDay } = data;
      const winners = data.thingsForGivenDay.filter(
         thing => thing.winner != null
      );
      setThingDays(thingDays);
      setWinnerOffset(winnerOffset + winners.length);
      setPullingMore(false);
   };

   const dayContainersArray = thingDays.map(thingDay => (
      <DayContainer things={thingDay} key={thingDay[0].id} />
   ));

   return (
      <ThingContainer id="thingContainer">
         <DayContainer things={props.things} />
         {dayContainersArray}
         {pullingMore ? <LoadingRing /> : ''}
         {noMorePosts ? <p className="nextDayStatus">NO MORE POSTS</p> : ''}
      </ThingContainer>
   );
};

export default Dailies;
