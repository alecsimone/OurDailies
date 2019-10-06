import styled from 'styled-components';
import { convertISOtoAgo, urlFinder } from '../../lib/utils';

const StyledTweet = styled.article`
   margin: 2rem 1rem;
   padding: 2rem 1rem;
   border: 1px solid ${props => props.theme.veryLowContrastGrey};
   border-radius: 3px;
   background: ${props => props.theme.background};
   .replyInfo {
      a {
         color: ${props => props.theme.lightMajorColor};
         &:hover {
            color: ${props => props.theme.majorColor};
         }
      }
      margin-bottom: 1rem;
   }
   .retweeter {
      display: flex;
      align-items: center;
      margin: -2rem -1rem 1rem -1rem;
      padding: 2rem 1rem;
      background: ${props => props.theme.veryLowContrastCoolGrey};
      a.retweetLink {
         color: ${props => props.theme.lightMajorColor};
         &:hover {
            color: ${props => props.theme.majorColor};
         }
      }
      img.retweetedAvatar {
         border-radius: 50%;
         width: ${props => props.theme.smallHead};
         height: auto;
         margin-right: 1rem;
      }
   }
   img.embeddedPhoto,
   .embeddedVideo video {
      width: 500px;
      max-width: 100%;
      height: auto;
      margin: 1rem 0;
   }
   .embeddedLink {
      margin: 1rem 0;
      a {
         color: ${props => props.theme.lightMajorColor};
         &:hover {
            color: ${props => props.theme.majorColor};
         }
      }
   }
   .quoteTweetContainer {
      h5 {
         display: flex;
         align-items: center;
      }
      img.quotedTweeterAvatar {
         border-radius: 50%;
         max-width: ${props => props.theme.smallHead};
         height: auto;
         margin: 0 1rem;
      }
   }
   .tweetMeta {
      margin-top: 1rem;
      color: ${props => props.theme.lightMajorColor};
      font-size: ${props => props.theme.tinyText};
      display: flex;
      align-items: center;
      justify-content: space-between;
      a.linkToOriginalTweet {
         color: ${props => props.theme.lightMajorColor};
         &:hover {
            color: ${props => props.theme.majorColor};
         }
      }
      .score {
         display: inline-flex;
         align-items: center;
         img {
            opacity: 0.5;
            width: ${props => props.theme.tinyText};
            height: auto;
            margin: 0 1rem 0 0.6rem;
         }
      }
   }
`;

const stripTcos = text => {
   const newText = text.replace(urlFinder, '');
   return newText;
};

const decodeHTML = text => {
   const txt = document.createElement('textarea');
   txt.innerHTML = text;
   return txt.value;
};

