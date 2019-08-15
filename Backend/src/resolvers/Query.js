const { forwardTo } = require('prisma-binding');

const Query = {
    // async things(parent, args, ctx, info) {
        //     const things = ctx.db.query.things();
        //     return things;
        // }
    submissions: forwardTo('db'),
    submission: forwardTo('db'),
    stories: forwardTo('db'),
    story: forwardTo('db'),
    narratives: forwardTo('db'),
    narrative: forwardTo('db'),
    commentsConnection: forwardTo('db'),
    storiesConnection: forwardTo('db'),
    submissionsConnection: forwardTo('db'),
    me(parent, args, ctx, info) {
        if (!ctx.request.memberId) {
            return null;
        }
        return ctx.db.query.member(
            {
                where: { id: ctx.request.memberId},
            }, 
            info
        );
    },
};

module.exports = Query;