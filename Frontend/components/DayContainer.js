import styled from 'styled-components';
import Thing from "./Thing";
import LittleThing from "./LittleThing";

const StyledDayContainer = styled.div`
   .dateBar {
      position: relative;
      text-align: center;
      width: 96%;
      margin: auto;
      h2 {
         color: ${props => props.theme.majorColor};
         font-size: ${props => props.theme.smallHead};
         font-weight: 300;
         text-align: center;
         margin: 4rem 0;
         padding: 0 3rem;
         display: inline-block;
         background: ${props => props.theme.background};
      }
      :before {
         content: " ";
         background: hsla(0, 0%, 13%, 1);
         height: 3px;
         width: 100%;
         position: absolute;
         top: 50%;
         left: 0;
         z-index: -1;
      }
   }
`;

const DayContainer = props => {
   const date = new Date(props.things[0].finalistDate);
   const month = date.getMonth();
   const monthsArray = [
      'JANUARY',
      'FEBRUARY',
      'MARCH',
      'APRIL',
      'MAY',
      'JUNE',
      'JULY',
      'AUGUST',
      'SEPTEMBER',
      'OCTOBER',
      'NOVEMBER',
      'DECEMBER'
   ];
   const monthString = monthsArray[month];
   const day = date.getUTCDate();
   let dayString;
   if (day == '1' || day == '01' || day == '21' || day == '31') {
      dayString = `${day}ST`;
   } else if (day == '2' || day == '02' || day == '22') {
      dayString = `${day}ND`;
   } else if (day == '3' || day == '03' || day == '23') {
      dayString = `${day}RD`;
   } else {
      dayString = `${day}TH`;
   }
   const year = date.getFullYear();

   const littleThingsArray = [];
   props.things.forEach((thing, index) => {
      if (index !== 0) {
         littleThingsArray.push(<LittleThing thing={thing} key={thing.id} />);
      }
   });

   return (
      <StyledDayContainer>
         <div className="dateBar">
            <h2>
               {monthString} {dayString}, {year}
            </h2>
         </div>
         <Thing thing={props.things[0]} key={props.things[0].id} />
         <div className="littleThings">{littleThingsArray}</div>
      </StyledDayContainer>
   );
};

export default DayContainer;
