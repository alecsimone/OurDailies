function loggedInGate(context) {
   if (!context.request.memberId) {
      throw new Error('You must be logged in to do that');
   }
}
exports.loggedInGate = loggedInGate;

function modGate(member) {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      )
   ) {
      throw new Error("You don't have permission to do that");
   }
}
exports.modGate = modGate;

function fullMemberGate(member) {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator', 'Member'].includes(role)
      )
   ) {
      throw new Error('Only full members can do that');
   }
}
exports.fullMemberGate = fullMemberGate;

const liveThingID = 'ck0660isb7fnt0b09rh569iu0';
exports.liveThingID = liveThingID;

async function vote(thingID, voter, ctx) {
   const oldVote = await ctx.db.query.votes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               voter: {
                  id: voter.id
               }
            }
         }
      },
      `{id}`
   );
   const oldThing = await getThing(thingID, ctx.db);
   if (oldVote.length > 0) {
      const deletedVote = await ctx.db.mutation.deleteVote(
         {
            where: {
               id: oldVote[0].id
            }
         },
         `{
               voter {
                  id
                  displayName
                  avatar
                  roles
               }
               value,
               id
            }`
      );
      ctx.db.mutation
         .updateThing(
            {
               where: {
                  id: thingID
               },
               data: {
                  score: oldThing.score - voter.rep
               }
            },
            `{id score}`
         )
         .catch(err => console.log(err));
      return { newVote: deletedVote, deletedVote: true };
      // return deletedVote;
   }
   const oldPass = await ctx.db.query.passes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               passer: {
                  id: voter.id
               }
            }
         }
      },
      `{id}`
   );
   if (oldPass.length > 0) {
      const deletedPass = await ctx.db.mutation.deletePass(
         {
            where: {
               id: oldPass[0].id
            }
         },
         `{id}`
      );
   }
   const newVote = await ctx.db.mutation.createVote(
      {
         data: {
            value: voter.rep,
            voter: {
               connect: {
                  id: voter.id
               }
            },
            onThing: {
               connect: {
                  id: thingID
               }
            }
         }
      },
      `{voter {
            id
            displayName
            avatar
            roles
         }
         id
         value}`
   );
   ctx.db.mutation
      .updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               score: oldThing.score + voter.rep
            }
         },
         `{id score}`
      )
      .catch(err => console.log(err));

   return { newVote, deletedVote: false };
   // return newVote;
}
exports.vote = vote;

async function pass(thingID, passer, ctx) {
   const oldPass = await ctx.db.query.passes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               passer: {
                  id: passer.id
               }
            }
         }
      },
      `{id}`
   );
   if (oldPass.length > 0) {
      const deletedPass = await ctx.db.mutation.deletePass(
         {
            where: {
               id: oldPass[0].id
            }
         },
         `{
               passer {
                  id
                  displayName
                  avatar
                  roles
               }
               id
            }`
      );
      return { newPass: deletedPass, deletedPass: true };
   }
   const oldVote = await ctx.db.query.votes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               voter: {
                  id: passer.id
               }
            }
         }
      },
      `{id}`
   );
   if (oldVote.length > 0) {
      const deletedVote = await ctx.db.mutation.deleteVote(
         {
            where: {
               id: oldVote[0].id
            }
         },
         `{id}`
      );
   }
   const newPass = await ctx.db.mutation.createPass(
      {
         data: {
            passer: {
               connect: {
                  id: passer.id
               }
            },
            onThing: {
               connect: {
                  id: thingID
               }
            }
         }
      },
      `{passer {
            id
            displayName
            avatar
            roles
         }
         id
      }`
   );
   return { newPass, deletedPass: false };
}
exports.pass = pass;

async function getWinnersFromDifferentDays(winnerOffset, ctx) {
   const offsetWinners = await ctx.db.query.things(
      {
         where: {
            winner_not: null
         },
         orderBy: 'finalistDate_DESC',
         first: 2,
         skip: winnerOffset
      },
      `{winner}`
   );
   if (offsetWinners.length <= 1) return offsetWinners;

   const newerWinnerDate = new Date(offsetWinners[0].winner);
   let olderWinnerDate = new Date(offsetWinners[1].winner);

   let i = 0;
   while (
      newerWinnerDate.getDate() == olderWinnerDate.getDate() &&
      newerWinnerDate.getMonth() == olderWinnerDate.getMonth() &&
      i < 10
   ) {
      const [evenOlderWinner] = await ctx.db.query.things(
         {
            where: {
               winner_not: null
            },
            orderBy: 'finalistDate_DESC',
            first: 1,
            skip: winnerOffset + 2 + i
         },
         `{winner}`
      );
      olderWinnerDate = new Date(evenOlderWinner.winner);
      offsetWinners[1] = evenOlderWinner;
      i++;
   }
   return offsetWinners;
}
exports.getWinnersFromDifferentDays = getWinnersFromDifferentDays;

