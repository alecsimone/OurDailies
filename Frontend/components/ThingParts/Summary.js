import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';

const ADD_SUMMARY_LINE_TO_THING_MUTATION = gql`
   mutation ADD_SUMMARY_LINE_TO_THING_MUTATION(
      $summaryLine: String!
      $thingID: ID!
   ) {
      addSummaryLineToThing(summaryLine: $summaryLine, thingID: $thingID) {
         id
         summary
      }
   }
`;

const REMOVE_SUMMARY_LINE_FROM_THING_MUTATION = gql`
   mutation REMOVE_SUMMARY_LINE_FROM_THING_MUTATION(
      $summaryLine: String!
      $thingID: ID!
   ) {
      removeSummaryLineFromThing(summaryLine: $summaryLine, thingID: $thingID) {
         id
         summary
      }
   }
`;

const StyledSummary = styled.div`
   ul {
      margin: 3rem 0 0;
      padding: 0;
      li {
         font-size: 2rem;
         line-height: 1.4;
         list-style-type: " - ";
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin: 2rem 0;
         span {
            max-width: calc(100% - 2rem);
         }
         img {
            width: 2rem;
            height: 2rem;
            cursor: pointer;
            opacity: 0.4;
            &:hover {
               opacity: 1;
            }
            &.loading {
               opacity: 1;
               animation-name: spin;
               animation-duration: 750ms;
               animation-iteration-count: infinite;
               animation-timing-function: linear;
            }
         }
      }
   }
   textarea {
      width: 100%;
      font-size: 2rem;
      line-height: 1.5;
      height: 4rem;
      background: none;
      margin: 0 0 3rem 0;
      padding: 0.5rem 1rem calc(0.5rem - 1px) 1rem;
      &[aria-disabled="true"] {
         background: ${props => props.theme.lowContrastCoolGrey};
      }
      &:focus {
         padding: calc(0.5rem - 1px) calc(1rem - 1px);
      }
   }
   @keyframes spin {
      from {
         transform: rotate(0deg);
      }
      to {
         transform: rotate(360deg);
      }
   }
`;

class Summary extends Component {
   state = {
      lineToAdd: ''
   };

   handleKeyDown = (e, addSummaryLineToThing) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         this.setState({ lineToAdd: "" });
         addSummaryLineToThing();
      }
   };

   handleChange = e => {
      this.setState({ lineToAdd: e.target.value });
   };

   render() {
      const summaryItems = this.props.summary.map((bullet, index) => (
         <li key={index}>
            <span>- {bullet}</span>
            <Mutation
               mutation={REMOVE_SUMMARY_LINE_FROM_THING_MUTATION}
               variables={{
                  summaryLine: bullet,
                  thingID: this.props.thingID
               }}
               refetchQueries={[
                  {
                     query: SINGLE_THING_QUERY,
                     variables: { id: this.props.thingID }
                  }
               ]}
            >
               {(
                  removeSummaryLineFromThing,
                  { loading, error, called, data }
               ) => (
                  <img
                     src="/static/red-x.png"
                     className={loading ? "loading" : ""}
                     onClick={() => {
                        removeSummaryLineFromThing();
                     }}
                  />
               )}
            </Mutation>
         </li>
      ));

      return (
         <Mutation
            mutation={ADD_SUMMARY_LINE_TO_THING_MUTATION}
            variables={{
               summaryLine: this.state.lineToAdd,
               thingID: this.props.thingID
            }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               }
            ]}
         >
            {(addSummaryLineToThing, { loading, error, called, data }) => (
               <StyledSummary>
                  <ul>{summaryItems}</ul>
                  <ErrorMessage error={error} />
                  <textarea
                     placeholder={loading ? 'Adding...' : '- Add summary line'}
                     onKeyDown={e =>
                        this.handleKeyDown(e, addSummaryLineToThing)
                     }
                     onChange={this.handleChange}
                     value={this.state.lineToAdd}
                     aria-disabled={loading}
                  />
               </StyledSummary>
            )}
         </Mutation>
      );
   }
}

export default Summary;
