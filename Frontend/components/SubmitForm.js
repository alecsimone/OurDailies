import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';
import Error from './ErrorMessage.js';
import Member from './Member';

const CREATE_THING_MUTATION = gql`
   mutation CREATE_THING_MUTATION(
      $title: String!
      $originalSource: String!
      $summary: ThingCreatesummaryInput!
   ) {
      createThing(
         title: $title
         summary: $summary
         originalSource: $originalSource
      ) {
         id
      }
   }
`;

const StyledSubmitForm = styled.form`
   max-width: 800px;
   margin: auto;
   text-align: center;
   h2 {
      margin: 1rem auto;
   }
   fieldset {
      border: none;
   }
   input,
   textarea {
      font-size: ${props => props.theme.smallText};
      width: 100%;
      margin: 1rem 0;
      padding: 0.75rem;
      border-radius: 3px;
      border: 1px solid ${props => props.theme.lowContrastGrey};
   }
   textarea {
      font-family: 'Proxima Nova', sans-serif;
   }
   button {
      background: ${props => props.theme.majorColor};
      border: none;
      border-radius: 2px;
      font-size: ${props => props.theme.smallText};
      margin-top: 1rem;
      padding: 0.75rem 2.25rem;
      color: ${props => props.theme.mainText};
      cursor: pointer;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
   }
`;

const SubmitForm = props => {
   const [title, setTitle] = useState('');
   const [originalSource, setOriginalSource] = useState('');
   const [summary, setSummary] = useState({ set: [''] });

   const handleChange = function(e) {
      const { name, value } = e.target;
      if (name === 'title') {
         setTitle(value);
      }
      if (name === 'originalSource') {
         setOriginalSource(value);
      }
   };

   const handleSummaryChange = function(e) {
      setSummary({ set: [e.target.value] });
   };

   return (
      <Mutation
         mutation={CREATE_THING_MUTATION}
         variables={{ title, originalSource, summary }}
      >
         {(createThing, { loading, error, called, data }) => (
            <Member>
               {({ data: memberData }) => (
                  <StyledSubmitForm
                     onSubmit={async e => {
                        e.preventDefault();
                        const res = await createThing();
                        Router.push({
                           pathname: '/thing',
                           query: {
                              id: res.data.createThing.id
                           }
                        });
                        if (props.callBack) {
                           props.callBack();
                        }
                     }}
                  >
                     <h2>Share a Thing</h2>
                     <Error error={error} />
                     <fieldset disabled={loading} aria-busy={loading}>
                        <label htmlFor="title">
                           <input
                              type="text"
                              id="title"
                              name="title"
                              placeholder="Title"
                              required
                              value={title}
                              onChange={handleChange}
                           />
                        </label>
                        <label htmlFor="originalSource">
                           <input
                              type="text"
                              id="originalSource"
                              name="originalSource"
                              placeholder="URL"
                              required
                              value={originalSource}
                              onChange={handleChange}
                           />
                        </label>
                        <label htmlFor="summary">
                           <textarea
                              type="textarea"
                              id="summary"
                              name="summary"
                              placeholder="Why should anyone care?"
                              required={memberData.me.rep < 10}
                              value={summary.set[0]}
                              onChange={handleSummaryChange}
                           />
                        </label>
                        <button type="submit">Submit</button>
                     </fieldset>
                  </StyledSubmitForm>
               )}
            </Member>
         )}
      </Mutation>
   );
};

export default SubmitForm;
export { CREATE_THING_MUTATION };
