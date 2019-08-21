import React, { Component } from "react";
import styled from "styled-components";
import Link from "next/link";
import { Mutation } from 'react-apollo';
import gql from "graphql-tag";
import { SINGLE_THING_QUERY } from '../../pages/thing';

const ADD_NARRATIVE_TO_THING_MUTATION = gql`
   mutation ADD_NARRATIVE_TO_THING_MUTATION($title: String!, $thingID: ID!) {
      addNarrativeToThing(title: $title, thingID: $thingID) {
         id
         title
      }
   }
`;

const StyledNarratives = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   flex-wrap: wrap;
   font-size: 2.25rem;
   margin-bottom: 3rem;
   text-align: center;
   /* border-top: 1px solid hsla(0, 0%, 80%, .1); */
   /* border-bottom: 1px solid hsla(0, 0%, 80%, .1); */
   padding: 1rem 0;
   h5.narratives {
      color: ${props => props.theme.green};
      font-size: 2.25rem;
      font-weight: 500;
      display: inline;
      line-height: 2;
      margin: 0 0.5rem 0 0;
   }
   span {
      margin-right: 0.5rem;
      a {
         color: ${props => props.theme.highContrastGrey};
      }
   }
   input {
      background: ${props => props.theme.veryLowContrastCoolGrey};
      color: ${props => props.theme.mainText};
      border-radius: 3px;
      border: none;
      border-bottom: 1px solid ${props => props.theme.highContrastGrey};
      font-size: 2rem;
      font-weight: 500;
      margin: 0 0.5rem 0 0;
      &:disabled {
         background: ${props => props.theme.veryLowContrastGrey};
      }
   }
`;

class NarrativesBox extends Component {
   state = {
      addNarrative: ""
   };

   handleChange = e => {
      this.setState({ addNarrative: e.target.value });
   };

   render() {
      let narrativeLinks;
      if (this.props.partOfNarratives) {
         narrativeLinks = this.props.partOfNarratives.map(
            (narrative, index) => {
               if (index < this.props.partOfNarratives.length - 1) {
                  return (
                     <span key={narrative.id}>
                        <Link
                           href={{
                              pathname: "/narrative",
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
                           pathname: "/narrative",
                           query: {
                              id: narrative.id
                           }
                        }}
                     >
                        <a key={narrative.title}>{narrative.title}</a>
                     </Link>
                  </span>
               );
            }
         );
      }
      return (
         <Mutation
            mutation={ADD_NARRATIVE_TO_THING_MUTATION}
            variables={{
               title: this.state.addNarrative,
               thingID: this.props.thingID
            }}
            refetchQueries={[
               {
                  query: SINGLE_THING_QUERY,
                  variables: { id: this.props.thingID }
               }
            ]}
         >
            {(addNarrativeToThing, { loading, error, called, data }) => (
               <StyledNarratives>
                  <h5 className="narratives">PART OF:</h5> {narrativeLinks}{" "}
                  <form
                     onSubmit={async e => {
                        e.preventDefault();
                        const res = await addNarrativeToThing();
                        this.setState({ addNarrative: "" });
                     }}
                  >
                     <input
                        type="text"
                        id="addNarrative"
                        name="addNarrative"
                        placeholder={
                           loading ? 'Adding...' : '+ Add a Narrative'
                        }
                        value={this.state.addNarrative}
                        onChange={this.handleChange}
                        disabled={loading}
                     />
                  </form>
               </StyledNarratives>
            )}
         </Mutation>
      );
   }
}

export default NarrativesBox;
