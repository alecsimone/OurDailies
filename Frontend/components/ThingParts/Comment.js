import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from '../ErrorMessage';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { CONTEXT_QUERY } from '../../pages/context';
import { convertISOtoAgo, urlFinder } from '../../lib/utils';

const DELETE_COMMENT_MUTATION = gql`
   mutation DELETE_COMMENT_MUTATION($id: ID!) {
      deleteComment(id: $id) {
         id
      }
   }
`;

const EDIT_COMMENT_MUTATION = gql`
   mutation EDIT_COMMENT_MUTATION($id: ID!, $newComment: String!) {
      editComment(id: $id, newComment: $newComment) {
         id
         comment
      }
   }
`;

const StyledComment = styled.div`
   /* max-width: 800px; */
   margin: 0.75rem 0;
   font-size: ${props => props.theme.smallText};
   font-weight: 400;
   line-height: 1.25;
   background: ${props => props.theme.veryLowContrastCoolGrey};
   padding: 1rem;
   border-radius: 3px;
   text-align: left;
   .commentContent {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      .commentLeft {
         display: flex;
         align-items: flex-start;
         flex-grow: 1;
         img.avatar {
            width: 3rem;
            min-width: 3rem;
            height: 3rem;
            margin-top: 0.6rem;
            border-radius: 100%;
            margin-right: 1.25rem;
         }
         .commentAndAuthorContainer {
            span.commenter {
               color: ${props => props.theme.majorColor};
               margin-right: 0.5rem;
               font-weight: 700;
            }
            display: inline-block;
            margin: 0 2rem 0 0;
            flex-grow: 1;
            /* max-width: 800px; */
            p.commentParagraph {
               margin: 0 0 1.5rem 0;
               /* display: inline-block; */
               &:last-of-type {
                  margin: 0 0 0.5rem 0;
               }
               a,
               a:visited {
                  color: ${props => props.theme.highContrastSecondaryAccent};
                  text-decoration: underline;
                  /* margin: 0 0.5rem; */
               }
            }
            textarea {
               width: 100%;
               max-width: none;
               margin-top: 0;
               padding: 1px 1px 0 1px;
               line-height: 1.25;
               height: calc(4rem * 1.25 + 2rem);
               &:focus {
                  padding: 0;
               }
            }
         }
      }
      .buttons {
         display: none;
         @media screen and (min-width: 800px) {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-items: space-between;
         }
         /* align-self: flex-start; */
         align-items: center;
         justify-content: space-between;
         margin-top: 0.6rem;
      }
      img.deleteCommentButton {
         width: 2rem;
         min-width: 2rem;
         height: 2rem;
         opacity: 0.25;
         cursor: pointer;
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
      img.editCommentButton {
         width: 2rem;
         min-width: 2rem;
         height: 2rem;
         opacity: 0.25;
         margin-top: 1rem;
         /* margin-bottom: -1.6rem; */
         cursor: pointer;
         &:hover {
            opacity: 1;
         }
         &.loading {
            opacity: 1;
            filter: saturate(0);
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
   }
   .commentMeta {
      font-size: ${props => props.theme.tinyText};
      margin-top: 0.5rem;
      color: ${props => props.theme.highContrastGrey};
      opacity: 0.6;
   }
`;

class Comment extends Component {
   state = {
      editing: false,
      comment: this.props.data.comment
   };

   handleKeyDown = (e, editComment) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         this.setState({ editing: false });
         editComment().catch(err => {
            alert(err.message);
         });
      }
   };

   handleChange = e => {
      this.setState({ comment: e.target.value });
   };

   render() {
      const { data } = this.props;
      const paragraphsAndEmptyStrings = this.state.comment.split('\n');
      const paragraphs = paragraphsAndEmptyStrings.filter(
         string => string != ''
      );

      paragraphs.forEach((graph, index) => {
         graph.replace(urlFinder, (match, offset, string) => {
            const beginning = string.substring(0, offset);
            const end = string.substring(beginning.length + match.length);
            const jsxGraph = (
               <>
                  {beginning}
                  <a target="_blank" href={match}>
                     {match.length > 20
                        ? `${match.substring(0, 60)}...`
                        : match}
                  </a>
                  {end}
               </>
            );
            paragraphs[index] = jsxGraph;
         });
      });

      const paragraphElements = paragraphs.map((commentString, index) => (
         <p className="commentParagraph" key={index}>
            {index === 0 ? (
               <span className="commenter">
                  [{data.author.rep}] {data.author.displayName}
               </span>
            ) : (
               ''
            )}
            {commentString}
         </p>
      ));

      const createdAtISO = data.createdAt;
      const timeAgoString = convertISOtoAgo(createdAtISO);

      return (
         <StyledComment>
            <div className="commentContent">
               <div className="commentLeft">
                  <img
                     className="avatar"
                     src={
                        data.author.avatar != null
                           ? data.author.avatar
                           : '/static/defaultAvatar.jpg'
                     }
                     alt={`${data.author.displayName} avatar`}
                  />
                  <div className="commentAndAuthorContainer">
                     {!this.state.editing ? (
                        paragraphElements
                     ) : (
                        <Mutation
                           mutation={EDIT_COMMENT_MUTATION}
                           variables={{
                              id: data.id,
                              newComment: this.state.comment
                           }}
                           refetchQueries={[
                              {
                                 query: SINGLE_THING_QUERY,
                                 variables: { id: this.props.thingID }
                              },
                              {
                                 query: CONTEXT_QUERY,
                                 variables: { id: this.props.thingID }
                              }
                           ]}
                        >
                           {(editComment, { loading, error, called, data }) => (
                              <textarea
                                 className="editCommentBox"
                                 placeholder="Edit comment"
                                 onKeyDown={e =>
                                    this.handleKeyDown(e, editComment)
                                 }
                                 onChange={this.handleChange}
                                 value={this.state.comment}
                              />
                           )}
                        </Mutation>
                     )}
                  </div>
               </div>
               {this.props.member != null &&
                  (data.author.id === this.props.member.id ||
                     this.props.member.roles.some(role =>
                        ['Admin', 'Editor', 'Moderator'].includes(role)
                     )) && (
                     <div className="buttons">
                        <Mutation
                           mutation={DELETE_COMMENT_MUTATION}
                           variables={{
                              id: data.id
                           }}
                           refetchQueries={[
                              {
                                 query: SINGLE_THING_QUERY,
                                 variables: {
                                    id: this.props.thingID
                                 }
                              },
                              {
                                 query: CONTEXT_QUERY,
                                 variables: { id: this.props.thingID }
                              }
                           ]}
                        >
                           {(
                              deleteComment,
                              { loading, error, called, data }
                           ) => (
                              <img
                                 className={
                                    loading
                                       ? 'deleteCommentButton loading'
                                       : 'deleteCommentButton'
                                 }
                                 src="/static/red-x.png"
                                 alt="delete comment button"
                                 onClick={() => {
                                    deleteComment().catch(err => {
                                       alert(err.message);
                                    });
                                 }}
                              />
                           )}
                        </Mutation>
                        <img
                           className="editCommentButton"
                           src="/static/edit-this.png"
                           alt="edit comment button"
                           onClick={() => {
                              this.setState({ editing: !this.state.editing });
                           }}
                        />
                     </div>
                  )}
            </div>
            <div className="commentMeta">{timeAgoString} AGO</div>
         </StyledComment>
      );
   }
}

export default Comment;
