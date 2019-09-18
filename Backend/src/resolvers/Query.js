const { forwardTo } = require('prisma-binding');
const { getWinnersFromDifferentDays, getFinalists } = require('../utils');

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
                     createdAt_gt: olderWinnerDate,
                     createdAt_lte: newerWinnerDate
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
