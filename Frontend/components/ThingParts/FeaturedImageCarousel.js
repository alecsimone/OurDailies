import React, { useState } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import {
   getYoutubeVideoIdFromLink,
   getGfycatSlugFromLink
} from '../../lib/utils';
import { SINGLE_THING_QUERY } from '../../pages/thing';
import { CONTEXT_QUERY } from '../../pages/context';

const SET_FEATURED_IMAGE_MUTATION = gql`
   mutation SET_FEATURED_IMAGE_MUTATION(
      $imageUrl: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      setFeaturedImage(
         imageUrl: $imageUrl
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const CHANGE_TITLE_MUTATION = gql`
   mutation CHANGE_TITLE_MUTATION(
      $title: String!
      $thingID: ID!
      $isNarrative: Boolean
   ) {
      changeThingTitle(
         title: $title
         thingID: $thingID
         isNarrative: $isNarrative
      ) {
         message
      }
   }
`;

const FeaturedImageContainer = styled.div`
   position: relative;
   max-width: calc(1440px - 4rem);
   .featuredImageWrapper {
      height: 100%;
      background: ${props => props.theme.background};
      position: relative;
      height: 100%;
      input {
         position: absolute;
         right: 0;
         z-index: 1;
      }
      @media screen and (min-width: 800px) {
         /* &:after {
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
         } */
      }
   }
   img.featured {
      width: 100%;
      height: 100%;
      max-height: 800px;
      object-fit: contain;
      z-index: -1;
   }
   button {
      position: absolute;
      z-index: 2;
      top: calc(50% - 1rem);
      border: none;
      color: transparent;
      transition: transform 0.4s ease-out;
      @media screen and (min-width: 800px) {
         opacity: 0.6;
      }
      img {
         height: 2rem;
      }
      &:hover {
         background: none;
         opacity: 1;
         transition: transform 0.25s;
      }
      &.prev {
         left: 0;
         img {
            transform: rotate(-90deg);
         }
         &:hover {
            transform: scale(1.2);
         }
      }
      &.next {
         right: 0rem;
         img {
            transform: rotate(90deg);
         }
         &:hover {
            transform: scale(1.2);
         }
      }
   }
   .embed-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      max-width: 100%;
      iframe {
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
      }
   }
   h3.headline {
      font-size: ${props => props.theme.bigHead};
      margin: 0rem;
      line-height: 1;
      display: flex;
      align-items: center;
      .title {
         flex-grow: 1;
      }
      input {
         background: none;
         font-size: ${props => props.theme.bigHead};
         font-weight: bold;
         padding: 0;
         line-height: 1;
         margin-bottom: -1px;
      }
      img.editThis {
         height: 2.5rem;
         width: 2.5rem;
         align-self: flex-end;
         cursor: pointer;
         opacity: 0.6;
         &:hover {
            opacity: 1;
         }
      }
      a:hover {
         text-decoration: underline;
      }
      @media screen and (min-width: 800px) {
         position: absolute;
         bottom: 0;
         left: 0;
         width: 100%;
         padding: 12rem 2rem 1.25rem;
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
         &.video {
            display: none;
         }
      }
   }
   .videoFeatured h3.headline {
      @media screen and (min-width: 800px) {
         position: relative;
         padding: 1rem;
         text-shadow: none;
         background: none;
         filter: none; /* IE6-9 */
      }
   }
