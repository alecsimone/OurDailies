import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { GET_VOTES } from '../Thing';

const VOTE_ON_THING_MUTATION = gql`
   mutation VOTE_ON_THING_MUTATION($thingID: ID!) {
      voteOnThing(thingID: $thingID) {
         voter {
            id
            displayName
            avatar
            roles
         }
         value
      }
   }
`;

const StyledVoteBar = styled.div`
   background: ${props => props.theme.veryLowContrastCoolGrey};
   position: relative;
   display: flex;
   align-items: center;
   align-content: stretch;
   width: 100%;
   height: 6rem;
   border-radius: 5px;
   padding: 1rem;
   margin: 3rem 0 0;
   text-align: center;
   font-size: ${props => props.theme.smallText};
   line-height: 5rem;
   color: ${props => props.theme.mainText};
   button {
      border: none;
      height: 100%;
      position: relative;
      padding: 0 1rem 0 0;
      img {
         height: 100%;
         width: auto;
         &.hasVoted {
            filter: grayscale(0%);
            opacity: 1;
            transition: filter 0.25s;
            &:hover {
               opacity: 0.6;
               filter: grayscale(90%);
               transition: filter 0.4s ease-out;
            }
         }
         &.notVoted {
            filter: grayscale(100%);
            opacity: 0.6;
            transition: filter 0.25s;
            &:hover {
               opacity: 1;
               filter: grayscale(10%);
               transition: filter 0.4s ease-out;
            }
         }
         &[aria-disabled="true"] {
            animation-name: pulse;
            animation-duration: 750ms;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
         }
         @keyframes pulse {
            from {
               transform: rotateY(0deg);
            }
            to {
               transform: rotateY(360deg);
            }
         }
      }
      &:hover {
         background: none;
      }
   }
   .voters,
   button {
      :before {
         content: "";
         background: ${props => props.theme.veryLowContrastGrey};
         height: 100%;
         width: 4px;
         border-radius: 1px;
         position: absolute;
         right: -4px;
         top: 0;
      }
   }
   .voters {
      flex-grow: 1;
      height: 100%;
      text-align: left;
      padding: 0 1.5rem;
      position: relative;
      display: flex;
      align-items: center;
      img {
         padding-top: 0.5rem;
         height: 100%;
         width: auto;
         border-radius: 100%;
      }
   }
   .scoreBox {
      font-size: ${props => props.theme.bigText};
      font-weight: 600;
      color: ${props => props.theme.secondaryAccent};
      position: relative;
      padding: 0 0 0 1rem;
      line-height: 100%;
   }
`;

class VoteBar extends Component {
   render() {
      let { voteData, member } = this.props;
      if (voteData == null) {
         voteData = [];
      }
      const voters = voteData.map(voteData => (
         <img
            src={voteData.node.voter.avatar}
            alt={`${voteData.node.voter.displayName}: ${voteData.node.value}`}
            title={`${voteData.node.voter.displayName}: ${voteData.node.value}`}
            key={voteData.node.voter.displayName}
         />
      ));

      const totalScore = voteData.reduce(
         (score, voteObject) => score + voteObject.node.value,
         0
      );

      let hasVoted = false;
      voteData.forEach(voteObject => {
         if (member == null) return;
         if (voteObject.node.voter.id === member.id) {
            hasVoted = true;
         }
      });

      return (
         <StyledVoteBar>
            <Mutation
               mutation={VOTE_ON_THING_MUTATION}
               variables={{ thingID: this.props.thingID }}
               refetchQueries={[
                  {
                     query: GET_VOTES,
                     variables: { id: this.props.thingID }
                  }
               ]}
               optimisticResponse={{
                  __typename: "Mutation",
                  voteOnThing: {
                     __typename: "Vote",
                     voter: {
                        __typename: 'Member',
                        id: this.props.member.id,
                        displayName: this.props.member.displayName,
                        avatar: this.props.member.avatar,
                        roles: this.props.member.roles
                     },
                     value: this.props.member.rep
                  }
               }}
               update={(proxy, { data: { voteOnThing } }) => {
                  const data = proxy.readQuery({
                     query: GET_VOTES,
                     variables: { id: this.props.thingID }
                  });
                  console.log(data);
                  let hasVoted = false;
                  let newVotes;
                  data.votesConnection.edges.forEach(edge => {
                     if (edge.node.voter.id === this.props.member.id) {
                        hasVoted = true;
                     }
                  });
                  if (hasVoted) {
                     newVotes = data.votesConnection.edges.filter(
                        edge => edge.node.voter.id !== this.props.member.id
                     );
                  } else {
                     const newVoteArray = [
                        {
                           __typename: 'VoteEdge',
                           node: voteOnThing
                        }
                     ];
                     newVotes = data.votesConnection.edges.concat(newVoteArray);
                  }
                  const newData = {
                     votesConnection: {
                        __typename: "VoteConnection",
                        edges: newVotes
                     }
                  };
                  console.log(newData);
                  proxy.writeQuery({
                     query: GET_VOTES,
                     variables: { id: this.props.thingID },
                     data: newData
                  });
               }}
            >
               {(voteOnThing, { loading, error }) => (
                  <button onClick={voteOnThing}>
                     <img
                        src="/static/logo-small.png"
                        className={hasVoted ? "hasVoted" : "notVoted"}
                        aria-disabled={loading}
                     />
                  </button>
               )}
            </Mutation>
            <div className="voters">{voters}</div>
            <div className="scoreBox">{totalScore}</div>
         </StyledVoteBar>
      );
   }
}

export default VoteBar;
