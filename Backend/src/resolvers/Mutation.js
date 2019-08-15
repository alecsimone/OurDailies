const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    },
    async signup(parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        console.log(info);
        const password = await bcrypt.hash(args.password, 10);
        const member = await ctx.db.mutation.createMember(
            {
                data: {
                    ...args,
                    password,
                    roles: { set: ['LiteMember'] }
                },
            },
            info
        );
        const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
        });
        return member;
    }
};

module.exports = Mutations;