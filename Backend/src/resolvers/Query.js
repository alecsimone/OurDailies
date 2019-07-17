const Query = {
    async things(parent, args, ctx, info) {
        const things = ctx.db.query.things();
        return things;
    }
};

module.exports = Query;