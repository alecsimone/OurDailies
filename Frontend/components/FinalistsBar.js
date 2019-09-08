import styled from 'styled-components';
import { getScoreForThing } from '../lib/utils';

const StyledFinalistsBar = styled.div`
   width: 100%;
   padding: 0.6rem;
   margin: 3rem 0;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   display: flex;
   font-weight: 700;
   font-size: ${props => props.theme.bigText};
   line-height: 1.75;
   text-align: center;
   justify-content: center;
`;

const FinalistsBar = props => {
   const { things } = props;

   const a = [1, 2, 3, 4, 5];
   const sum = a.reduce((total, number) => total + number, 3);

   const totalScore = things.reduce((score, thing, index) => {
      const thingScore = getScoreForThing(thing);
      things[index].score = thingScore;
      if (thing.eliminated) return score;
      return score + thingScore;
   }, 0);

   if (totalScore <= 0) {
      return (
         <StyledFinalistsBar id="finalistsbar">
            No votes yet!
         </StyledFinalistsBar>
      );
   }

   const thingBoxes = things.map((thing, index) => {
      const widthPercentage = (thing.score / totalScore) * 100;
      const style = {
         width: `${widthPercentage}%`
      };
      return (
         <div
            className={thing.eliminated ? 'barChunk eliminated' : 'barChunk'}
            key={index}
            style={style}
         >
            {index + 1}
            <span className="score">{thing.score}</span>
         </div>
      );
   });

   return (
      <StyledFinalistsBar id="finalistsbar">{thingBoxes}</StyledFinalistsBar>
   );
};

export default FinalistsBar;
