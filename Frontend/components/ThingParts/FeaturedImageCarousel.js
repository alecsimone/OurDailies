import React, { Component } from 'react';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { getYoutubeVideoIdFromLink } from '../../lib/utils';
import { SINGLE_THING_QUERY } from "../../pages/thing";

const SET_FEATURED_IMAGE_MUTATION = gql`
   mutation SET_FEATURED_IMAGE_MUTATION($imageUrl: String!, $thingID: ID!) {
      setFeaturedImage(imageUrl: $imageUrl, thingID: $thingID) {
         id
         featuredImage
      }
   }
`;

const FeaturedImageContainer = styled.div`
   position: relative;
   max-width: calc(1440px - 4rem);
   padding-bottom: 56.25%;
   height: 0;
   overflow: hidden;
   background: ${props => props.theme.background};
   .featuredImageWrapper {
      input {
         position: absolute;
         right: 0;
         z-index: 1;
      }
      &:after {
         /* Puts a tint over the image */
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
   button {
      position: absolute;
      z-index: 2;
      top: calc(50% - 1rem);
      border: none;
      color: transparent;
      opacity: 0.6;
      transition: transform 0.4s ease-out;
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
         right: 0;
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
`;

class FeaturedImageCarousel extends Component {
   state = {
      currentSliderPosition: 0
   };

   sliderPositionDown = mediaLinksArray => {
      this.setState({
         currentSliderPosition:
            this.state.currentSliderPosition === 0
               ? mediaLinksArray.length
               : this.state.currentSliderPosition - 1
      });
   };

   sliderPositionUp = mediaLinksArray => {
      this.setState({
         currentSliderPosition:
            this.state.currentSliderPosition === mediaLinksArray.length
               ? 0
               : this.state.currentSliderPosition + 1
      });
   };

   setFeaturedImageHandler = async (e, setFeaturedImage) => {
      // e.target.checked is returning false when the box is already checked, presumably because it's giving me the value after the click even though I used preventDefault. So e.target.checked === false actually means the box IS already checked
      if (e.target.checked) {
         await setFeaturedImage();
         this.setState({ currentSliderPosition: 0 });
      }
   };

   render() {
      const featuredImageButItsAnArrayNow = [this.props.featuredImage];

      const justTheLinks = this.props.includedLinks.map(
         linkObject => linkObject.url
      );

      const mediaLinksArray = justTheLinks.filter(
         link =>
            (link !== this.props.featuredImage && link.includes("jpg")) ||
            link.includes('png') ||
            link.includes('gif') ||
            link.includes('youtube.com/watch?v=') ||
            link.includes('youtu.be/')
      );
      const allMedia = featuredImageButItsAnArrayNow.concat(mediaLinksArray);

      const currentLink = allMedia[this.state.currentSliderPosition];

      let leftButton;
      let rightButton;
      if (
         mediaLinksArray.length > 1 ||
         (mediaLinksArray.length > 0 && this.props.featuredImage != null)
      ) {
         leftButton = (
            <button
               className="prev"
               onClick={e => {
                  this.sliderPositionDown(mediaLinksArray);
               }}
            >
               <img src="/static/grey-up-arrow.png" />
            </button>
         );
         rightButton = (
            <button
               className="next"
               onClick={e => {
                  this.sliderPositionUp(mediaLinksArray);
               }}
            >
               <img src="/static/grey-up-arrow.png" />
            </button>
         );
      }

      let featuredImage;

      if (currentLink == null) {
         featuredImage = (
            <>
               <div className="featuredImageWrapper">
                  <img src="/static/defaultPic.jpg" className="featured" />
               </div>
               <h3 className="headline">{this.props.headline}</h3>
            </>
         );
      } else if (
         currentLink.includes("jpg") ||
         currentLink.includes("png") ||
         currentLink.includes("gif")
      ) {
         featuredImage = (
            <>
               <div className="featuredImageWrapper">
                  {this.props.member != null &&
                     this.props.member.roles.some(role =>
                        ["Admin", "Editor", "Moderator"].includes(role)
                     ) && (
                        <Mutation
                           mutation={SET_FEATURED_IMAGE_MUTATION}
                           variables={{
                              imageUrl: currentLink,
                              thingID: this.props.thingID
                           }}
                           refetchQueries={[
                              {
                                 query: SINGLE_THING_QUERY,
                                 variables: { id: this.props.thingID }
                              }
                           ]}
                        >
                           {(
                              setFeaturedImage,
                              { loading, error, called, data }
                           ) => (
                              <input
                                 type="checkbox"
                                 checked={
                                    currentLink === this.props.featuredImage
                                 }
                                 onChange={e => {
                                    e.preventDefault();
                                    this.setFeaturedImageHandler(
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
                  <img src={currentLink} className="featured" />
               </div>
               <h3 className="headline">{this.props.headline}</h3>
            </>
         );
      } else if (
         currentLink.includes('youtube.com/watch?v=') ||
         currentLink.includes('youtu.be/')
      ) {
         const videoID = getYoutubeVideoIdFromLink(currentLink);
         featuredImage = (
            <div className="embed-container">
               <iframe
                  src={`https://www.youtube.com/embed/${videoID}?autoplay=0&loop=1&playlist=${videoID}`}
                  frameBorder="0"
                  scrolling="no"
                  allowFullScreen
               />
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
   }
}

export default FeaturedImageCarousel;
