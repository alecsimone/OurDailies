const { forwardTo } = require("prisma-binding");

const Query = {
   // async things(parent, args, ctx, info) {
   //     const things = ctx.db.query.things();
   //     return things;
   // }
   submissions: forwardTo("db"),
   submission: forwardTo("db"),
   stories: forwardTo("db"),
   story: forwardTo("db"),
   thing: forwardTo("db"),
   things: forwardTo("db"),
   narratives: forwardTo("db"),
   narrative: forwardTo("db"),
   members: forwardTo("db"),
   member: forwardTo("db"),
   commentsConnection: forwardTo("db"),
   storiesConnection: forwardTo("db"),
   submissionsConnection: forwardTo("db"),
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
      const [mostRecentFinalist] = await ctx.db.query.things(
         {
            orderBy: 'finalistDate_DESC',
            first: 1
         },
         `{finalistDate}`
      );
      const tPos = mostRecentFinalist.finalistDate.indexOf("T");
      const mostRecentFinalistDate = new Date(
         mostRecentFinalist.finalistDate.substring(0, tPos)
      );
      const startingUnixTime = mostRecentFinalistDate.getTime();
      const endingUnixTime = startingUnixTime + 1000 * 60 * 60 * 24;
      const endingDate = new Date(endingUnixTime);
      const mostRecentDayThings = await ctx.db.query.things(
         {
            where: {
               finalistDate_gte: mostRecentFinalistDate,
               finalistDate_lt: endingDate
            }
         },
         info
      );
      return mostRecentDayThings;
   },
   async thingsForGivenDay(parent, { day }, ctx, info) {
      let thingsForDay = [];
      let i = -1;
      const tPos = day.indexOf('T');
      const initialDate = new Date(day.substring(0, tPos));
      while (thingsForDay.length === 0 && i < 30) {
         const startDate = new Date(
            initialDate.getTime() - 1000 * 60 * 60 * 24 * (i + 1)
         );
         const endingDate = new Date(
            initialDate.getTime() - 1000 * 60 * 60 * 24 * i
         );
         thingsForDay = await ctx.db.query.things(
            {
               where: {
                  finalistDate_gte: startDate,
                  finalistDate_lt: endingDate
               }
            },
            info
         );
         i++;
      }
      return thingsForDay;
   }
};

module.exports = Query;
