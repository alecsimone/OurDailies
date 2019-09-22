import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { FILTER_THINGS_QUERY } from '../../pages/filter';
import { NARRATIVE_THINGS_QUERY } from '../../pages/narrative';

const ADD_SUMMARY_LINE_TO_THING_MUTATION = gql`
   mutation ADD_SUMMARY_LINE_TO_THING_MUTATION(
      $summaryLine: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      addSummaryLineToThing(
         summaryLine: $summaryLine
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const REMOVE_SUMMARY_LINE_FROM_THING_MUTATION = gql`
   mutation REMOVE_SUMMARY_LINE_FROM_THING_MUTATION(
      $summaryLine: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      removeSummaryLineFromThing(
         summaryLine: $summaryLine
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const EDIT_SUMMARY_LINE_ON_THING_MUTATION = gql`
   mutation EDIT_SUMMARY_LINE_ON_THING_MUTATION(
      $editedIndex: Int!
      $newSummaryLine: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      editSummaryLineOnThing(
         editedIndex: $editedIndex
         newSummaryLine: $newSummaryLine
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const StyledSummary = styled.div`
   ul {
      margin: 0;
      padding: 0;
      li {
         font-size: ${props => props.theme.smallText};
         line-height: 1.4;
         list-style-type: ' - ';
         display: flex;
         align-items: stretch;
         justify-content: space-between;
         margin: 2rem 0;
         @media screen and (min-width: 800px) {
            span {
               max-width: calc(100% - 3rem);
               flex-grow: 1;
            }
         }
         .buttons {
            display: flex;
            flex-wrap: nowrap;
            img {
               display: none;
               @media screen and (min-width: 800px) {
                  display: block;
               }
               width: 2rem;
               min-width: 2rem;
               height: 2rem;
               margin-left: 1rem;
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
   }
   textarea {
      width: 100%;
      font-size: ${props => props.theme.smallText};
      line-height: 1.5;
      height: 7rem;
      background: none;
      margin: 0 0 3rem 0;
      padding: 0.5rem 1rem calc(0.5rem - 1px) 1rem;
      &[aria-disabled='true'] {
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
      lineToAdd: '',
      editingIndexes: [],
      summary: this.props.summary
   };

   handleKeyDown = (e, addSummaryLineToThing) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         this.setState({ lineToAdd: '' });
         addSummaryLineToThing();
      }
   };

   handleChange = e => {
      this.setState({ lineToAdd: e.target.value });
   };

   handleEditBoxKeyDown = (e, index, editSummaryLineOnThing) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         const previousEditingIndexes = this.state.editingIndexes;
         const newEditingIndexes = previousEditingIndexes.filter(
            editingIndex => editingIndex !== index
         );
         this.setState({ editingIndexes: newEditingIndexes });
         editSummaryLineOnThing();
      }
   };

   handleEditBoxChange = (e, index) => {
      const { summary } = this.state;
      summary[index] = e.target.value;
      this.setState({ summary });
   };

   render() {
      const summaryItems = this.props.summary.map((bullet, index) => {
         const editButton = (
            <img
               className="editSummaryLineButton"
               src="/static/edit-this.png"
               alt="edit comment button"
               onClick={() => {
                  let { editingIndexes } = this.state;
                  if (editingIndexes.includes(index)) {
                     editingIndexes = editingIndexes.filter(
                        editIndex => editIndex !== index
                     );
                  } else {
                     editingIndexes.push(index);
                  }
                  this.setState({ editingIndexes });
               }}
            />
         );
         const deleteButton = (
            <Mutation
               mutation={REMOVE_SUMMARY_LINE_FROM_THING_MUTATION}
               variables={{
                  summaryLine: bullet,
                  thingID: this.props.thingID,
                  isNarrative: this.props.isNarrative
               }}
               refetchQueries={[
                  {
                     query: SINGLE_THING_QUERY,
                     variables: { id: this.props.thingID }
                  },
                  {
                     query: FILTER_THINGS_QUERY
                  },
                  {
                     query: NARRATIVE_THINGS_QUERY,
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
                     alt="delete summary line button"
                     className={loading ? 'loading' : ''}
                     onClick={() => {
                        removeSummaryLineFromThing().catch(err => {
                           alert(err.message);
                        });
                     }}
                  />
               )}
            </Mutation>
         );
         const buttons = (
            <div className="buttons">
               {editButton}
               {deleteButton}
            </div>
         );
         if (!this.state.editingIndexes.includes(index)) {
            return (
               <li key={index}>
                  <span>- {bullet}</span>
                  {this.props.member != null &&
                     (this.props.member.roles.some(role =>
                        ['Admin', 'Editor', 'Moderator'].includes(role)
                     ) ||
                        this.props.member.id === this.props.author.id) &&
                     buttons}
               </li>
            );
         }
         return (
            <li key={index}>
               <Mutation
                  mutation={EDIT_SUMMARY_LINE_ON_THING_MUTATION}
                  variables={{
                     editedIndex: index,
                     newSummaryLine: this.state.summary[index],
                     thingID: this.props.thingID,
                     isNarrative: this.props.isNarrative
                  }}
                  refetchQueries={[
                     {
                        query: SINGLE_THING_QUERY,
                        variables: { id: this.props.thingID }
                     },
                     {
                        query: FILTER_THINGS_QUERY
                     },
                     {
                        query: NARRATIVE_THINGS_QUERY,
                        variables: { id: this.props.thingID }
                     }
                  ]}
               >
                  {(
                     editSummaryLineOnThing,
                     { loading, error, called, data }
                  ) => (
                     <textarea
                        placeholder="Edit summary line"
                        value={this.state.summary[index]}
                        onChange={e => this.handleEditBoxChange(e, index)}
                        onKeyDown={e =>
                           this.handleEditBoxKeyDown(
                              e,
                              index,
                              editSummaryLineOnThing
                           )
                        }
                     />
                  )}
               </Mutation>
               {this.props.member != null &&
                  (this.props.member.roles.some(role =>
                     ['Admin', 'Editor', 'Moderator'].includes(role)
                  ) ||
                     this.props.member.id === this.props.author.id) &&
                  buttons}
            </li>
         );
      });

      return (
         <Mutation
            mutation={ADD_SUMMARY_LINE_TO_THING_MUTATION}
            variables={{
               summaryLine: this.state.lineToAdd,
               thingID: this.props.thingID,
               isNarrative: this.props.isNarrative
            }}
            refetchQueries={[
               {
                  query: NARRATIVE_THINGS_QUERY,
                  variables: { id: this.props.thingID }
               },
               {
                  query: FILTER_THINGS_QUERY
               }
            ]}
         >
            {(addSummaryLineToThing, { loading, error, called, data }) => (
               <StyledSummary>
                  <ul>{summaryItems}</ul>
                  <ErrorMessage error={error} />
                  {this.props.member != null &&
                     (this.props.member.roles.some(role =>
                        ['Admin', 'Editor', 'Moderator'].includes(role)
                     ) ||
                        this.props.member.id === this.props.author.id) && (
                        <textarea
                           placeholder={
                              loading ? 'Adding...' : '- Add summary line'
                           }
                           onKeyDown={e =>
                              this.handleKeyDown(e, addSummaryLineToThing)
                           }
                           onChange={this.handleChange}
                           value={this.state.lineToAdd}
                           aria-disabled={loading}
                        />
                     )}
               </StyledSummary>
            )}
         </Mutation>
      );
   }
}

export default Summary;
