import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import Downshift, { resetIdCounter } from 'downshift';
import debounce from 'lodash.debounce';
import { SINGLE_THING_QUERY } from '../../pages/thing';

const ADD_NARRATIVE_TO_THING_MUTATION = gql`
   mutation ADD_NARRATIVE_TO_THING_MUTATION($title: String!, $thingID: ID!) {
      addNarrativeToThing(title: $title, thingID: $thingID) {
         id
         title
      }
   }
`;

const NARRATIVES_SEARCH_QUERY = gql`
   query NARRATIVES_SEARCH_QUERY($searchTerm: String!) {
      narratives(where: { title_contains: $searchTerm }) {
         title
      }
   }
`;

const StyledNarratives = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   flex-wrap: wrap;
   font-size: ${props => props.theme.smallText};
   margin-bottom: 3rem;
   text-align: center;
   /* border-top: 1px solid hsla(0, 0%, 80%, .1); */
   /* border-bottom: 1px solid hsla(0, 0%, 80%, .1); */
   padding: 1rem 0;
   h5.narratives {
      color: ${props => props.theme.primaryAccent};
      font-size: ${props => props.theme.smallText};
      font-weight: 500;
      display: inline;
      margin: 0 0.5rem 0 0;
   }
   span {
      margin-right: 0.5rem;
      line-height: 1.4;
      a {
         color: ${props => props.theme.highContrastGrey};
      }
   }
   form {
      position: relative;
   }
   input {
      position: relative;
      background: ${props => props.theme.veryLowContrastCoolGrey};
      color: ${props => props.theme.mainText};
      border-radius: 3px;
      border: none;
      border-bottom: 1px solid ${props => props.theme.highContrastGrey};
      box-sizing: border-box;
      font-size: ${props => props.theme.smallText};
      line-height: 1.2;
      font-weight: 500;
      margin: 0 0.6rem 0 0;
      width: 30rem;
      &:disabled {
         background: ${props => props.theme.veryLowContrastGrey};
      }
   }
   .autocompleteSuggestions {
      position: absolute;
      box-sizing: border-box;
      top: 2.5rem;
      left: 0;
      width: calc(100% - 0.5rem);
      padding: 0.25rem;
      text-align: left;
      background: ${props => props.theme.background};
      border: 1px solid ${props => props.theme.lowContrastGrey};
      border-top: none;
      border-radius: 0 0 3px 3px;
   }
   .autocompleteSuggestionItem {
      background: ${props => props.theme.background};
      &.highlighted {
         background: ${props => props.theme.lowContrastCoolGrey};
      }
   }
`;

const ContextBox = props => {
   const [addNarrative, setAddNarrative] = useState('');
   const [narratives, setNarratives] = useState([]);
   const [loading, setLoading] = useState(false);

   const handleChange = function(e, client) {
      setAddNarrative(e.target.value);
      generateAutocomplete(e, client);
   };

   const submitNarrative = async function(addNarrativeToThing) {
      const res = await addNarrativeToThing().catch(err => {
         alert(err.message);
      });
      setAddNarrative('');
   };

   const generateAutocomplete = debounce(async function(e, client) {
      let searchTerm;
      if (e.target.value.includes(',')) {
         const finalCommaLocation = e.target.value.lastIndexOf(',');
         const finalSearchTermRaw = e.target.value.substring(
            finalCommaLocation + 1
         );
         searchTerm = finalSearchTermRaw.trim();
      } else {
         searchTerm = e.target.value;
      }
      const allNarratives = await client.query({
         query: NARRATIVES_SEARCH_QUERY,
         variables: { searchTerm }
      });
      const usedNarratives = props.partOfNarratives.map(
         narrativeObject => narrativeObject.title
      );
      const unusedNarratives = allNarratives.data.narratives.filter(
         narrativeObject => !usedNarratives.includes(narrativeObject.title)
      );
      setNarratives(e.target.value === '' ? [] : unusedNarratives);
   }, 250);

   resetIdCounter();
   let narrativeLinks;
   if (props.partOfNarratives) {
      narrativeLinks = props.partOfNarratives.map((narrative, index) => {
         if (index < props.partOfNarratives.length - 1) {
            return (
               <span key={narrative.id}>
                  <Link
                     href={{
                        pathname: '/context',
                        query: {
                           id: narrative.id
                        }
                     }}
                  >
                     <a key={narrative.title}>{narrative.title}</a>
                  </Link>
                  ,
               </span>
            );
         }
         return (
            <span key={narrative.id}>
               <Link
                  href={{
                     pathname: '/context',
                     query: {
                        id: narrative.id
                     }
                  }}
               >
                  <a key={narrative.title}>{narrative.title}</a>
               </Link>
            </span>
         );
      });
   }
   return (
      <Mutation
         mutation={ADD_NARRATIVE_TO_THING_MUTATION}
         variables={{
            title: addNarrative,
            thingID: props.thingID
         }}
         refetchQueries={[
            {
               query: SINGLE_THING_QUERY,
               variables: { id: props.thingID }
            }
         ]}
      >
         {(addNarrativeToThing, { loading, error, called, data }) => (
            <StyledNarratives>
               <h5 className="narratives">PART OF:</h5> {narrativeLinks}{' '}
               {props.member != null && (
                  <ApolloConsumer>
                     {client => (
                        <Downshift
                           onChange={async item => {
                              setAddNarrative('');
                              setLoading(true);
                              const res = await client
                                 .mutate({
                                    mutation: ADD_NARRATIVE_TO_THING_MUTATION,
                                    variables: {
                                       title: item.title,
                                       thingID: props.thingID
                                    },
                                    refetchQueries: [
                                       {
                                          query: SINGLE_THING_QUERY,
                                          variables: {
                                             id: props.thingID
                                          }
                                       }
                                    ]
                                 })
                                 .catch(err => {
                                    alert(err.message);
                                 });
                              setLoading(false);
                           }}
                           itemToString={item =>
                              item === null ? '' : item.title
                           }
                        >
                           {({
                              getInputProps,
                              getItemProps,
                              isOpen,
                              inputValue,
                              highlightedIndex
                           }) => (
                              <form
                                 onSubmit={async e => {
                                    e.preventDefault();
                                    const res = await addNarrativeToThing().catch(
                                       err => {
                                          alert(err.message);
                                       }
                                    );
                                    setAddNarrative('');
                                 }}
                              >
                                 <input
                                    {...getInputProps({
                                       type: 'text',
                                       id: 'addNarrative',
                                       name: 'addNarrative',
                                       placeholder: loading
                                          ? 'Adding...'
                                          : '+ Add a Narrative',
                                       value: addNarrative,
                                       disabled: loading,
                                       onChange: e => {
                                          e.persist();
                                          handleChange(e, client);
                                       }
                                    })}
                                 />
                                 {narratives.length > 0 && isOpen && (
                                    <div className="autocompleteSuggestions">
                                       {narratives.map((item, index) => (
                                          <div
                                             className={
                                                index === highlightedIndex
                                                   ? 'autoCompleteSuggestionItem highlighted'
                                                   : 'autoCompleteSuggestionItem'
                                             }
                                             {...getItemProps({
                                                item
                                             })}
                                             key={item.title}
                                          >
                                             {item.title}
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </form>
                           )}
                        </Downshift>
                     )}
                  </ApolloConsumer>
               )}
            </StyledNarratives>
         )}
      </Mutation>
   );
};

export default ContextBox;
