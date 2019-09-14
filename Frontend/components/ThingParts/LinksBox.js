import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import TinyThing from '../TinyThing';
import { homeNoHTTP, prodHomeNoHTTP } from '../../config';

const ADD_LINK_TO_THING_MUTATION = gql`
   mutation ADD_LINK_TO_THING_MUTATION(
      $title: String!
      $url: String!
      $thingID: ID!
   ) {
      addLinkToThing(title: $title, url: $url, thingID: $thingID) {
         id
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
      max-width: calc(800px + 5rem);
      text-align: center;
   }
   .wholeAddLinkForm {
      width: 100%;
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
`;

class LinksBox extends Component {
   state = {
      showForm: false,
      linkTitle: '',
      linkURL: '',
      loading: false
   };

   handleChange = e => {
      const { name, value } = e.target;
      this.setState({ [name]: value });
   };

   render() {
      let things;
      if (this.props.things) {
         const includedThings = this.props.things.map(thing => (
            <TinyThing thing={thing} key={thing.id} />
         ));
         things = (
            <div className="things">
               <h5>RELEVANT THINGS</h5>
               {includedThings}
            </div>
         );
      } else {
         things = (
            <div className="things empty">
               <h5>RELEVANT THINGS</h5>
               <p>No things yet</p>
            </div>
         );
      }

      let links;
      if (this.props.links) {
         const linkItems = this.props.links.map(link => (
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
               title: this.state.linkTitle,
               url: this.state.linkURL,
               thingID: this.props.thingID
            }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               }
            ]}
         >
            {(addLinkToThing, { loading, error, called, data }) => (
               <StyledLinksBox className="linksBox">
                  <div className="thingsAndLinks">
                     {things}
                     {links}
                  </div>
                  <div className="wholeAddLinkForm">
                     <div className="errorMessage">
                        <ErrorMessage error={error} />
                     </div>
                     {this.state.showForm && (
                        <form
                           onSubmit={async e => {
                              e.preventDefault();
                              if (
                                 this.state.linkTitle == '' &&
                                 !this.state.linkURL.includes(
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
                              if (this.state.linkURL == '') {
                                 alert("You didn't give a URL, dummy");
                                 return;
                              }
                              this.setState({ loading: true });
                              const res = await addLinkToThing();
                              this.setState({
                                 linkTitle: '',
                                 linkURL: '',
                                 loading: false
                              });
                           }}
                        >
                           <fieldset
                              disabled={this.state.loading}
                              aria-busy={this.state.loading}
                           >
                              <div className="inputWrapper">
                                 <input
                                    type="text"
                                    id="linkTitle"
                                    name="linkTitle"
                                    placeholder="Title"
                                    value={this.state.linkTitle}
                                    onChange={this.handleChange}
                                 />
                                 <input
                                    type="url"
                                    id="linkURL"
                                    name="linkURL"
                                    placeholder="URL"
                                    value={this.state.linkURL}
                                    onChange={this.handleChange}
                                 />
                              </div>
                           </fieldset>
                           <button type="submit">Submit</button>
                        </form>
                     )}
                     {this.props.member != null && (
                        <button
                           type="button"
                           onClick={() =>
                              this.setState({ showForm: !this.state.showForm })
                           }
                        >
                           {this.state.showForm ? (
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
            )}
         </Mutation>
      );
   }
}

export default LinksBox;
