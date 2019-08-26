import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from 'styled-components';
import Things from '../components/Things';
import NarrativesBar from '../components/NarrativesBar';
import Logout from '../components/Logout';
import Member from '../components/Member';

const ALL_THINGS_QUERY = gql`
   query ALL_THINGS_QUERY {
      things(orderBy: createdAt_DESC, first: 5) {
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
         createdAt
      }
   }
`;

const DateBar = styled.div`
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
`;

const Home = props => {
   const todaysDate = new Date();
   const month = todaysDate.getMonth();
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
   const day = todaysDate.getDate();
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
   const year = todaysDate.getFullYear();
   return (
      <div>
         <NarrativesBar />
         <DateBar>
            <h2>
               {monthString} {dayString}, {year}
            </h2>
         </DateBar>
         <Query query={ALL_THINGS_QUERY}>
            {({ data, error, loading }) => {
               if (loading) return <p>Loading...</p>;
               if (error) return <p>Error: {error.message}</p>;
               return <Things things={data.things} />;
            }}
         </Query>
         <Member>{({ data: { me } }) => me && <Logout />}</Member>
      </div>
   );
};

export { ALL_THINGS_QUERY };
export default Home;
