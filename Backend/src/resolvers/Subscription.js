const { forwardTo } = require('prisma-binding');
const { PubSub } = require('graphql-yoga');
const { withFilter } = require('graphql-subscriptions');

const Subscription = {
   thing: {
      subscribe: withFilter(
         (parent, { IDs }, ctx, info) => ctx.pubsub.asyncIterator('thing'),
         (payload, variables) => variables.IDs.includes(payload.thing.node.id)
      )
      // subscribe: async (parent, { IDs }, ctx, info) => {
      //    const channels = IDs.map(id => `thing-${id}`);
      //    return ctx.pubsub.asyncIterator('thing');
      // }
   }
};

module.exports = Subscription;
