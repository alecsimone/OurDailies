import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import Comment from './Comment';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { CONTEXT_QUERY } from '../../pages/context';
import MustSignIn from '../MustSignIn';

const ADD_COMMENT_TO_THING_MUTATION = gql`
   mutation ADD_COMMENT_TO_THING_MUTATION(
      $comment: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      addCommentToThing(
         comment: $comment
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         id
         comment
      }
   }
`;

const StyledComments = styled.section`
   border-top: 1px solid ${props => props.theme.veryLowContrastGrey};
   margin: 2rem auto;
   padding: 2rem 0;
   @media screen and (min-width: 800px) {
      padding: 2rem;
   }
   text-align: center;
   p.noComments {
      margin-top: 2rem;
   }
   textarea {
      width: 100%;
      max-width: 800px;
      margin-top: 2rem;
      font-size: ${props => props.theme.smallText};
      line-height: 1.6;
      height: calc(${props => props.theme.smallText} * 1.6 + 2rem);
      transition: height 0.25s;
      &[aria-disabled='true'] {
         background: ${props => props.theme.lowContrastCoolGrey};
      }
      &:focus {
         height: calc(1.6rem * 1.6 * 3 + 2rem);
         transition: height 0.25s;
      }
   }
   p.logInPrompt {
      margin: 0;
   }
`;

const Comments = props => {
   const [commentToAdd, setCommentToAdd] = useState('');

   const handleKeyDown = function(e, addCommentToThing) {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         setCommentToAdd('');
         addCommentToThing().catch(err => {
            alert(err.message);
         });
      }
   };

   const handleChange = function(e) {
      setCommentToAdd(e.target.value);
   };

   const commentItems =
      props.comments != null
         ? props.comments.map(comment => (
              <Comment
                 data={comment}
                 thingID={props.thingID}
                 member={props.member}
                 key={comment.id}
              />
           ))
         : '';

   return (
      <StyledComments className="Comments">
         <h5 className="comments">COMMENTS</h5>
         {commentItems.length ? (
            commentItems
         ) : (
            <p className="noComments">No Comments Yet</p>
         )}
         <MustSignIn prompt=" ">
            <Mutation
               mutation={ADD_COMMENT_TO_THING_MUTATION}
               variables={{
                  comment: commentToAdd,
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
               {(addCommentToThing, { loading, error, called, data }) => (
                  <textarea
                     placeholder={loading ? 'Adding...' : 'Add Comment'}
                     aria-disabled={loading}
                     onKeyDown={e => handleKeyDown(e, addCommentToThing)}
                     onChange={handleChange}
                     value={commentToAdd}
                  />
               )}
            </Mutation>
         </MustSignIn>
      </StyledComments>
   );
};

export default Comments;