async function getFinalists(ctx) {
   const lastWinnerDate = await getLastWinnerDate(ctx);
   const finalists = await ctx.db.query.things(
      {
         where: {
            finalistDate_gt: lastWinnerDate
         }
      },
      `{${fullThingFields}}`
   );
   return finalists;
}
exports.getFinalists = getFinalists;

const requiredThingParts = `id title author{displayName} originalSource summary eliminated createdAt`;
exports.requiredThingParts = requiredThingParts;

const tinyThingFields = `
   __typename
   id
   title
   featuredImage
   originalSource
   votes {
      value
   }
   createdAt
`;
exports.tinyThingFields = tinyThingFields;

const fullThingFields = `
         __typename
         id
         title
         author {
            id
            displayName
         }
         featuredImage
         originalSource
         summary
         includedLinks {
            title
            url
            id
         }
         includedThings {
            ${tinyThingFields}
         }
         partOfNarratives {
            id
            title
         }
         comments {
            id
            author {
               id
               displayName
               avatar
               rep
            }
            comment
            createdAt
            updatedAt
         }
         votes {
            voter {
               id
               displayName
               avatar
               roles
            }
            value
         }
         passes {
            passer {
               id
               displayName
               avatar
               roles
            }
         }
         score
         winner
         finalistDate
         eliminated
         createdAt
         updatedAt
      `;
exports.fullThingFields = fullThingFields;

async function getThing(id, db) {
   const updatedThing = await db.query.thing(
      {
         where: {
            id
         }
      },
      `{${fullThingFields}}`
   );

   return updatedThing;
}
exports.getThing = getThing;

function publishThingUpdate(thing, ctx) {
   ctx.pubsub.publish('thing', {
      thing: {
         node: thing
      }
   });
}
exports.publishThingUpdate = publishThingUpdate;

async function addNarrative(title, thingID, ctx) {
   const narrative = await ctx.db.query.narrative({
      where: { title }
   });
   let narrativeConnectionMethod;
   if (!narrative) {
      narrativeConnectionMethod = 'create';
   } else {
      narrativeConnectionMethod = 'connect';
   }
   const updatedThing = await ctx.db.mutation.updateThing(
      {
         where: { id: thingID },
         data: {
            partOfNarratives: {
               [narrativeConnectionMethod]: {
                  title
               }
            }
         }
      },
      `{${fullThingFields}}`
   );
   return updatedThing;
}
exports.addNarrative = addNarrative;

async function clearLiveVotes(ctx) {
   const deletedVotes = await ctx.db.mutation.deleteManyVotes(
      {
         where: {
            onThing: {
               id: liveThingID
            }
         }
      },
      `{count}`
   );
   const deletedPasses = await ctx.db.mutation.deleteManyPasses(
      {
         where: {
            onThing: {
               id: liveThingID
            }
         }
      },
      `{count}`
   );

   const updatedThing = await ctx.db.mutation.updateThing(
      {
         where: {
            id: liveThingID
         },
         data: {
            score: 0
         }
      },
      `{${fullThingFields}}`
   );

   publishThingUpdate(updatedThing, ctx);
   return deletedVotes.count + deletedPasses.count;
}
exports.clearLiveVotes = clearLiveVotes;

async function getLastWinnerDate(ctx) {
   const [mostRecentWinner] = await ctx.db.query.things(
      {
         where: {
            winner_not: null
         },
         orderBy: 'winner_DESC',
         first: 1
      },
      `{winner}`
   );
   const lastWinnerDate = new Date(mostRecentWinner.winner);
   return lastWinnerDate;
}
exports.getLastWinnerDate = getLastWinnerDate;

const HmacSha1 = require('hmac_sha1');

const percentEncode = string =>
   encodeURIComponent(string).replace(/[!'()*]/g, function(c) {
      return `%${c.charCodeAt(0).toString(16)}`;
   });

const generateNonce = () => {
   let nonce = '';
   const charset =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz';
   for (let i = 0; i < 32; i++) {
      const randomNumber = Math.floor(Math.random() * 32);
      nonce += charset[randomNumber];
   }
   return nonce;
   // const result = [];
   // window.crypto
   //    .getRandomValues(new Uint8Array(32))
   //    .forEach(c => result.push(charset[c % charset.length]));
   // return result.join('');
};

