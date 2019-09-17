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

      const newerWinnerDate = new Date(offsetWinners[0].finalistDate);
      const newestUnixTime = newerWinnerDate.getTime() + 1000 * 60 * 60 * 4;

      const olderWinnerDate = new Date(offsetWinners[1].finalistDate);
      let oldestUnixTime = olderWinnerDate.getTime() + 1000 * 60 * 60 * 4;

      if (newestUnixTime - oldestUnixTime < 1000 * 60 * 60 * 4) {
         const [evenOlderWinner] = await ctx.db.query.things(
            {
               where: {
                  winner: true
               },
               orderBy: 'finalistDate_DESC',
               first: 1,
               skip: winnerOffset + 2
            },
            `{finalistDate}`
         );
         const evenOlderWinnerDate = new Date(evenOlderWinner.finalistDate);
         oldestUnixTime = evenOlderWinnerDate.getTime() + 1000 * 60 * 60 * 4;
      }

      const newestDate = new Date(newestUnixTime);
      const oldestDate = new Date(oldestUnixTime);

      const thingsForDay = await ctx.db.query.things(
         {
            where: {
               OR: [
                  {
                     finalistDate_gte: oldestDate,
                     finalistDate_lt: newestDate
                  },
                  {
                     finalistDate: null,
                     createdAt_gte: oldestDate,
                     createdAt_lt: newestDate
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
