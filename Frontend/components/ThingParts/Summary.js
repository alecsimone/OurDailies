import React, { useState } from 'react';
import styled from 'styled-components';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { CONTEXT_QUERY } from '../../pages/context';

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

const Summary = props => {
   const [lineToAdd, setLineToAdd] = useState('');
   const [editingIndexes, setEditingIndexes] = useState([]);
   const [summary, setSummary] = useState(props.summary);

   const handleKeyDown = function(e, addSummaryLineToThing) {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         setLineToAdd('');
         addSummaryLineToThing();
      }
   };

   const handleChange = function(e) {
      setLineToAdd(e.target.value);
   };

   const handleEditBoxKeyDown = function(e, index, editSummaryLineOnThing) {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         const previousEditingIndexes = editingIndexes;
         const newEditingIndexes = previousEditingIndexes.filter(
            editingIndex => editingIndex !== index
         );
         setEditingIndexes(newEditingIndexes);
         editSummaryLineOnThing();
      }
   };

   const handleEditBoxChange = function(e, index) {
      const newSummary = summary.slice(0);
      newSummary[index] = e.target.value;
      setSummary(newSummary);
   };

   const summaryItems = props.summary.map((bullet, index) => {
      const editButton = (
         <img
            className="editSummaryLineButton"
            src="/static/edit-this.png"
            alt="edit comment button"
            onClick={() => {
               let newEditingIndexes;
               if (editingIndexes.includes(index)) {
                  newEditingIndexes = editingIndexes.filter(
                     editIndex => editIndex !== index
                  );
               } else {
                  newEditingIndexes = editingIndexes.concat([index]);
               }
               setEditingIndexes(newEditingIndexes);
            }}
         />
      );
      const deleteButton = (
         <Mutation
            mutation={REMOVE_SUMMARY_LINE_FROM_THING_MUTATION}
            variables={{
               summaryLine: bullet,
               thingID: props.thingID,
               isNarrative: props.isNarrative
            }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: props.thingID }
               },
               {
                  query: CONTEXT_QUERY,
                  variables: { id: props.thingID }
               }
            ]}
         >
            {(removeSummaryLineFromThing, { loading, error, called, data }) => (
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
      if (!editingIndexes.includes(index)) {
         return (
            <li key={index}>
               <span>- {bullet}</span>
               {props.member != null &&
                  (props.member.roles.some(role =>
                     ['Admin', 'Editor', 'Moderator'].includes(role)
                  ) ||
                     props.member.id === props.author.id) &&
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
                  newSummaryLine: summary[index],
                  thingID: props.thingID,
                  isNarrative: props.isNarrative
               }}
               refetchQueries={[
                  {
                     query: SINGLE_THING_QUERY,
                     variables: { id: props.thingID }
                  },
                  {
                     query: CONTEXT_QUERY,
                     variables: { id: props.thingID }
                  }
               ]}
            >
               {(editSummaryLineOnThing, { loading, error, called, data }) => (
                  <textarea
                     placeholder="Edit summary line"
                     value={summary[index]}
                     onChange={e => handleEditBoxChange(e, index)}
                     onKeyDown={e =>
                        handleEditBoxKeyDown(e, index, editSummaryLineOnThing)
                     }
                  />
               )}
            </Mutation>
            {props.member != null &&
               (props.member.roles.some(role =>
                  ['Admin', 'Editor', 'Moderator'].includes(role)
               ) ||
                  props.member.id === props.author.id) &&
               buttons}
         </li>
      );
   });

   return (
      <Mutation
         mutation={ADD_SUMMARY_LINE_TO_THING_MUTATION}
         variables={{
            summaryLine: lineToAdd,
            thingID: props.thingID,
            isNarrative: props.isNarrative
         }}
         refetchQueries={[
            {
               query: CONTEXT_QUERY,
               variables: { id: props.thingID }
            }
         ]}
      >
         {(addSummaryLineToThing, { loading, error, called, data }) => (
            <StyledSummary>
               <ul>{summaryItems}</ul>
               <ErrorMessage error={error} />
               {props.member != null &&
                  (props.member.roles.some(role =>
                     ['Admin', 'Editor', 'Moderator'].includes(role)
                  ) ||
                     props.member.id === props.author.id) && (
                     <textarea
                        placeholder={
                           loading ? 'Adding...' : '- Add summary line'
                        }
                        onKeyDown={e => handleKeyDown(e, addSummaryLineToThing)}
                        onChange={handleChange}
                        value={lineToAdd}
                        aria-disabled={loading}
                     />
                  )}
            </StyledSummary>
         )}
      </Mutation>
   );
};

export default Summary;
