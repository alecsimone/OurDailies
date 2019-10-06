import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Error from './ErrorMessage';
import Tweet from './Twitter/Tweet';
import { CURRENT_MEMBER_QUERY } from './Member';

const GET_TWITTER_LISTS = gql`
   query GET_TWITTER_LISTS {
      getTwitterLists {
         message
      }
   }
`;

const GET_TWEETS_FOR_LIST = gql`
   query GET_TWEETS_FOR_LIST($listID: String!) {
      getTweetsForList(listID: $listID) {
         dataString
      }
   }
`;

const MARK_TWEETS_SEEN = gql`
   mutation MARK_TWEETS_SEEN($listID: String!, $tweetIDs: [String]!) {
      markTweetsSeen(listID: $listID, tweetIDs: $tweetIDs) {
         __typename
         id
         twitterSinceIDsObject
         twitterSeenIDsObject
      }
   }
`;

const StyledTwitterReader = styled.div`
   display: flex;
   .picker {
      width: 20%;
      max-width: 300px;
      h5 {
         font-size: ${props => props.theme.bigText};
         span.twitterName {
            color: ${props => props.theme.secondaryAccent};
         }
      }
      ul {
         list-style-type: '';
         li {
            cursor: pointer;
            margin: 1rem 0;
            font-weight: 700;
            &:hover {
               text-decoration: underline;
            }
         }
      }
   }
   .tweetsArea {
      width: 80%;
      .tweeters {
         display: flex;
         .tweeterColumn {
            margin: 0 2rem;
            background: ${props => props.theme.veryLowContrastCoolGrey};
            border-radius: 3px;
            position: relative;
            width: 600px;
            height: 80vh;
            h3.tweeterHeader {
               position: absolute;
               top: 0;
               left: 0;
               width: 100%;
               display: flex;
               align-items: center;
               justify-content: space-around;
               margin: 0;
               padding: 2rem 0;
               background: ${props => props.theme.lowContrastCoolGrey};
               text-align: center;
               border-radius: 3px 3px 0 0;
               img {
                  border-radius: 50%;
                  width: ${props => props.theme.smallHead};
                  height: ${props => props.theme.smallHead};
               }
               img.markSeen {
                  cursor: pointer;
                  opacity: 0.4;
                  &:hover {
                     opacity: 1;
                  }
               }
            }
            .tweetsContainer {
               margin-top: 8rem;
               overflow-y: scroll;
               height: calc(100% - 8rem);
            }
            article.tweet {
               margin: 2rem 1rem;
               padding: 2rem 1rem;
               border: 1px solid ${props => props.theme.veryLowContrastGrey};
               border-radius: 3px;
               background: ${props => props.theme.background};
               a.retweetLink {
                  color: ${props => props.theme.majorColor};
               }
               img.embeddedPhoto,
               .embeddedVideo video {
                  max-width: 500px;
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
                  a.linkToOriginalTweet {
                     color: ${props => props.theme.lightMajorColor};
                     font-size: ${props => props.theme.tinyText};
                     &:hover {
                        color: ${props => props.theme.majorColor};
                     }
                  }
               }
            }
         }
         &.empty {
            margin-top: 4rem;
            justify-content: center;
            flex-wrap: wrap;
            h3 {
               font-size: ${props => props.theme.bigHead};
               font-weight: 700;
               color: ${props => props.theme.majorColor};
               width: 100%;
               text-align: center;
            }
            button {
               padding: 1rem;
               &.loading {
                  background: ${props => props.theme.veryLowContrastGrey};
               }
            }
         }
      }
   }
`;

