import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { TOGGLE_MODAL_MUTATION } from '../Modal';
import { NEW_THINGS_QUERY } from '../../pages/new';
import { FILTER_THINGS_QUERY } from '../../pages/filter';

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

const ELIMINATE_THING_MUTATION = gql`
   mutation ELIMINATE_THING_MUTATION($thingID: ID!) {
      eliminateThing(thingID: $thingID) {
         id
      }
   }
`;

const PROMOTE_THING_MUTATION = gql`
   mutation PROMOTE_THING_MUTATION($thingID: ID!) {
      promoteThing(thingID: $thingID) {
         id
      }
   }
`;

const MAKE_THING_WINNER_MUTATION = gql`
   mutation MAKE_THING_WINNER_MUTATION($thingID: ID!) {
      makeThingWinner(thingID: $thingID) {
         id
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
            &[aria-disabled='true'] {
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
            content: '';
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
      display: flex;
      align-items: center;
      justify-content: flex-end;
      button.pass {
         padding: 0.4rem;
         &[aria-disabled='true'] {
            background: ${props => props.theme.lowContrastGrey};
         }
      }
      button.eliminate,
      button.promote,
      button.makeWinner {
         border: none;
         height: 2rem;
         padding: 1px 0 0 0;
         margin-right: 1.6rem;
         opacity: 0.6;
         &[aria-disabled='true'],
         img.loading {
            animation-name: spin;
            animation-duration: 750ms;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            @keyframes spin {
               from {
                  transform: rotate(0deg);
               }
               to {
                  transform: rotate(360deg);
               }
            }
         }
         &:hover {
            opacity: 1;
            background: none;
         }
         img {
            height: 2rem;
         }
      }
      .promoteContainer,
      .makeWinnerContainer {
         flex-grow: 1;
         text-align: left;
         margin: 0 0 0 1rem;
      }
   }
`;

class VoteBar extends Component {
   componentDidMount() {
      if (this.props.subscribeToUpdates != null) {
         this.props.subscribeToUpdates();
      }
   }

   render() {
      let { voteData, passData, member } = this.props;
      if (voteData == null) {
         voteData = [];
      }
      const voters = voteData.map(voteData => (
         <img
            src={
               voteData.voter.avatar != null
                  ? voteData.voter.avatar
                  : '/static/defaultAvatar.jpg'
            }
            alt={`${voteData.voter.displayName}: ${voteData.value}`}
            title={`${voteData.voter.displayName}: ${voteData.value}`}
            key={voteData.voter.displayName}
            className="voterBubble"
         />
      ));

      const passers =
         passData != null
            ? passData.map(passData => (
                 <img
                    src={passData.passer.avatar}
                    alt={`${passData.passer.displayName}: Pass`}
                    title={`${passData.passer.displayName}: Pass`}
                    key={passData.passer.displayName}
                    className="passerBubble"
                 />
              ))
            : '';

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
                  query: NEW_THINGS_QUERY
               }
            ]}
         >
            {(voteOnThing, { loading, error }) => (
               <button
                  onClick={() => {
                     voteOnThing().catch(err => {
                        alert(err.message);
                     });
                  }}
               >
                  <img
                     src="/static/logo-small.png"
                     className={hasVoted ? 'hasVoted' : 'notVoted'}
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
                  query: NEW_THINGS_QUERY
               }
            ]}
         >
            {(passOnThing, { loading, error }) => (
               <button
                  onClick={() => {
                     passOnThing().catch(err => {
                        alert(err.message);
                     });
                  }}
                  aria-disabled={loading}
                  className="pass"
               >
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
            {toggleModal => (
               <button onClick={toggleModal} className="pass">
                  Pass
               </button>
            )}
         </Mutation>
      );

      const eliminateButton = (
         <Mutation
            mutation={ELIMINATE_THING_MUTATION}
            variables={{ thingID: this.props.thingID }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               },
               {
                  query: NEW_THINGS_QUERY
               },
               {
                  query: FILTER_THINGS_QUERY
               }
            ]}
         >
            {(eliminateThing, { loading, error }) => (
               <button
                  className="eliminate"
                  onClick={() => {
                     if (confirm('Eliminate this thing?')) eliminateThing();
                  }}
                  aria-disabled={loading}
               >
                  <img src="/static/red-x.png" />
               </button>
            )}
         </Mutation>
      );

      const promoteButton = (
         <Mutation
            mutation={PROMOTE_THING_MUTATION}
            variables={{ thingID: this.props.thingID }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               },
               {
                  query: NEW_THINGS_QUERY
               },
               {
                  query: FILTER_THINGS_QUERY
               }
            ]}
         >
            {(promoteThing, { loading, error }) => (
               <div className="promoteContainer">
                  <button
                     onClick={() => {
                        if (confirm('Promote this thing?')) promoteThing();
                     }}
                     className="promote"
                  >
                     <img
                        src="/static/green-plus.png"
                        className={loading ? 'loading' : 'promoteimg'}
                     />
                  </button>
               </div>
            )}
         </Mutation>
      );

      const makeWinnerButton = (
         <Mutation
            mutation={MAKE_THING_WINNER_MUTATION}
            variables={{ thingID: this.props.thingID }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               }
            ]}
         >
            {(makeThingWinner, { loading, error }) => (
               <div className="makeWinnerContainer">
                  <button
                     onClick={() => {
                        if (confirm('Make this thing a winner?'))
                           makeThingWinner();
                     }}
                     className="makeWinner"
                  >
                     <img
                        src="/static/star-outline.png"
                        className={loading ? 'loading' : 'makeWinnerimg'}
                     />
                  </button>
               </div>
            )}
         </Mutation>
      );

      const winnerIcon = (
         <div className="makeWinnerContainer">
            <button className="makeWinner">
               <img src="/static/star-full.png" className="makeWinnerimg" />
            </button>
         </div>
      );

      const winnerButton =
         this.props.winner != null ? winnerIcon : makeWinnerButton;

      return (
         <StyledVoteBar className="voteAndPassBars">
            <div className="votebar">
               {this.props.member ? votingButton : nonVotingButton}
               <div className="voters">{voters}</div>
               <div className="passers">{passers}</div>
               <div className="scoreBox">{totalScore}</div>
            </div>
            <div className="passBar">
               {this.props.member &&
                  this.props.member.roles.includes('Admin') &&
                  this.props.finalistDate == null &&
                  promoteButton}
               {this.props.member &&
                  this.props.member.roles.includes('Admin') &&
                  this.props.finalistDate != null &&
                  winnerButton}
               {this.props.member &&
                  this.props.member.roles.includes('Admin') &&
                  eliminateButton}
               {this.props.member ? passingButton : nonPassingButton}
            </div>
         </StyledVoteBar>
      );
   }
}

export default VoteBar;
