const { forwardTo } = require('prisma-binding');
const {
   getWinnersFromDifferentDays,
   getFinalists,
   fullThingFields
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
   }
};

module.exports = Query;
