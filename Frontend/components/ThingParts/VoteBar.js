import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { TOGGLE_MODAL_MUTATION } from '../Modal';
import { NEW_THINGS_QUERY } from '../../pages/new';

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

const PASS_ON_THING_MUTATION = gql`
   mutation PASS_ON_THING_MUTATION($thingID: ID!) {
      passOnThing(thingID: $thingID) {
         passer {
            id
            displayName
            avatar
            roles
         }
      }
   }
`;

const StyledVoteBar = styled.div`
   .votebar {
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
      .passers,
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
      }
      .passers {
         img {
            opacity: 0.4;
            filter: grayscale(50%);
         }
      }
      .voters,
      .passers {
         height: 100%;
         text-align: left;
         padding: 0 1rem;
         position: relative;
         display: flex;
         align-items: center;
         img {
            margin: 1px 0.5rem 0;
            height: 4rem;
            width: 4rem;
            object-fit: cover;
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
   }
   .passBar {
      width: 100%;
      padding: 0 1rem;
      margin: 1rem 0 0;
      text-align: right;
      button {
         padding: 0.4rem;
         &[aria-disabled="true"] {
            background: ${props => props.theme.lowContrastGrey};
         }
      }
   }
`;

class VoteBar extends Component {
   render() {
      let { voteData, passData, member } = this.props;
      if (voteData == null) {
         voteData = [];
      }
      const voters = voteData.map(voteData => (
         <img
            src={voteData.voter.avatar}
            alt={`${voteData.voter.displayName}: ${voteData.value}`}
            title={`${voteData.voter.displayName}: ${voteData.value}`}
            key={voteData.voter.displayName}
            className="voterBubble"
         />
      ));

      const passers = passData.map(passData => (
         <img
            src={passData.passer.avatar}
            alt={`${passData.passer.displayName}: Pass`}
            title={`${passData.passer.displayName}: Pass`}
            key={passData.passer.displayName}
            className="passerBubble"
         />
      ));

      const totalScore = voteData.reduce(
         (score, voteObject) => score + voteObject.value,
         0
      );

      let hasVoted = false;
      if (member != null) {
         voteData.forEach(voteObject => {
            if (voteObject.voter.id === member.id) {
               hasVoted = true;
            }
         });
      }

      const votingButton = (
         <Mutation
            mutation={VOTE_ON_THING_MUTATION}
            variables={{ thingID: this.props.thingID }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               },
               {
                  query: NEW_THINGS_QUERY
               }
            ]}
            optimisticResponse={
               this.props.member != null
                  ? {
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
                    }
                  : { fuck: "you" }
            }
            update={(proxy, { data: { voteOnThing } }) => {
               const data = proxy.readQuery({
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               });
               let hasVoted = false;
               let newVotes;
               data.thing.votes.forEach(vote => {
                  if (vote.voter.id === this.props.member.id) {
                     hasVoted = true;
                  }
               });
               if (hasVoted) {
                  newVotes = data.thing.votes.filter(
                     vote => vote.voter.id !== this.props.member.id
                  );
               } else {
                  const newVoteArray = [voteOnThing];
                  newVotes = data.thing.votes.concat(newVoteArray);
               }
               data.thing.votes = newVotes;
               proxy.writeQuery({
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID },
                  data
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
      );

      const nonVotingButton = (
         <Mutation
            mutation={TOGGLE_MODAL_MUTATION}
            variables={{ modalContent: 'Login' }}
         >
            {toggleModal => (
               <button onClick={toggleModal}>
                  <img src="/static/logo-small.png" className="notVoted" />
               </button>
            )}
         </Mutation>
      );

      const passingButton = (
         <Mutation
            mutation={PASS_ON_THING_MUTATION}
            variables={{ thingID: this.props.thingID }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               },
               {
                  query: NEW_THINGS_QUERY
               }
            ]}
            optimisticResponse={
               this.props.member != null
                  ? {
                       __typename: "Mutation",
                       passOnThing: {
                          __typename: "Pass",
                          passer: {
                             __typename: 'Member',
                             id: this.props.member.id,
                             displayName: this.props.member.displayName,
                             avatar: this.props.member.avatar,
                             roles: this.props.member.roles
                          }
                       }
                    }
                  : { fuck: "you" }
            }
            update={(proxy, { data: { passOnThing } }) => {
               const data = proxy.readQuery({
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               });
               let hasPassed = false;
               let newPasses;
               data.thing.passes.forEach(pass => {
                  if (pass.passer.id === this.props.member.id) {
                     hasPassed = true;
                  }
               });
               if (hasPassed) {
                  newPasses = data.thing.passes.filter(
                     pass => pass.passer.id !== this.props.member.id
                  );
               } else {
                  const newPassArray = [passOnThing];
                  newPasses = data.thing.passes.concat(newPassArray);
               }
               data.thing.passes = newPasses;
               proxy.writeQuery({
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID },
                  data
               });
            }}
         >
            {(passOnThing, { loading, error }) => (
               <button onClick={passOnThing} aria-disabled={loading}>
                  Pass
               </button>
            )}
         </Mutation>
      );

      const nonPassingButton = (
         <Mutation
            mutation={TOGGLE_MODAL_MUTATION}
            variables={{ modalContent: 'Login' }}
         >
            {toggleModal => <button onClick={toggleModal}>Pass</button>}
         </Mutation>
      );

      return (
         <StyledVoteBar>
            <div className="votebar">
               {this.props.member ? votingButton : nonVotingButton}
               <div className="voters">{voters}</div>
               <div className="passers">{passers}</div>
               <div className="scoreBox">{totalScore}</div>
            </div>
            <div className="passBar">
               {this.props.member ? passingButton : nonPassingButton}
            </div>
         </StyledVoteBar>
      );
   }
}

export default VoteBar;
