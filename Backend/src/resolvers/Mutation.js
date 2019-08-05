const Mutations = {
    async createSubmission(parent, args, ctx, info) {
        const submission = await ctx.db.mutation.createSubmission({
            data: {...args}
        }, info);

        return submission;
    },
    updateSubmission(parent, args, ctx, info) {
        const updates = { ...args };
        delete updates.id;
        return ctx.db.mutation.updateSubmission({
            data: updates,
            where: {
                id: args.id,
            },
        }, info);
    },
    async deleteSubmission(parent, args, ctx, info) {
        const where = { id: args.id };
        const submission = await ctx.db.query.submission({ where }, `{ id title }`);
        return ctx.db.mutation.deleteSubmission({ where }, info);
    }
};

module.exports = Mutations;