`;

const FeaturedImageCarousel = props => {
   const [currentSliderPosition, setCurrentSliderPosition] = useState(0);
   const [editingTitle, setEditingTitle] = useState(false);
   const [title, setTitle] = useState(props.headline);

   const sliderPositionDown = function(mediaLinksArray) {
      setCurrentSliderPosition(
         currentSliderPosition === 0
            ? mediaLinksArray.length
            : currentSliderPosition - 1
      );
   };

   const sliderPositionUp = function(mediaLinksArray) {
      setCurrentSliderPosition(
         currentSliderPosition === mediaLinksArray.length
            ? 0
            : currentSliderPosition + 1
      );
   };

   const setFeaturedImageHandler = async function(e, setFeaturedImage) {
      // e.target.checked is returning false when the box is already checked, presumably because it's giving me the value after the click even though I used preventDefault. So e.target.checked === false actually means the box IS already checked
      if (e.target.checked) {
         await setFeaturedImage();
         setCurrentSliderPosition(0);
      }
   };

   const makeTitleEditable = function() {
      setEditingTitle(!editingTitle);
   };

   const handleTitleChange = function(e) {
      setTitle(e.target.value);
   };

   const watchForEnter = async function(e, changeThingTitle) {
      if (e.key === 'Enter') {
         await changeThingTitle();
         setEditingTitle(false);
      }
   };

   const featuredImageButItsAnArrayNow = [props.featuredImage];

   const justTheLinks =
      props.includedLinks != null
         ? props.includedLinks.map(linkObject => linkObject.url)
         : [];

   const mediaLinksArray = justTheLinks.filter(link => {
      const lowerCasedLink = link.toLowerCase();
      return (
         link !== props.featuredImage &&
         (lowerCasedLink.includes('jpg') ||
            lowerCasedLink.includes('jpeg') ||
            lowerCasedLink.includes('png') ||
            lowerCasedLink.includes('gif') ||
            lowerCasedLink.includes('youtube.com/watch?v=') ||
            lowerCasedLink.includes('youtu.be/') ||
            lowerCasedLink.includes('gfycat.com/'))
      );
   });
   const allMedia =
      props.featuredImage != null &&
      props.featuredImage !== '/static/defaultPic.jpg'
         ? featuredImageButItsAnArrayNow.concat(mediaLinksArray)
         : mediaLinksArray;

   const currentLink = allMedia[currentSliderPosition];

   let leftButton;
   let rightButton;

   const headline = (
      <h3 className="headline">
         {editingTitle ? (
            <Mutation
               mutation={CHANGE_TITLE_MUTATION}
               variables={{
                  title,
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
               {(changeThingTitle, { loading, error, called, data }) => (
                  <input
                     type="text"
                     className="title"
                     value={title}
                     onChange={handleTitleChange}
                     onKeyDown={e => {
                        e.persist();
                        watchForEnter(e, changeThingTitle);
                     }}
                  />
               )}
            </Mutation>
         ) : (
            <a
               href={props.originalSource ? props.originalSource : null}
               target="_blank"
               className="headlineLink title"
            >
               {props.headline}
            </a>
         )}
         <img
            src="/static/edit-this.png"
            alt="edit headline button"
            className="editThis"
            onClick={makeTitleEditable}
         />
      </h3>
   );

   if (
      mediaLinksArray.length > 1 ||
      (mediaLinksArray.length > 0 &&
         props.featuredImage != null &&
         props.featuredImage !== '/static/defaultPic.jpg')
   ) {
      leftButton = (
         <button
            className="prev"
            onClick={e => {
               sliderPositionDown(mediaLinksArray);
            }}
         >
            <img src="/static/grey-up-arrow.png" alt="previous image button" />
         </button>
      );
      rightButton = (
         <button
            className="next"
            onClick={e => {
               sliderPositionUp(mediaLinksArray);
            }}
         >
            <img src="/static/grey-up-arrow.png" alt="next image button" />
         </button>
      );
   }

   let featuredImage;

   const lowerCasedCurrentLink =
      currentLink != null ? currentLink.toLowerCase() : null;

   if (currentLink == null) {
      featuredImage = (
         <>
            <div className="featuredImageWrapper">
               <img
                  src="/static/defaultPic.jpg"
                  className="featured"
                  alt="empty featured image"
               />
            </div>
            {headline}
         </>
      );
   } else if (
      lowerCasedCurrentLink.includes('jpg') ||
      lowerCasedCurrentLink.includes('jpeg') ||
      lowerCasedCurrentLink.includes('png') ||
      lowerCasedCurrentLink.includes('gif')
   ) {
      featuredImage = (
         <>
            <div className="featuredImageWrapper">
               {props.member != null &&
                  props.member.roles.some(role =>
                     ['Admin', 'Editor', 'Moderator'].includes(role)
                  ) && (
                     <Mutation
                        mutation={SET_FEATURED_IMAGE_MUTATION}
                        variables={{
                           imageUrl: currentLink,
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
                        {(
                           setFeaturedImage,
                           { loading, error, called, data }
                        ) => (
                           <input
                              type="checkbox"
                              checked={currentLink === props.featuredImage}
                              onChange={e => {
                                 e.preventDefault();
                                 setFeaturedImageHandler(
                                    e,
                                    setFeaturedImage
                                 ).catch(err => {
                                    alert(err.message);
                                 });
                              }}
                           />
                        )}
                     </Mutation>
                  )}
               <img
                  src={currentLink}
                  className="featured"
                  alt="not featured image for post"
               />
            </div>
            {headline}
         </>
      );
   } else if (
      currentLink.includes('youtube.com/watch?v=') ||
      currentLink.includes('youtu.be/')
   ) {
      const videoID = getYoutubeVideoIdFromLink(currentLink);
      featuredImage = (
         <div className="videoFeatured">
            <div className="embed-container">
               <iframe
                  src={`https://www.youtube.com/embed/${videoID}?autoplay=0&loop=1&playlist=${videoID}`}
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
               />
            </div>
            {headline}
         </div>
      );
   } else if (currentLink.includes('gfycat.com/')) {
      const videoID = getGfycatSlugFromLink(currentLink);
      featuredImage = (
         <div className="videoFeatured">
            <div className="embed-container">
               <iframe
                  src={`https://gfycat.com/ifr/${videoID}`}
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
               />
            </div>
            {headline}
         </div>
      );
   }

   return (
      <FeaturedImageContainer>
         {leftButton}
         {featuredImage}
         {rightButton}
      </FeaturedImageContainer>
   );
};

export default FeaturedImageCarousel;
