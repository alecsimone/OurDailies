import React, { Component } from "react";
import styled from "styled-components";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../ErrorMessage";
import { SINGLE_THING_QUERY } from "../../pages/thing";
import { convertISOtoAgo } from "../../lib/utils";

const DELETE_COMMENT_MUTATION = gql`
   mutation DELETE_COMMENT_MUTATION($id: ID!) {
      deleteComment(id: $id) {
         id
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
      align-items: center;
      justify-content: space-between;
      .commentLeft {
         display: flex;
         align-items: flex-start;
         img.avatar {
            width: 3rem;
            height: 3rem;
            margin-top: 0.6rem;
            border-radius: 100%;
            margin-right: 1.25rem;
         }
         .commentAndAuthorContainer {
            span.commenter {
               color: ${props => props.theme.majorColor};
               margin-right: 0.5rem;
            }
            display: inline-block;
            margin: 0;
            max-width: 800px;
            p.commentParagraph {
               margin: 0 0 1.5rem 0;
               display: inline-block;
               &:last-of-type {
                  margin: 0 0 0.5rem 0;
               }
            }
         }
      }
      img.deleteCommentButton {
         width: 2rem;
         height: 2rem;
         opacity: 0.25;
         align-self: flex-start;
         margin-top: 0.6rem;
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
   render() {
      const { data } = this.props;
      const paragraphsAndEmptyStrings = data.comment.split("\n");
      const paragraphs = paragraphsAndEmptyStrings.filter(
         string => string != ''
      );
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
                  <img className="avatar" src={data.author.avatar} />
                  <div className="commentAndAuthorContainer">
                     {paragraphElements}
                  </div>
               </div>
               {this.props.member != null &&
                  (data.author.id === this.props.member.id ||
                     this.props.member.roles.some(role =>
                        ['Admin', 'Editor', 'Moderator'].includes(role)
                     )) && (
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
                           }
                        ]}
                     >
                        {(deleteComment, { loading, error, called, data }) => (
                           <img
                              className={
                                 loading
                                    ? 'deleteCommentButton loading'
                                    : 'deleteCommentButton'
                              }
                              src="/static/red-x.png"
                              onClick={() => {
                                 deleteComment().catch(err => {
                                    alert(err.message);
                                 });
                              }}
                           />
                        )}
                     </Mutation>
                  )}
            </div>
            <div className="commentMeta">{timeAgoString} AGO</div>
         </StyledComment>
      );
   }
}

export default Comment;
