import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Link from "next/link";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import VoteBar from "./ThingParts/VoteBar";
import NarrativesBoxEditable from "./ThingParts/NarrativesBoxEditable";
import TinyThing from "./TinyThing";
import Comment from "./Comment";

const StyledFullThing = styled.article`
   position: relative;
   margin: 0.5rem;
   padding: 0.5rem 2rem;
   border-radius: 0 2px 2px 0;
   width: 100%;
   max-width: 1280px;
   :before {
      content: "";
      background: ${props => props.theme.blue};
      z-index: -1;
      height: 5rem;
      width: 100%;
      position: absolute;
      left: 0;
      top: -1.5rem;
      opacity: 0.8;
      border-radius: 2px;
   }
   .lede {
      position: relative;
      .featuredImageContainer {
         max-width: calc(1440px - 4rem);
         padding-bottom: 56.25%;
         height: 0;
         overflow: hidden;
         background: ${props => props.theme.darkGrey};
         :after {
            content: " ";
            z-index: 0;
            display: block;
            position: absolute;
            top: -20;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: hsla(0, 0%, 0%, 0.4);
         }
      }
      img.featured {
         width: 100%;
         z-index: -1;
      }
      h3.headline {
         font-size: 5rem;
         margin: 0rem;
         line-height: 1;
         position: absolute;
         bottom: 0;
         left: 0;
         width: 100%;
         padding: 12rem 2rem 2rem;
         text-shadow: 0px 0px 2px black;
         background: black;
         background: -moz-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* FF3.6-15 */
         background: -webkit-linear-gradient(
            top,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* Chrome10-25,Safari5.1-6 */
         background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.85) 75%
         ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
         filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#000000',GradientType=0 ); /* IE6-9 */
      }
   }
   p.meta {
      color: ${props => props.theme.lightGrey};
      font-size: 1.25rem;
      line-height: 1;
      opacity: 0.6;
   }
   ul.summary {
      margin: 3rem 0;
      padding: 0 0 0 1rem;
      li {
         font-size: 1.75rem;
         line-height: 2;
         list-style-type: " - ";
      }
   }
   h5 {
      font-size: 2rem;
      margin: 0 0 1.5rem;
      text-align: center;
   }
   .submissionsAndLinks {
      display: flex;
      margin: 3rem 0;
      @media screen and (max-width: 1200px) {
         flex-wrap: wrap;
      }
      .submissions {
         flex-grow: 2;
         max-width: 1000px;
         article {
            margin-bottom: 1rem;
         }
      }
      .links {
         flex-grow: 1;
         ul {
            margin: 0;
            list-style-type: none;
            li {
               margin-bottom: 0.5rem;
            }
         }
      }
      a.includedLink {
         text-decoration: underline;
         color: ${props => props.theme.blue};
         font-size: 1.75rem;
      }
   }
   .commentsContainer {
      border-top: 1px solid hsla(0, 0%, 80%, 0.1);
      margin: auto;
      padding: 2rem;
   }
`;

class FullThing extends Component {
   render() {
      const { thing } = this.props;
      const featuredImage = thing.featuredImage ? (
         <div className="featuredImageContainer">
            <img src={thing.featuredImage} className="featured" />
         </div>
      ) : (
         ""
      );

      let headline;
      headline = <h3 className="headline">{thing.title}</h3>;

      let summary;
      if (thing.summary) {
         const summaryItems = thing.summary.map((bullet, index) => (
            <li key={index}>{bullet}</li>
         ));
         summary = <ul className="summary">{summaryItems}</ul>;
      }

      let submissions;
      if (thing.includedSubmissions) {
         const submissionThings = thing.includedSubmissions.map(submission => (
            <TinyThing thing={submission} key={submission.id} />
         ));
         submissions = (
            <div className="submissions">
               <h5>RELEVANT THINGS</h5>
               {submissionThings}
            </div>
         );
      }

      let links;
      if (thing.includedLinks) {
         const linkItems = thing.includedLinks.map(link => (
            <li key={link.url}>
               <a className="includedLink" href={link.url} key={link.url}>
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
      }

      let comments;
      if (thing.comments.length > 0) {
         const commentItems = thing.comments.map(comment => (
            <Comment data={comment} />
         ));
         comments = (
            <div className="commentsContainer">
               <h5 className="comments">COMMENTS</h5>
               {commentItems}
            </div>
         );
      }

      return (
         <StyledFullThing>
            <div className="lede">
               {featuredImage}
               {headline}
            </div>
            <p className="meta">
               Created at {thing.createdAt}{" "}
               {thing.author ? `by ${thing.author.displayName}` : ''}
            </p>
            {summary}
            <NarrativesBoxEditable
               partOfNarratives={thing.partOfNarratives}
               thingID={thing.id}
            />
            <VoteBar />
            <div className="submissionsAndLinks">
               {submissions}
               {links}
            </div>
            {comments}
         </StyledFullThing>
      );
   }
}

// Thing.propTypes = {
//     thing: PropTypes.object.isRequired,
// };

export default FullThing;
