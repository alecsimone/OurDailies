const { forwardTo } = require('prisma-binding');
const { PubSub } = require('graphql-yoga');

const Subscription = {
   thing: {
      subscribe: async (parent, args, ctx, info) =>
         ctx.pubsub.asyncIterator('thing')
   }
};

module.exports = Subscription;
