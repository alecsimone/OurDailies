const { forwardTo } = require('prisma-binding');
const LoginWithTwitter = require('login-with-twitter');
const {
   getWinnersFromDifferentDays,
   getFinalists,
   fullThingFields,
   getLists,
   fetchListTweets,
   fetchHomeTweets
} = require('../utils');

const Query = {
   thing: forwardTo('db'),
   things: forwardTo('db'),
   narratives: forwardTo('db'),
   narrative: forwardTo('db'),
   members: forwardTo('db'),
   member: forwardTo('db'),
   commentsConnection: forwardTo('db'),
   votesConnection: forwardTo('db'),
   thingsConnection: forwardTo('db'),
   me(parent, args, ctx, info) {
      if (!ctx.request.memberId) {
         return null;
      }
      return ctx.db.query.member(
         {
            where: { id: ctx.request.memberId }
         },
         info
      );
   },
   async thingsForGivenDay(parent, { winnerOffset }, ctx, info) {
      const winners = await getWinnersFromDifferentDays(winnerOffset, ctx);

      if (winners.length === 0) {
         return [];
      }

      const newerWinnerDate = new Date(winners[0].winner);
      const olderWinnerDate =
         winners.length === 1 ? new Date(0) : new Date(winners[1].winner);

      // We bump finalist and winner times back 4 hours so they'll be east coast time instead of zulu time, and thus they'll show up on the day we actually had the discussion. Because we declare winners right around midnight zulu time, it's easier to do a day-based thing on east coast time instead. However, createdAt is set by default, so it's on normal Zulu time, so we have to adjust here. Sorry.

      const newerWinnerZuluDate = new Date(
         newerWinnerDate.getTime() + 1000 * 60 * 60 * 4
      );
      const olderWinnerZuluDate = new Date(
         olderWinnerDate.getTime() + 1000 * 60 * 60 * 4
      );

      const thingsForDay = await ctx.db.query.things(
         {
            where: {
               OR: [
                  {
                     finalistDate_gt: olderWinnerDate,
                     finalistDate_lte: newerWinnerDate
                  },
                  {
                     finalistDate: null,
                     createdAt_gt: olderWinnerZuluDate,
                     createdAt_lte: newerWinnerZuluDate
                  }
               ]
            }
         },
         info
      );
      return thingsForDay;
   },
   async thingsForNew(parent, args, ctx, info) {
      const lastTwoDaysOfWinners = await getWinnersFromDifferentDays(0, ctx);
      const twoDaysOfWinnersAgo = new Date(
         lastTwoDaysOfWinners[lastTwoDaysOfWinners.length - 1].winner
      );

      const thingsForNew = await ctx.db.query.things(
         {
            where: {
               createdAt_gte: twoDaysOfWinnersAgo,
               finalistDate: null
            }
         },
         `{${fullThingFields}}`
      );
      return thingsForNew;
   },
   async thingsForFinalists(parent, args, ctx, info) {
      const finalists = await getFinalists(ctx);
      return finalists;
   },
   async finishTwitterLogin(parent, { token, verifier }, ctx, info) {
      console.log("we're finishing the login");

      const tw = new LoginWithTwitter({
         consumerKey: process.env.TWITTER_CONSUMER_KEY,
         consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
         callbackUrl: `${process.env.FRONTEND_URL}/twitter`
      });

      console.log(ctx.request.member.twitterTokenSecret);

      tw.callback(
         {
            oauth_token: token,
            oauth_verifier: verifier
         },
         ctx.request.member.twitterTokenSecret,
         async (err, user) => {
            if (err) {
               console.log('Failure!');
               console.log(err);
            }

            await ctx.db.mutation.updateMember({
               where: { id: ctx.request.memberId },
               data: {
                  twitterUserName: user.userName,
                  twitterUserID: user.userId,
                  twitterUserToken: user.userToken,
                  twitterUserTokenSecret: user.userTokenSecret,
                  twitterTokenSecret: null
               }
            });
         }
      );
      return { message: 'Success!' };
   },
   async getTwitterLists(parent, args, ctx, info) {
      console.log('pulling twitter lists!');
      const {
         twitterUserID,
         twitterUserName,
         twitterUserToken,
         twitterUserTokenSecret
      } = await ctx.db.query.member(
         {
            where: { id: ctx.request.memberId }
         },
         `{twitterUserID,
         twitterUserName,
         twitterUserToken,
         twitterUserTokenSecret}`
      );
      const listData = {
         home: {
            id: 'home',
            name: 'Home',
            user: {
               screen_name: twitterUserName
            },
            tweets: []
         }
      };
      const lists = await getLists(
         twitterUserID,
         twitterUserToken,
         twitterUserTokenSecret
      );
      lists.forEach(listObject => {
         listData[listObject.id_str] = {
            id: listObject.id_str,
            name: listObject.name,
            user: listObject.user,
            tweets: []
         };
      });
      const listIDs = Object.keys(listData);
      await Promise.all(
         listIDs.map(async id => {
            const tweets = await fetchListTweets(id, ctx);
            listData[id].tweets = tweets;
         })
      );
      // listIDs.forEach(id => {
      //    const tweets = fetchListTweets(id, ctx);
      //    listData[id].tweets = JSON.parse(tweets);
      // });
      const listDataString = JSON.stringify(listData);
      return { message: listDataString };
   },
   async getTweetsForList(parent, { listID }, ctx, info) {
      console.log("Let's get some tweets!");
      if (ctx.request.member == null) {
         const dataString = JSON.stringify({ we: 'Loading...' });
         return { dataString };
      }

      const listTweets = await fetchListTweets(listID, ctx);

      const dataString = JSON.stringify({ listTweets });
      return { dataString };
   }
};

module.exports = Query;
