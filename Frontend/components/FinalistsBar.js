import styled from 'styled-components';

const StyledFinalistsBar = styled.div`
   width: 100%;
   padding: 0.6rem;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   display: flex;
`;

const FinalistsBar = props => {
   const { things } = props;

   const a = [1, 2, 3, 4, 5];
   const sum = a.reduce((total, number) => total + number, 3);

   const totalScore = things.reduce((score, thing, index) => {
      const thingScore = thing.votes.reduce(
         (points, vote) => points + vote.value,
         0
      );
      things[index].score = thingScore;
      if (thing.eliminated) return score;
      return score + thingScore;
   }, 0);

   if (totalScore <= 0) {
      return <StyledFinalistsBar>No votes yet!</StyledFinalistsBar>;
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

   return <StyledFinalistsBar>{thingBoxes}</StyledFinalistsBar>;
};

export default FinalistsBar;
