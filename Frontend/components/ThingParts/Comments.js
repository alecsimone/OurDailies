import React, { Component } from "react";
import styled from "styled-components";
import Link from "next/link";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../ErrorMessage";
import Comment from "./Comment";
import { SINGLE_THING_QUERY } from "../../pages/thing";
import MustSignIn from "../MustSignIn";

const ADD_COMMENT_TO_THING_MUTATION = gql`
   mutation ADD_COMMENT_TO_THING_MUTATION($comment: String!, $thingID: ID!) {
      addCommentToThing(comment: $comment, thingID: $thingID) {
         id
         comment
      }
   }
`;

const StyledComments = styled.section`
   border-top: 1px solid ${props => props.theme.veryLowContrastGrey};
   margin: auto;
   padding: 2rem;
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
      &[aria-disabled="true"] {
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

class Comments extends Component {
   state = {
      commentToAdd: ''
   };

   handleKeyDown = (e, addCommentToThing) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         this.setState({ commentToAdd: "" });
         addCommentToThing().catch(err => {
            alert(err.message);
         });
      }
   };

   handleChange = e => {
      this.setState({ commentToAdd: e.target.value });
   };

   render() {
      const commentItems = this.props.comments.map(comment => (
         <Comment
            data={comment.node}
            thingID={this.props.thingID}
            member={this.props.member}
            key={comment.node.id}
         />
      ));

      return (
         <StyledComments>
            <h5 className="comments">COMMENTS</h5>
            {commentItems.length ? (
               commentItems
            ) : (
               <p className="noComments">No Comments Yet</p>
            )}
            <MustSignIn prompt=" " redirect={false}>
               <Mutation
                  mutation={ADD_COMMENT_TO_THING_MUTATION}
                  variables={{
                     comment: this.state.commentToAdd,
                     thingID: this.props.thingID
                  }}
                  refetchQueries={[
                     {
                        query: SINGLE_THING_QUERY,
                        variables: { id: this.props.thingID }
                     }
                  ]}
               >
                  {(addCommentToThing, { loading, error, called, data }) => (
                     <textarea
                        placeholder={loading ? 'Adding...' : 'Add Comment'}
                        aria-disabled={loading}
                        onKeyDown={e =>
                           this.handleKeyDown(e, addCommentToThing)
                        }
                        onChange={this.handleChange}
                        value={this.state.commentToAdd}
                     />
                  )}
               </Mutation>
            </MustSignIn>
         </StyledComments>
      );
   }
}

export default Comments;
