import React, { Component } from 'react';
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

class Dailies extends Component {
   state = {
      thingDays: [],
      winnerOffset: 1,
      pullingMore: false
   };

   componentDidMount() {
      window.addEventListener('scroll', this.handleScroll);
   }

   handleScroll = e => {
      const thingContainer = document.getElementById('thingContainer');
      if (thingContainer == null) {
         window.removeEventListener('scroll', this.handleScroll);
         return;
      }
      const thingContainerBottom =
         thingContainer.offsetTop + thingContainer.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPos = e.pageY ? e.pageY : document.documentElement.scrollTop;
      const bottomOfWindow = scrollPos + windowHeight;
      if (
         bottomOfWindow + 500 > thingContainerBottom &&
         !this.state.pullingMore
      ) {
         this.setState({ pullingMore: true });
         this.getNextDaysThings();
      }
   };

   getNextDaysThings = async () => {
      const { client } = this.props;
      const { data } = await client.query({
         query: THINGS_FOR_GIVEN_DAY_QUERY,
         variables: { winnerOffset: this.state.winnerOffset }
      });
      if (data.thingsForGivenDay.length === 0) {
         this.setState({
            pullingMore: false,
            noMorePosts: true
         });
         window.removeEventListener('scroll', this.handleScroll);
         return;
      }
      const { thingDays } = this.state;
      thingDays.push(data.thingsForGivenDay);
      const { thingsForGivenDay } = data;
      const winners = data.thingsForGivenDay.filter(
         thing => thing.winner != null
      );
      this.setState({
         thingDays,
         winnerOffset: this.state.winnerOffset + winners.length,
         pullingMore: false
      });
   };

   render() {
      const dayContainersArray = this.state.thingDays.map(thingDay => (
         <DayContainer things={thingDay} key={thingDay[0].id} />
      ));
      return (
         <ThingContainer id="thingContainer">
            <DayContainer things={this.props.things} />
            {dayContainersArray}
            {this.state.pullingMore ? <LoadingRing /> : ''}
            {this.state.noMorePosts ? (
               <p className="nextDayStatus">NO MORE POSTS</p>
            ) : (
               ''
            )}
         </ThingContainer>
      );
   }
}

export default Dailies;
