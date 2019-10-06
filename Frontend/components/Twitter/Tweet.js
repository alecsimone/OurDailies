const Tweet = props => {
   const { tweet } = props;
   const entities = [];
   if (tweet.extended_entities && tweet.extended_entities.urls) {
      tweet.extended_entities.urls.forEach(entity => {
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
         <div className="quoteTweetContainer">
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
            <Tweet
               tweet={tweet.quoted_status}
               key={tweet.quoted_status.id_str}
            />
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
         <article key={rt.id_str} className="tweet">
            RT{' '}
            <a
               href={`https://twitter.com/${rt.user.screen_name}`}
               target="_blank"
               className="retweetLink"
            >
               @{rt.user.screen_name}
            </a>
            : {rt.full_text}
            {entities}
            <div className="tweetMeta">
               <a
                  href={`https://twitter.com/blank/status/${rt.id_str}`}
                  target="_blank"
                  className="linkToOriginalTweet"
               >
                  Link
               </a>
            </div>
         </article>
      );
   }
   return (
      <article key={tweet.id_str} className="tweet">
         {tweet.full_text}
         {entities}
         <div className="tweetMeta">
            <a
               href={`https://twitter.com/blank/status/${tweet.id_str}`}
               target="_blank"
               className="linkToOriginalTweet"
            >
               Link
            </a>
         </div>
      </article>
   );
};

export default Tweet;
