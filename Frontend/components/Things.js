import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import DayContainer from "./DayContainer";
import Thing from './Thing';
import LittleThing from './LittleThing';
import TinyThing from './TinyThing';

const THINGS_FOR_GIVEN_DAY_QUERY = gql`
   query THINGS_FOR_GIVEN_DAY_QUERY($day: String!) {
      thingsForGivenDay(day: $day) {
         id
         title
         author {
            displayName
         }
         featuredImage
         originalSource
         summary
         partOfNarratives {
            id
            title
         }
         finalistDate
         createdAt
      }
   }
`;

const ThingContainer = styled.div`
   width: 100%;
   @media screen and (min-width: 800px) {
      width: 96%;
   }
   margin: auto;
   .littleThings {
      margin-top: 4rem;
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      justify-content: space-around;
   }
   p.nextDayStatus {
      text-align: center;
      font-size: ${props => props.theme.smallHead};
      font-weight: 600;
      color: ${props => props.theme.majorColor};
   }
   .lds-container {
      width: 100%;
      text-align: center;
   }
   .lds-ring {
      display: inline-block;
      position: relative;
      margin: auto;
      width: 64px;
      height: 64px;
   }
   .lds-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 51px;
      height: 51px;
      margin: 6px;
      border: 6px solid ${props => props.theme.majorColor};
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: ${props => props.theme.majorColor} transparent transparent
         transparent;
   }
   .lds-ring div:nth-child(1) {
      animation-delay: -0.45s;
   }
   .lds-ring div:nth-child(2) {
      animation-delay: -0.3s;
   }
   .lds-ring div:nth-child(3) {
      animation-delay: -0.15s;
   }
   @keyframes lds-ring {
      0% {
         transform: rotate(0deg);
      }
      100% {
         transform: rotate(360deg);
      }
   }
`;

class Things extends Component {
   state = {
      thingDays: [],
      lastDayQueried: this.props.things[0].finalistDate,
      pullingMore: false
   };

   componentDidMount() {
      window.addEventListener("scroll", this.handleScroll);
   }

   handleScroll = e => {
      const thingContainer = document.getElementById('thingContainer');
      if (thingContainer == null) {
         window.removeEventListener("scroll", this.handleScroll);
         return;
      }
      const thingContainerBottom =
         thingContainer.offsetTop + thingContainer.scrollHeight;
      const windowHeight = window.innerHeight;
      const bottomOfWindow = e.pageY + windowHeight;
      if (
         bottomOfWindow + 500 > thingContainerBottom &&
         !this.state.pullingMore
      ) {
         this.setState({ pullingMore: true });
         this.getNextDaysThings();
      }
   };

   getNextDaysThings = async () => {
      console.log('Pulling more!');
      const { client } = this.props;
      const lastDateQueried = new Date(this.state.lastDayQueried);
      const nextDateToQuery = new Date(
         lastDateQueried.getTime() - 1000 * 60 * 60 * 24
      );
      const thingsForDay = await client.query({
         query: THINGS_FOR_GIVEN_DAY_QUERY,
         variables: { day: nextDateToQuery.toISOString() }
      });
      if (thingsForDay.data.thingsForGivenDay.length === 0) {
         this.setState({
            pullingMore: false,
            noMorePosts: true
         });
         window.removeEventListener("scroll", this.handleScroll);
         return;
      }
      const { thingDays } = this.state;
      thingDays.push(thingsForDay.data.thingsForGivenDay);
      this.setState({
         thingDays,
         lastDayQueried: thingsForDay.data.thingsForGivenDay[0].finalistDate,
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
            {this.state.pullingMore ? (
               <div className="lds-container">
                  <div className="lds-ring">
                     <div />
                     <div />
                     <div />
                     <div />
                  </div>
               </div>
            ) : (
               ""
            )}
            {this.state.noMorePosts ? (
               <p className="nextDayStatus">NO MORE POSTS</p>
            ) : (
               ""
            )}
         </ThingContainer>
      );
   }
}

export default Things;
