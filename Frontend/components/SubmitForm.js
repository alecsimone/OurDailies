import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import styled from 'styled-components';
import Error from './ErrorMessage.js';

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
      font-family: "Proxima Nova", sans-serif;
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

class SubmitForm extends Component {
   state = {
      title: '',
      originalSource: '',
      summary: {
         set: ['']
      }
   };

   handleChange = e => {
      const { name, value } = e.target;
      this.setState({ [name]: value });
   };

   handleSummaryChange = e => {
      this.setState({
         summary: {
            set: [e.target.value]
         }
      });
   };

   render() {
      return (
         <Mutation mutation={CREATE_THING_MUTATION} variables={this.state}>
            {(createThing, { loading, error, called, data }) => (
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
                           value={this.state.title}
                           onChange={this.handleChange}
                        />
                     </label>
                     <label htmlFor="originalSource">
                        <input
                           type="text"
                           id="originalSource"
                           name="originalSource"
                           placeholder="URL"
                           required
                           value={this.state.originalSource}
                           onChange={this.handleChange}
                        />
                     </label>
                     <label htmlFor="summary">
                        <textarea
                           type="textarea"
                           id="summary"
                           name="summary"
                           placeholder="Why should anyone care?"
                           required
                           value={this.state.summary.set[0]}
                           onChange={this.handleSummaryChange}
                        />
                     </label>
                     <button type="submit">Submit</button>
                  </fieldset>
               </StyledSubmitForm>
            )}
         </Mutation>
      );
   }
}

export default SubmitForm;
export { CREATE_THING_MUTATION };