const Tweet = props => {
   const { tweet } = props;
   const entities = [];
   if (tweet.entities && tweet.entities.urls) {
      tweet.entities.urls.forEach(entity => {
         entities.push(
            <div className="embeddedLink" key={entity.display_url}>
               <a href={entity.expanded_url} target="_blank">
                  {entity.display_url}
               </a>
            </div>
         );
      });
   }
   if (tweet.extended_entities && tweet.extended_entities.media) {
      tweet.extended_entities.media.forEach(entity => {
         if (entity.type === 'photo') {
            entities.push(
               <a
                  href={entity.media_url_https}
                  target="_blank"
                  key={entity.id_str}
               >
                  <img
                     src={entity.media_url_https}
                     className="embeddedPhoto"
                     key={entity.id_str}
                  />
               </a>
            );
         } else if (entity.type === 'video' || entity.type === 'animated_gif') {
            const mp4s = entity.video_info.variants.filter(
               variantObject => variantObject.content_type === 'video/mp4'
            );
            mp4s.sort((a, b) => b.bitrate - a.bitrate);
            entities.push(
               <div className="embeddedVideo" key={entity.id_str}>
                  <video
                     src={mp4s[0].url}
                     controls
                     loop={entity.type === 'animated_gif' ? 'true' : false}
                     autoPlay={entity.type === 'animated_gif' ? 'true' : false}
                  />
               </div>
            );
         } else {
            entities.push(
               <div key={entity.id_str}>
                  There's media that's not a photo here
               </div>
            );
         }
      });
   }
   if (tweet.quoted_status != null) {
      entities.push(
         <div className="quoteTweetContainer" key={tweet.quoted_status.id_str}>
            <h5>
               <img
                  src={tweet.quoted_status.user.profile_image_url_https}
                  className="quotedTweeterAvatar"
               />
               <a
                  href={`https://twitter.com/${
                     tweet.quoted_status.user.screen_name
                  }`}
                  target="_blank"
               >
                  @{tweet.quoted_status.user.screen_name}
               </a>
               :
            </h5>
            <Tweet tweet={tweet.quoted_status} />
         </div>
      );
   }
   if (tweet.retweeted_status != null) {
      const rt = tweet.retweeted_status;
      if (entities.length === 0 && rt.entities.urls) {
         rt.entities.urls.forEach(entity => {
            entities.push(
               <div className="embeddedLink" key={entity.display_url}>
                  <a href={entity.expanded_url} target="_blank">
                     {entity.display_url}
                  </a>
               </div>
            );
         });
      }
      if (entities.length === 0 && rt.entities.media) {
         rt.entities.media.forEach(entity => {
            if (entity.type === 'photo') {
               entities.push(
                  <a
                     href={entity.media_url_https}
                     target="_blank"
                     key={entity.id_str}
                  >
                     <img
                        src={entity.media_url_https}
                        className="embeddedPhoto"
                     />
                  </a>
               );
            } else {
               entities.push(<div>There's media that's not a photo here</div>);
            }
         });
      }
      return (
         <StyledTweet key={rt.id_str} className="tweet">
            <div className="retweeter">
               <img
                  src={rt.user.profile_image_url_https}
                  className="retweetedAvatar"
                  alt="retweetedAvatar"
               />
               <a
                  href={`https://twitter.com/${rt.user.screen_name}`}
                  target="_blank"
                  className="retweetLink"
               >
                  @{rt.user.screen_name}
               </a>
            </div>
            {rt.in_reply_to_status_id_str != null ? (
               <div className="replyInfo">
                  <a
                     href={`https://twitter.com/blank/status/${
                        rt.in_reply_to_status_id_str
                     }`}
                     target="_blank"
                  >
                     @{rt.in_reply_to_screen_name}
                  </a>
               </div>
            ) : (
               ''
            )}
            {decodeHTML(stripTcos(rt.full_text))}
            {entities}
            <div className="tweetMeta">
               <a
                  href={`https://twitter.com/blank/status/${rt.id_str}`}
                  target="_blank"
                  className="linkToOriginalTweet"
               >
                  {convertISOtoAgo(rt.created_at)} AGO
               </a>
               <div className="score">
                  {rt.favorite_count}
                  <img src="/static/heart-outline.png" alt="favorites" />{' '}
                  {rt.retweet_count}
                  <img src="/static/rt-icon.png" alt="favorites" />
               </div>
            </div>
         </StyledTweet>
      );
   }
   return (
      <StyledTweet key={tweet.id_str} className="tweet">
         {tweet.in_reply_to_status_id_str != null ? (
            <div className="replyInfo">
               <a
                  href={`https://twitter.com/blank/status/${
                     tweet.in_reply_to_status_id_str
                  }`}
                  target="_blank"
               >
                  @{tweet.in_reply_to_screen_name}
               </a>
            </div>
         ) : (
            ''
         )}
         {decodeHTML(stripTcos(tweet.full_text))}
         {entities}
         <div className="tweetMeta">
            <a
               href={`https://twitter.com/blank/status/${tweet.id_str}`}
               target="_blank"
               className="linkToOriginalTweet"
            >
               {convertISOtoAgo(tweet.created_at)} AGO
            </a>
            <div className="score">
               {tweet.favorite_count}
               <img src="/static/heart-outline.png" alt="favorites" />
               {tweet.retweet_count}
               <img src="/static/rt-icon.png" alt="favorites" />
            </div>
         </div>
      </StyledTweet>
   );
};

export default Tweet;
