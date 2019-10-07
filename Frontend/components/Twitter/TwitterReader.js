import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Router from 'next/router';
import Error from '../ErrorMessage';
import Tweet from './Tweet';
import { CURRENT_MEMBER_QUERY } from '../Member';

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
   mutation MARK_TWEETS_SEEN(
      $listID: String!
      $tweeterID: String!
      $tweetIDs: [String]!
   ) {
      markTweetsSeen(
         listID: $listID
         tweeterID: $tweeterID
         tweetIDs: $tweetIDs
      ) {
         __typename
         id
         twitterSinceIDsObject
         twitterSeenIDs
      }
   }
`;

const StyledTwitterReader = styled.div`
   display: flex;
   flex-wrap: wrap;
   @media screen and (min-width: 800px) {
      flex-wrap: nowrap;
   }
   .picker {
      min-width: 200px;
      width: 90%;
      margin: auto;
      @media screen and (min-width: 800px) {
         margin: 2rem auto;
         width: 20%;
         max-width: 300px;
      }
      h5 {
         font-size: ${props => props.theme.bigText};
         position: relative;
         margin: 1rem 0;
         span.twitterName {
            color: ${props => props.theme.secondaryAccent};
         }
         button.showLists {
            border: none;
            width: ${props => props.theme.bigText};
            height: ${props => props.theme.bigText};
            padding: 0;
            position: absolute;
            right: 0;
            img {
               transform: rotateZ(0deg);
               width: 100%;
               height: auto;
               transition: transform 0.25s;
               &.collapsed {
                  transform: rotateZ(-180deg);
               }
            }
            @media screen and (min-width: 800px) {
               display: none;
            }
         }
      }
      ul {
         list-style-type: '';
         padding: 0;
         margin: 1rem 0 2rem;
         &.collapsed {
            @media screen and (max-width: 800px) {
               height: 0;
               overflow: hidden;
            }
         }
         li {
            cursor: pointer;
            margin: 0;
            font-weight: 700;
            padding: 1rem;
            border-radius: 3px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            span.remainingCounters,
            span.listOwner {
               opacity: 0.5;
               font-weight: 300;
            }
            @media screen and (min-width: 800px) {
               padding: 0.5rem;
            }
            &.activeList {
               background: ${props => props.theme.veryLowContrastGrey};
            }
            &:hover {
               text-decoration: underline;
            }
         }
      }
   }
   .tweetsArea {
      width: 80%;
      flex-grow: 1;
      .tweeters {
         .remainingCounters {
            width: 100%;
            margin: 0 0 1rem 2rem;
            opacity: 0.5;
         }
         .tweeterColumnsContainer {
            display: flex;
         }
         .tweeterColumn {
            margin: 0 2rem;
            background: ${props => props.theme.veryLowContrastCoolGrey};
            border-radius: 3px;
            position: relative;
            width: 600px;
            flex-grow: 1;
            min-width: 40rem;
            max-width: 80rem;
            height: 80vh;
            &.column1,
            &.column2 {
               @media screen and (max-width: 800px) {
                  display: none;
               }
            }
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
               background: ${props => props.theme.majorColorGlass};
               text-align: center;
               border-radius: 3px 3px 0 0;
               .bottom {
                  font-size: ${props => props.theme.tinyText};
                  font-weight: 400;
                  opacity: 0.4;
               }
               a.tweeterNameLink {
                  margin-right: 1rem;
               }
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
                  &.loading {
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
            .tweetsContainer {
               margin-top: 8rem;
               overflow-y: scroll;
               height: calc(100% - 8rem);
            }
            .scrollToBottomContainer {
               text-align: center;
               padding-top: 2rem;
               img.scrollToBottom {
                  width: ${props => props.theme.bigText};
                  height: auto;
                  transform: rotateX(180deg);
                  cursor: pointer;
                  opacity: 0.4;
                  &:hover {
                     opacity: 1;
                  }
               }
            }
         }
         &.empty {
            margin-top: 4rem;
            text-align: center;
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

const scrollTo = (element, to, duration) => {
   const start = element.scrollTop;
   const change = to - start;
   let currentTime = 0;
   const increment = 20;

   const animateScroll = function() {
      currentTime += increment;
      const val = Math.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
         setTimeout(animateScroll, increment);
      }
   };
   animateScroll();
};

// t = current time
// b = start value
// c = change in value
// d = duration
Math.easeInOutQuad = function(t, b, c, d) {
   t /= d / 2;
   if (t < 1) return (c / 2) * t * t + b;
   t--;
   return (-c / 2) * (t * (t - 2) - 1) + b;
};

const scrollColumnToTop = e => {
   if (!e.target.classList.contains('tweeterHeader')) return;
   const column = e.target.parentNode;
   const tweetsContainer = column.querySelector('.tweetsContainer');
   scrollTo(tweetsContainer, 0, 250);
};

const scrollColumnToBottom = e => {
   const column = e.target.parentNode.parentNode;
   const tweetsContainer = column.querySelector('.tweetsContainer');
   const bottom = tweetsContainer.scrollHeight;
   scrollTo(tweetsContainer, bottom, 250);
};

const filterTweets = (tweets, seenIDs, finder) => {
   const filteredTweets = tweets.filter(tweet => {
      if (seenIDs == null) return true;
      return !seenIDs.includes(tweet.id_str);
   });
   return filteredTweets;
};

const TwitterReader = props => {
   const [activeList, setActiveList] = useState(false);
   const [tweetsArray, setTweetsArray] = useState(['Loading tweets...']);
   const [pickerCollapsed, setPickerCollapsed] = useState(true);

   useEffect(() => {
      const headers = document.getElementsByClassName('tweeterHeader');
      if (headers.length > 0) {
         for (const header of headers) {
            header.addEventListener('click', scrollColumnToTop);
         }
      }

      const toBottomButtons = document.getElementsByClassName('scrollToBottom');
      if (toBottomButtons.length > 0) {
         for (const button of toBottomButtons) {
            button.addEventListener('click', scrollColumnToBottom);
         }
      }
   });

   const getTweetsForListHandler = async (listID, client) => {
      const refreshButton = document.getElementById('refreshButton');
      if (refreshButton != null) {
         refreshButton.classList.add('loading');
      }
      console.log('Getting some tweets');
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

      // const thatTweet = tweetsData.filter(
      //    tweet => tweet.id_str === '1177064748090658817'
      // );
      // console.log(thatTweet);

      setActiveList(listID);
      setTweetsArray(tweetsData);
      if (refreshButton != null) {
         refreshButton.classList.remove('loading');
      }
      return tweetsData;
   };

   const pickList = async (listID, listName, client) => {
      setTweetsArray(['Loading tweets...']);
      const tweetsData = await getTweetsForListHandler(listID, client);
      setActiveList(listID);
      const encodedName = encodeURIComponent(listName);
      const href = `/twitter?listname=${encodedName}`;
      const as = href;
      Router.replace(href, as, { shallow: true });
   };

   const notifyOfSeenTweets = async (tweeterID, tweets, client, button) => {
      button.classList.add('loading');
      const tweetIDs = [];
      tweets.forEach(tweet => tweetIDs.push(tweet.id_str));
      console.log(tweetIDs);

      const { data, loading } = await client
         .mutate({
            mutation: MARK_TWEETS_SEEN,
            variables: {
               listID: activeList,
               tweeterID,
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
      button.classList.remove('loading');
   };

   return (
      <Query query={GET_TWITTER_LISTS}>
         {({ error, loading, data, client }) => {
            if (error) return <Error error={error} />;
            if (loading) return <p>Loading...</p>;
            const listData = JSON.parse(data.getTwitterLists.message);
            const listIDs = Object.keys(listData);
            const listElements = listIDs.map(listID => {
               const thisListsTweets = JSON.parse(listData[listID].tweets);
               const filteredTweets = filterTweets(
                  thisListsTweets,
                  props.userSeenIDs,
                  '391'
               );
               return (
                  <li
                     key={listID}
                     onClick={() =>
                        pickList(listID, listData[listID].name, client)
                     }
                     className={
                        listID === activeList ? 'activeList' : 'inactiveList'
                     }
                  >
                     {listData[listID].name}{' '}
                     {listData[listID].user.screen_name == props.userName ? (
                        ''
                     ) : (
                        <span className="listOwner">
                           (@{listData[listID].user.screen_name})
                        </span>
                     )}{' '}
                     <span className="remainingCounters">
                        ({filteredTweets.length})
                     </span>
                  </li>
               );
            });
            // listElements.unshift(
            //    <li key="home" onClick={() => pickList('home', 'home', client)}>
            //       Home
            //    </li>
            // );

            let tweetsDisplay;
            if (activeList === false) {
               let defaultList;
               if (props.startingList != null) {
                  [defaultList] = listIDs.filter(
                     listID =>
                        listData[listID].name.toLowerCase() ===
                        props.startingList.toLowerCase()
                  );
               }
               const [seeAllList] = listIDs.filter(
                  listID => listData[listID].name.toLowerCase() === 'see all'
               );

               if (defaultList) {
                  setTweetsArray(JSON.parse(listData[defaultList].tweets));
                  setActiveList(defaultList);
               } else if (seeAllList) {
                  setTweetsArray(JSON.parse(listData[seeAllList].tweets));
                  setActiveList(seeAllList);
               } else {
                  setTweetsArray(JSON.parse(listData.home.tweets));
                  setActiveList('home');
               }
               tweetsDisplay = <div>Loading tweets...</div>;
            }

            if (activeList !== false) {
               let tweetersRemaining;
               let tweetsRemaining;
               if (tweetsArray[0] === 'Loading tweets...') {
                  tweetsDisplay = <div>Loading tweets...</div>;
               } else {
                  const tweetersArray = [];
                  const seenTweeters = [];

                  const filteredTweets = filterTweets(
                     tweetsArray,
                     props.userSeenIDs
                  );
                  tweetsRemaining = filteredTweets.length;

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
                                 id: tweeter.id_str,
                                 name: tweeter.screen_name,
                                 displayName: tweeter.name,
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
                     tweetersRemaining = tweetersArray.length;

                     const tweetElements = [];
                     for (let i = 0; i < 3 && i < seenTweeters.length; i++) {
                        const thisTweetersTweets = tweetersArray[i].tweets.map(
                           tweet => <Tweet tweet={tweet} key={tweet.id_str} />
                        );

                        const thisTweeter = (
                           <div
                              className={`tweeterColumn column${i}`}
                              key={tweetersArray[i].tweeter.name}
                           >
                              <h3 className="tweeterHeader">
                                 <img
                                    src={tweetersArray[i].tweeter.pic}
                                    className="tweeterAvatar"
                                 />
                                 <div>
                                    <div className="top">
                                       <a
                                          href={`https://twitter.com/${
                                             tweetersArray[i].tweeter.name
                                          }`}
                                          target="_blank"
                                          className="tweeterNameLink"
                                       >
                                          @{tweetersArray[i].tweeter.name}
                                       </a>
                                       ({thisTweetersTweets.length})
                                    </div>
                                    <div className="bottom">
                                       {tweetersArray[i].tweeter.displayName}
                                    </div>
                                 </div>
                                 <img
                                    src="/static/red-x.png"
                                    className="markSeen"
                                    onClick={e =>
                                       notifyOfSeenTweets(
                                          tweetersArray[i].tweeter.id,
                                          tweetersArray[i].tweets,
                                          client,
                                          e.target
                                       )
                                    }
                                 />
                              </h3>
                              <div className="tweetsContainer">
                                 {thisTweetersTweets}
                              </div>
                              <div className="scrollToBottomContainer">
                                 <img
                                    src="/static/grey-up-arrow.png"
                                    className="scrollToBottom"
                                    alt="Scroll to bottom"
                                 />
                              </div>
                           </div>
                        );

                        tweetElements.push(thisTweeter);
                     }

                     tweetsDisplay = (
                        <div className="tweeters">
                           <div className="remainingCounters">
                              {tweetsRemaining} tweets / {tweetersRemaining}{' '}
                              tweeters
                           </div>
                           <div className="tweeterColumnsContainer">
                              {tweetElements}
                           </div>
                        </div>
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
                        <button
                           className="showLists"
                           onClick={() => setPickerCollapsed(!pickerCollapsed)}
                        >
                           <img
                              src="/static/grey-up-arrow.png"
                              alt="Show lists"
                              className={pickerCollapsed ? 'collapsed' : 'full'}
                           />
                        </button>
                     </h5>
                     <ul className={pickerCollapsed ? 'collapsed' : 'full'}>
                        {listElements}
                     </ul>
                  </div>
                  <div className="tweetsArea">{tweetsDisplay}</div>
               </StyledTwitterReader>
            );
         }}
      </Query>
   );
};

export default TwitterReader;
