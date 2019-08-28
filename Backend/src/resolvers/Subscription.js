const { forwardTo } = require('prisma-binding');

const Subscription = {
   thing: { subscribe: forwardTo("db") }
};

module.exports = Subscription;