const TwitterReader = props => {
   const [activeList, setActiveList] = useState(false);
   const [tweetsArray, setTweetsArray] = useState(['Loading tweets...']);

   const getTweetsForListHandler = async (listID, client) => {
      const refreshButton = document.getElementById('refreshButton');
      if (refreshButton != null) {
         refreshButton.classList.add('loading');
      }
      const { data, loading } = await client
         .query({
            query: GET_TWEETS_FOR_LIST,
            variables: {
               listID
            }
         })
         .catch(err => {
            alert(err.message);
         });
      const tweetsDataObject = JSON.parse(data.getTweetsForList.dataString);
      const tweetsData = JSON.parse(tweetsDataObject.listTweets).reverse();

      const thatTweet = tweetsData.filter(
         tweet => tweet.id_str === '1177064748090658817'
      );
      console.log(thatTweet);

      setActiveList(listID);
      setTweetsArray(tweetsData);
      if (refreshButton != null) {
         refreshButton.classList.remove('loading');
      }
      return tweetsData;
   };

   const pickList = async (listID, client) => {
      const tweetsData = await getTweetsForListHandler(listID, client);
      setActiveList(listID);
   };

   const notifyOfSeenTweets = async (tweets, client) => {
      const tweetIDs = [];
      tweets.forEach(tweet => tweetIDs.push(tweet.id_str));

      const { data, loading } = await client
         .mutate({
            mutation: MARK_TWEETS_SEEN,
            variables: {
               listID: activeList,
               tweetIDs
            },
            refetchQueries: [
               {
                  query: CURRENT_MEMBER_QUERY
               }
            ]
         })
         .catch(err => {
            alert(err.message);
         });
   };

   return (
      <Query query={GET_TWITTER_LISTS}>
         {({ error, loading, data, client }) => {
            if (error) return <Error error={error} />;
            if (loading) return <p>Loading...</p>;
            const lists = JSON.parse(data.getTwitterLists.message);
            const listElements = lists.map(listData => (
               <li
                  key={listData.id_str}
                  onClick={() => pickList(listData.id_str, client)}
               >
                  {listData.name}
               </li>
            ));
            listElements.unshift(
               <li key="home" onClick={() => pickList('home', client)}>
                  Home
               </li>
            );

            let tweetsDisplay;
            if (activeList === false) {
               const [seeAllList] = lists.filter(
                  list => list.name.toLowerCase() === 'see all'
               );

               if (seeAllList) {
                  getTweetsForListHandler(seeAllList.id_str, client);
               } else {
                  getTweetsForListHandler('home', client);
               }
               tweetsDisplay = <div>Loading tweets...</div>;
            }

            if (activeList !== false) {
               if (tweetsArray[0] === 'Loading tweets...') {
                  tweetsDisplay = <div>Loading tweets...</div>;
               } else {
                  const tweetersArray = [];
                  const seenTweeters = [];

                  const seenIDs = JSON.parse(props.userSeenIDsObject);
                  const filteredTweets = tweetsArray.filter(tweet => {
                     if (seenIDs == null) return true;
                     if (seenIDs[activeList] == null) return true;
                     return !seenIDs[activeList].includes(tweet.id_str);
                  });

                  if (filteredTweets.length === 0) {
                     tweetsDisplay = (
                        <div className="tweeters empty">
                           <h3>No new tweets.</h3>
                           <button
                              id="refreshButton"
                              onClick={() =>
                                 getTweetsForListHandler(activeList, client)
                              }
                           >
                              Refresh
                           </button>
                        </div>
                     );
                  } else {
                     filteredTweets.forEach(tweet => {
                        const tweeter = tweet.user;
                        if (!seenTweeters.includes(tweeter.screen_name)) {
                           const tweeterObject = {
                              tweeter: {
                                 name: tweeter.screen_name,
                                 pic: tweeter.profile_image_url_https
                              },
                              tweets: [tweet]
                           };
                           tweetersArray.push(tweeterObject);
                           seenTweeters.push(tweeter.screen_name);
                        } else {
                           const positionInTweetersArray = tweetersArray.findIndex(
                              tweeterObject =>
                                 tweeterObject.tweeter.name ===
                                 tweeter.screen_name
                           );
                           tweetersArray[positionInTweetersArray].tweets.push(
                              tweet
                           );
                        }
                     });

                     const tweetElements = [];
                     for (let i = 0; i < 3 && i < seenTweeters.length; i++) {
                        const thisTweetersTweets = tweetersArray[i].tweets.map(
                           tweet => <Tweet tweet={tweet} key={tweet.id_str} />
                        );

                        const thisTweeter = (
                           <div
                              className="tweeterColumn"
                              key={tweetersArray[i].tweeter.name}
                           >
                              <h3 className="tweeterHeader">
                                 <img
                                    src={tweetersArray[i].tweeter.pic}
                                    className="tweeterAvatar"
                                 />
                                 <a
                                    href={`https://twitter.com/${
                                       tweetersArray[i].tweeter.name
                                    }`}
                                    target="_blank"
                                 >
                                    @{tweetersArray[i].tweeter.name}
                                 </a>
                                 <img
                                    src="/static/red-x.png"
                                    className="markSeen"
                                    onClick={() =>
                                       notifyOfSeenTweets(
                                          tweetersArray[i].tweets,
                                          client
                                       )
                                    }
                                 />
                              </h3>
                              <div className="tweetsContainer">
                                 {thisTweetersTweets}
                              </div>
                           </div>
                        );

                        tweetElements.push(thisTweeter);
                     }

                     tweetsDisplay = (
                        <div className="tweeters">{tweetElements}</div>
                     );
                  }
               }
            }

            return (
               <StyledTwitterReader className="twitterReader">
                  <div className="picker">
                     <h5>
                        Welcome,{' '}
                        <span className="twitterName">{props.userName}</span>
                     </h5>
                     <ul>{listElements}</ul>
                  </div>
                  <div className="tweetsArea">{tweetsDisplay}</div>
               </StyledTwitterReader>
            );
         }}
      </Query>
   );
};

export default TwitterReader;
