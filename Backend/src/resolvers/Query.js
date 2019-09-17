const { forwardTo } = require('prisma-binding');
const { getFinalists } = require('../utils');

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
   async thingsForMostRecentDay(parent, args, ctx, info) {
      const [mostRecentWinner] = await ctx.db.query.things(
         {
            where: {
               winner: true
            },
            orderBy: 'finalistDate_DESC',
            first: 1
         },
         `{finalistDate}`
      );
      const tPos = mostRecentWinner.finalistDate.indexOf('T');
      const mostRecentWinnerDate = new Date(
         mostRecentWinner.finalistDate.substring(0, tPos)
      );
      const startingUnixTime =
         mostRecentWinnerDate.getTime() + 1000 * 60 * 60 * 4;
      const endingUnixTime = startingUnixTime + 1000 * 60 * 60 * 24;
      const endingDate = new Date(endingUnixTime);
      const mostRecentDayThings = await ctx.db.query.things(
         {
            where: {
               OR: [
                  {
                     finalistDate_gte: mostRecentWinnerDate,
                     finalistDate_lt: endingDate
                  },
                  {
                     finalistDate: null,
                     createdAt_gte: mostRecentWinnerDate,
                     createdAt_lt: endingDate
                  }
               ]
            }
         },
         info
      );
      return mostRecentDayThings;
   },
   async thingsForGivenDay(parent, { winnerOffset }, ctx, info) {
      const offsetWinners = await ctx.db.query.things(
         {
            where: {
               winner: true
            },
            orderBy: 'finalistDate_DESC',
            first: 2,
            skip: winnerOffset
         },
         `{finalistDate}`
      );
      if (offsetWinners.length === 1) return [];

      const thingsForDay = await ctx.db.query.things(
         {
            where: {
               OR: [
                  {
                     finalistDate_gte: offsetWinners[1].finalistDate,
                     finalistDate_lt: offsetWinners[0].finalistDate
                  },
                  {
                     finalistDate: null,
                     createdAt_gte: offsetWinners[1].finalistDate,
                     createdAt_lt: offsetWinners[0].finalistDate
                  }
               ]
            }
         },
         info
      );
      return thingsForDay;
   },
   async thingsForNew(parent, args, ctx, info) {
      const thingsForNew = await ctx.db.query.things(
         {
            where: {
               AND: {
                  votes_none: {
                     voter: {
                        id: ctx.request.memberId
                     }
                  },
                  passes_none: {
                     passer: {
                        id: ctx.request.memberId
                     }
                  },
                  finalistDate: null,
                  eliminated: false
               }
            },
            orderBy: 'createdAt_DESC',
            first: 3
         },
         info
      );
      return thingsForNew;
   },
   async thingsForCurate(parent, args, ctx, info) {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2);
      const thingsForCurate = await ctx.db.query.things(
         {
            where: {
               AND: {
                  createdAt_gte: twoDaysAgo,
                  eliminated: false,
                  finalistDate: null
               }
            }
         },
         info
      );
      return thingsForCurate;
   },
   async thingsForFinalists(parent, args, ctx, info) {
      const finalists = await getFinalists(ctx);
      return finalists;
   }
};

module.exports = Query;