const generateSignature = (
   consumerKey,
   consumerSecret,
   token,
   tokenSecret,
   baseURL,
   parameters,
   timestamp,
   nonce
) => {
   const oauthParameters = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: token,
      oauth_version: '1.0'
   };
   const signatureParameters = Object.assign(oauthParameters, parameters);
   const signatureParameterKeys = Object.keys(signatureParameters);
   signatureParameterKeys.sort();

   let parameterString = '';
   signatureParameterKeys.forEach((key, index) => {
      const encodedKey = percentEncode(key);
      const encodedValue = percentEncode(signatureParameters[key]);
      parameterString += encodedKey;
      parameterString += '=';
      parameterString += encodedValue;
      if (index + 1 < signatureParameterKeys.length) {
         parameterString += '&';
      }
   });

   let signatureBaseString = 'GET&';
   signatureBaseString += percentEncode(baseURL);
   signatureBaseString += '&';
   signatureBaseString += percentEncode(parameterString);

   const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(
      tokenSecret
   )}`;

   const hmacSha1 = new HmacSha1('base64');
   const signature = hmacSha1.digest(signingKey, signatureBaseString);

   return signature;
};

const buildHeaderString = (
   consumerKey,
   consumerSecret,
   token,
   tokenSecret,
   baseURL,
   parameters
) => {
   const nonce = generateNonce();
   const timestamp = Math.floor(Date.now() / 1000);
   const signature = generateSignature(
      consumerKey,
      consumerSecret,
      token,
      tokenSecret,
      baseURL,
      parameters,
      timestamp,
      nonce
   );

   let DST = 'OAuth ';
   DST += percentEncode('oauth_consumer_key');
   DST += `="`;
   DST += percentEncode(consumerKey);
   DST += `", `;

   DST += percentEncode('oauth_nonce');
   DST += `="`;
   DST += percentEncode(nonce);
   DST += `", `;

   DST += percentEncode('oauth_signature');
   DST += `="`;
   DST += percentEncode(signature);
   DST += `", `;

   DST += percentEncode('oauth_signature_method');
   DST += `="`;
   DST += percentEncode('HMAC-SHA1');
   DST += `", `;

   DST += percentEncode('oauth_timestamp');
   DST += `="`;
   DST += percentEncode(timestamp);
   DST += `", `;

   DST += percentEncode('oauth_token');
   DST += `="`;
   DST += percentEncode(token);
   DST += `", `;

   DST += percentEncode('oauth_version');
   DST += `="`;
   DST += percentEncode('1.0');
   DST += `"`;

   return DST;
};

const generateRequestURL = (baseURL, parameters) => {
   let requestURL = baseURL;
   const parameterNames = Object.keys(parameters);
   if (parameterNames.length > 0) {
      requestURL += '?';
      parameterNames.forEach((key, index) => {
         requestURL += key;
         requestURL += '=';
         requestURL += parameters[key];
         if (index + 1 < parameterNames.length) {
            requestURL += '&';
         }
      });
   }
   return requestURL;
};

const getLists = async (userID, token, tokenSecret) => {
   const baseURL = 'https://api.twitter.com/1.1/lists/list.json';
   const parameters = {
      user_id: userID,
      reverse: true
   };
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      token,
      tokenSecret,
      baseURL,
      parameters
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const lists = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });

   const listsJson = await lists.json();
   if (listsJson.errors && listsJson.errors[0].code == 88) {
      throw new Error("You've exceeded the twitter rate limit for lists");
   }
   return listsJson;
};
exports.getLists = getLists;

const fetchListTweets = async (listID, ctx) => {
   const {
      twitterSinceIDsObject: rawSinceIDsObject,
      twitterUserID,
      twitterUserToken,
      twitterUserTokenSecret
   } = await ctx.db.query.member(
      {
         where: { id: ctx.request.memberId }
      },
      `{twitterUserID, twitterSinceIDsObject, twitterUserToken, twitterUserTokenSecret}`
   );

   sinceIDsObject = JSON.parse(rawSinceIDsObject);
   if (listID === 'home') {
      sinceID = sinceIDsObject.home;

      const listTweets = await fetchHomeTweets(
         twitterUserID,
         twitterUserToken,
         twitterUserTokenSecret,
         sinceID
      );

      return listTweets;

      const dataString = JSON.stringify({ listTweets });
      return { dataString };
   }

   if (sinceIDsObject != null) {
      sinceID = sinceIDsObject[listID];
   } else {
      sinceID = null;
   }

   const baseURL = 'https://api.twitter.com/1.1/lists/statuses.json';
   const parameters = {
      list_id: listID,
      count: 200,
      tweet_mode: 'extended'
   };
   if (sinceID != null) {
      parameters.sinceID = sinceID;
   }
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      twitterUserToken,
      twitterUserTokenSecret,
      baseURL,
      parameters
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const tweets = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });
   const tweetsJson = await tweets.json();
   return JSON.stringify(tweetsJson);
   // return 'Here are your tweets, sir!';
};
exports.fetchListTweets = fetchListTweets;

const fetchHomeTweets = async (userID, token, tokenSecret, sinceID) => {
   const baseURL = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
   const parameters = {
      count: 200,
      tweet_mode: 'extended'
   };
   if (sinceID != null) {
      parameters.sinceID = sinceID;
   }
   const headerString = buildHeaderString(
      process.env.TWITTER_CONSUMER_KEY,
      process.env.TWITTER_CONSUMER_SECRET,
      token,
      tokenSecret,
      baseURL,
      parameters
   );

   const requestURL = generateRequestURL(baseURL, parameters);

   const tweets = await fetch(requestURL, {
      method: 'GET',
      headers: {
         Authorization: headerString
      }
   });
   const tweetsJson = await tweets.json();
   return JSON.stringify(tweetsJson);
   // return 'Here are your tweets, sir!';
};
exports.fetchHomeTweets = fetchHomeTweets;
