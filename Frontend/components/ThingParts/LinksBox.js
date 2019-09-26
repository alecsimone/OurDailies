import React, { useState } from 'react';
import styled from 'styled-components';
import { Mutation, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import Downshift, { resetIdCounter } from 'downshift';
import debounce from 'lodash.debounce';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { CONTEXT_QUERY } from '../../pages/context';
import TinyThing from '../TinyThing';
import { homeNoHTTP, prodHomeNoHTTP } from '../../config';
import { tinyThingFields } from '../../lib/utils';
import { home, prodHome } from '../../config';

const ADD_LINK_TO_THING_MUTATION = gql`
   mutation ADD_LINK_TO_THING_MUTATION(
      $title: String!
      $url: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      addLinkToThing(
         title: $title
         url: $url
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const THINGS_SEARCH_QUERY = gql`
   query THINGS_SEARCH_QUERY($searchTerm: String!) {
      things(where: {title_contains: $searchTerm }, first: 20) {
         ${tinyThingFields}
      }
   }
`;

const StyledLinksBox = styled.div`
   .thingsAndLinks {
      display: flex;
      flex-wrap: wrap;
      margin: 3rem 0;
   }
   .things {
      flex-grow: 3;
      article {
         margin-bottom: 1rem;
      }
   }
   .links {
      flex-grow: 1;
      min-width: 20rem;
      text-align: left;
      ul {
         margin: 0;
         padding: 0;
         list-style-type: none;
         li {
            margin-bottom: 0.5rem;
         }
      }
   }
   .empty {
      font-size: ${props => props.theme.smallText};
      text-align: center;
      p {
         color: ${props => props.theme.lowContrastGrey};
      }
   }
   a.includedLink {
      text-decoration: underline;
      color: ${props => props.theme.majorColor};
      font-size: ${props => props.theme.smallText};
   }
   form {
      flex-grow: 1;
      max-width: 100%;
      text-align: center;
   }
   .wholeAddLinkForm {
      width: 100%;
      position: relative;
      margin-top: 2rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      fieldset {
         .inputWrapper {
            display: flex;
            flex-wrap: wrap;
         }
      }
      input {
         font-size: ${props => props.theme.smallText};
         margin: 1rem;
         flex-grow: 1;
         max-width: 400px;
      }
      button {
         position: relative;
         height: 2.5rem;
         width: 2.5rem;
         line-height: 2.5rem;
         border: none;
         font-weight: 700;
         font-size: ${props => props.theme.bigText};
         opacity: 0.4;
         &:hover {
            background: none;
            opacity: 1;
         }
         & img {
            width: 2.5rem;
            height: 2.5rem;
            position: absolute;
            left: 0px;
            top: 0px;
            cursor: pointer;
         }
         &[type='submit'] {
            display: none;
         }
      }
      .errorMessage {
         width: 100%;
      }
   }
   .autoCompleteSuggestionItem.highlighted {
      background: hsla(0, 0%, 100%, 0.1);
   }
`;

const LinksBox = props => {
   const [showForm, setShowForm] = useState(false);
   const [linkTitle, setLinkTitle] = useState('');
   const [linkURL, setLinkURL] = useState('');
   const [loading, setLoading] = useState(false);
   const [things, setThings] = useState([]);

   const handleTitleChange = function(e, client) {
      const { name, value } = e.target;
      setLinkTitle(value);
      generateAutocomplete(e, client);
   };

   const handleURLChange = function(e) {
      const { name, value } = e.target;
      setLinkURL(value);
   };

   const handleChange = function(e) {
      const { name, value } = e.target;
      if (name === 'linkTitle') {
         setLinkTitle(value);
      }
      if (name === 'linkURL') {
         setLinkURL(value);
      }
   };

   const generateAutocomplete = debounce(async (e, client) => {
      const allThings = await client.query({
         query: THINGS_SEARCH_QUERY,
         variables: { searchTerm: e.target.value }
      });
      const connectedThings = props.things.map(thingObject => thingObject.id);
      const unConnectedThings = allThings.data.things.filter(
         thingObject => !connectedThings.includes(thingObject.id)
      );
      unConnectedThings.splice(6);
      setThings(e.target.value === '' ? [] : unConnectedThings);
   }, 250);

   let thingsElement;
   if (props.things && props.things.length > 0) {
      const includedThings = props.things.map(thing => (
         <TinyThing thing={thing} key={thing.id} />
      ));
      thingsElement = (
         <div className="things">
            <h5>RELEVANT THINGS</h5>
            {includedThings}
         </div>
      );
   } else {
      thingsElement = (
         <div className="things empty">
            <h5>RELEVANT THINGS</h5>
            <p>No things yet</p>
         </div>
      );
   }

   let links;
   if (props.links) {
      const linkItems = props.links.map(link => (
         <li key={link.id}>
            <a
               className="includedLink"
               href={link.url}
               key={link.url}
               target="_blank"
            >
               {link.title}
            </a>
         </li>
      ));
      links = (
         <div className="links">
            <h5>LINKS</h5>
            <ul>{linkItems}</ul>
         </div>
      );
   } else {
      links = (
         <div className="links empty">
            <h5>LINKS</h5>
            <p>No links yet</p>
         </div>
      );
   }

   return (
      <Mutation
         mutation={ADD_LINK_TO_THING_MUTATION}
         variables={{
            title: linkTitle,
            url: linkURL,
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
         {(addLinkToThing, { loading, error, called, data }) => {
            const ThingsAndLinksForm = (
               <ApolloConsumer>
                  {client => (
                     <Downshift
                        onChange={async item => {
                           setLoading(true);
                           setLinkTitle('');
                           setLinkURL('');
                           const res = await client
                              .mutate({
                                 mutation: ADD_LINK_TO_THING_MUTATION,
                                 variables: {
                                    title: item.title,
                                    url: `${
                                       process.env.NODE_ENV === 'development'
                                          ? home
                                          : prodHome
                                    }/thing?id=${item.id}`,
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
                        itemToString={item => (item === null ? '' : item.title)}
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
                                 if (
                                    linkTitle == '' &&
                                    linkURL.includes(
                                       `${
                                          process.env.NODE_ENV === 'development'
                                             ? homeNoHTTP
                                             : prodHomeNoHTTP
                                       }/thing?id=`
                                    )
                                 ) {
                                    alert(
                                       'You need to give that link a  title'
                                    );
                                    return;
                                 }
                                 if (linkURL == '') {
                                    alert("You didn't give a URL, dummy");
                                    return;
                                 }
                                 setLoading(true);
                                 const res = await addLinkToThing();
                                 setLinkTitle('');
                                 setLinkURL('');
                                 setLoading(false);
                              }}
                           >
                              <fieldset disabled={loading} aria-busy={loading}>
                                 <div className="inputWrapper">
                                    <input
                                       {...getInputProps({
                                          type: 'text',
                                          id: 'linkTitle',
                                          name: 'linkTitle',
                                          placeholder: loading
                                             ? 'Adding...'
                                             : 'Title',
                                          value: linkTitle,
                                          disabled: loading,
                                          onChange: e => {
                                             e.persist();
                                             handleTitleChange(e, client);
                                          }
                                       })}
                                    />
                                    <input
                                       type="url"
                                       id="linkURL"
                                       name="linkURL"
                                       placeholder="URL"
                                       value={linkURL}
                                       onChange={handleURLChange}
                                    />
                                    {things.length > 0 && isOpen && (
                                       // that true is supposed to be isOpen
                                       <div className="autocompleteSuggestions">
                                          {things.map((item, index) => (
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
                                                <TinyThing
                                                   thing={item}
                                                   key={item.id}
                                                />
                                             </div>
                                          ))}
                                       </div>
                                    )}
                                 </div>
                              </fieldset>
                              <button type="submit">Submit</button>
                           </form>
                        )}
                     </Downshift>
                  )}
               </ApolloConsumer>
            );

            const LinksOnlyForm = (
               <form
                  onSubmit={async e => {
                     e.preventDefault();
                     if (
                        linkTitle == '' &&
                        !linkURL.includes(
                           `${
                              process.env.NODE_ENV === 'development'
                                 ? homeNoHTTP
                                 : prodHomeNoHTTP
                           }/thing?id=`
                        )
                     ) {
                        alert('You need to give that link a  title');
                        return;
                     }
                     if (linkURL == '') {
                        alert("You didn't give a URL, dummy");
                        return;
                     }
                     setLoading(true);
                     const res = await addLinkToThing();
                     setLinkTitle('');
                     setLinkURL('');
                     setLoading(false);
                  }}
               >
                  <fieldset disabled={loading} aria-busy={loading}>
                     <div className="inputWrapper">
                        <input
                           type="text"
                           id="linkTitle"
                           name="linkTitle"
                           placeholder="Title"
                           value={linkTitle}
                           onChange={handleChange}
                        />
                        <input
                           type="url"
                           id="linkURL"
                           name="linkURL"
                           placeholder="URL"
                           value={linkURL}
                           onChange={handleChange}
                        />
                     </div>
                  </fieldset>
                  <button type="submit">Submit</button>
               </form>
            );

            const form = props.things ? ThingsAndLinksForm : LinksOnlyForm;

            return (
               <StyledLinksBox className="linksBox">
                  <div className="thingsAndLinks">
                     {props.things && thingsElement}
                     {links}
                  </div>
                  <div className="wholeAddLinkForm">
                     <div className="errorMessage">
                        <ErrorMessage error={error} />
                     </div>
                     {showForm && form}
                     {props.member != null && (
                        <button
                           type="button"
                           onClick={() => setShowForm(!showForm)}
                        >
                           {showForm ? (
                              <img
                                 className="x"
                                 src="/static/red-x.png"
                                 alt="button to hide add link form"
                              />
                           ) : (
                              <img
                                 className="plus"
                                 src="/static/green-plus.png"
                                 alt="button to open add link form"
                              />
                           )}
                        </button>
                     )}
                  </div>
               </StyledLinksBox>
            );
         }}
      </Mutation>
   );
};

export default LinksBox;
