const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { transport, basicEmailTemplate } = require('../mail');

const Mutations = {
   async createThing(parent, args, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }

      const thing = await ctx.db.mutation.createThing(
         {
            data: {
               ...args,
               author: {
                  connect: {
                     id: ctx.request.memberId
                  }
               },
               votes: {
                  create: {
                     voter: {
                        connect: {
                           id: ctx.request.memberId
                        }
                     },
                     value: ctx.request.member.rep
                  }
               }
            }
         },
         info
      );

      return thing;
   },
   async signup(parent, args, ctx, info) {
      args.email = args.email.toLowerCase();
      const password = await bcrypt.hash(args.password, 10);
      const member = await ctx.db.mutation.createMember(
         {
            data: {
               ...args,
               password,
               roles: { set: ['LiteMember'] }
            }
         },
         info
      );
      const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
      ctx.response.cookie('token', token, {
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24 * 365 * 4
      });
      return member;
   },
   async login(parent, { email, password }, ctx, info) {
      const member = await ctx.db.query.member({ where: { email } });
      if (!member) {
         throw new Error("We don't know anyone with that email address");
      }

      const valid = await bcrypt.compare(password, member.password);
      if (!valid) {
         throw new Error('Wrong Password');
      }

      const token = jwt.sign({ memberId: member.id }, process.env.APP_SECRET);
      ctx.response.cookie('token', token, {
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24 * 365 * 4
      });

      return member;
   },
   logout(parent, args, ctx, info) {
      ctx.response.clearCookie('token');
      return { message: 'Successfully logged out' };
   },
   async requestReset(parent, args, ctx, info) {
      const member = await ctx.db.query.member({
         where: { email: args.email }
      });
      if (!member) {
         throw new Error("We don't know anyone with that email address");
      }

      const resetToken = (await promisify(randomBytes)(20)).toString('hex');
      const resetTokenExpiry = Date.now() + 1000 * 60 * 60;
      const res = await ctx.db.mutation.updateMember({
         where: { email: args.email },
         data: { resetToken, resetTokenExpiry }
      });

      const mailRes = await transport.sendMail({
         from: 'alec@dailies.gg',
         to: member.email,
         subject: 'Reset your password',
         html: basicEmailTemplate(`Someone requested a password reset for the account associated with this email.
            \n\n
            If it was you, choose a new password <a href="${
               process.env.FRONTEND_URL
            }/passwordreset?resetToken=${resetToken}">here</a>`)
      });

      return { message: 'Password reset initiated' };
   },
   async resetPassword(parent, args, ctx, info) {
      if (args.password !== args.confirmPassword) {
         throw new Error('Passwords do not match');
      }

      const [member] = await ctx.db.query.members({
         where: {
            resetToken: args.resetToken,
            resetTokenExpiry_gte: Date.now() - 1000 * 60 * 60
         }
      });
      if (!member) {
         throw new Error('Token either invalid or expired');
      }

      const password = await bcrypt.hash(args.password, 10);

      const updatedMember = await ctx.db.mutation.updateMember({
         where: { email: member.email },
         data: {
            password,
            resetToken: null,
            resetTokenExpiry: null
         }
      });

      const token = jwt.sign(
         { memberId: updatedMember.id },
         process.env.APP_SECRET
      );
      ctx.response.cookie('token', token, {
         httpOnly: true,
         maxAge: 1000 * 60 * 60 * 24 * 365 * 4
      });

      return updatedMember;
   },
   async addNarrativeToThing(parent, { title, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      const narrative = await ctx.db.query.narrative({
         where: { title }
      });
      let narrativeConnectionMethod;
      if (!narrative) {
         narrativeConnectionMethod = "create";
      } else {
         narrativeConnectionMethod = "connect";
      }
      const updatedThing = await ctx.db.mutation.updateThing({
         where: { id: thingID },
         data: {
            partOfNarratives: {
               [narrativeConnectionMethod]: {
                  title
               }
            }
         }
      });
      return updatedThing;
   },
   async addLinkToThing(parent, { title, url, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      const thingUrlStructure = `${process.env.FRONTEND_URL}/thing?id=`;
      const thingUrlStructureNoHTTP = thingUrlStructure.substring(
         thingUrlStructure.indexOf('://') + 3
      );

      console.log(thingUrlStructureNoHTTP);

      if (
         url.includes(thingUrlStructure) ||
         url.includes(thingUrlStructureNoHTTP)
      ) {
         let thingToLinkID;
         const startPos = url.indexOf('/thing?id=') + 10;
         if (url.includes('&')) {
            thingToLinkID = url.substring(startPos, url.indexOf("&"));
         } else {
            thingToLinkID = url.substring(startPos);
         }

         const updatedThing = await ctx.db.mutation.updateThing({
            where: { id: thingID },
            data: {
               includedThings: {
                  connect: {
                     id: thingToLinkID
                  }
               }
            }
         });
         return updatedThing;
      }
      const updatedThing = await ctx.db.mutation.updateThing({
         where: { id: thingID },
         data: {
            includedLinks: {
               create: {
                  title,
                  url
               }
            }
         }
      });
      return updatedThing;
   },
   async addSummaryLineToThing(parent, { summaryLine, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }
      const currentSummary = await ctx.db.query.thing(
         {
            where: {
               id: thingID
            }
         },
         `{summary}`
      );
      currentSummary.summary.push(summaryLine);

      const newThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               summary: {
                  set: currentSummary.summary
               }
            }
         },
         info
      );

      return newThing;
   },
   async removeSummaryLineFromThing(
      parent,
      { summaryLine, thingID },
      ctx,
      info
   ) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }
      const currentSummary = await ctx.db.query.thing(
         {
            where: {
               id: thingID
            }
         },
         `{summary}`
      );

      const newSummary = currentSummary.summary.filter(
         line => line !== summaryLine
      );

      const newThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               summary: {
                  set: newSummary
               }
            }
         },
         info
      );

      return newThing;
   },
   async setFeaturedImage(parent, { imageUrl, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }

      const newThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               featuredImage: imageUrl
            }
         },
         info
      );
      return newThing;
   },
   async changeThingTitle(parent, { title, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }

      const newThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               title
            }
         },
         info
      );
      return newThing;
   },
   async addCommentToThing(parent, { comment, thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }

      const addedComment = await ctx.db.mutation.createComment({
         data: {
            comment,
            onThing: {
               connect: {
                  id: thingID
               }
            },
            author: {
               connect: {
                  id: ctx.request.memberId
               }
            }
         }
      });

      return addedComment;
   },
   async deleteComment(parent, { id }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      const comment = await ctx.db.query.comment(
         { where: { id } },
         `{id author {id}}`
      );

      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         ) &&
         comment.author.id !== ctx.request.memberId
      ) {
         throw new Error("You don't have permission to do that");
      }
      const deletedComment = await ctx.db.mutation.deleteComment({
         where: {
            id
         }
      });
      return deletedComment;
   },
   async voteOnThing(parent, { thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error("You must be logged in to do that");
      }
      const oldVote = await ctx.db.query.votes(
         {
            where: {
               AND: {
                  onThing: {
                     id: thingID
                  },
                  voter: {
                     id: ctx.request.memberId
                  }
               }
            }
         },
         `{id}`
      );
      if (oldVote.length > 0) {
         const deletedVote = await ctx.db.mutation.deleteVote(
            {
               where: {
                  id: oldVote[0].id
               }
            },
            `{
               voter {
                  id
                  displayName
                  avatar
                  roles
               }
               value
            }`
         );
         return deletedVote;
      }
      const newVote = await ctx.db.mutation.createVote(
         {
            data: {
               value: ctx.request.member.rep,
               voter: {
                  connect: {
                     id: ctx.request.memberId
                  }
               },
               onThing: {
                  connect: {
                     id: thingID
                  }
               }
            }
         },
         `{voter {
            id
            displayName
            avatar
            roles
         }
         value}`
      );
      return newVote;
   },
   async passOnThing(parent, { thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error("You must be logged in to do that");
      }
      const oldPass = await ctx.db.query.passes(
         {
            where: {
               AND: {
                  onThing: {
                     id: thingID
                  },
                  passer: {
                     id: ctx.request.memberId
                  }
               }
            }
         },
         `{id}`
      );
      if (oldPass.length > 0) {
         const deletedPass = await ctx.db.mutation.deletePass(
            {
               where: {
                  id: oldPass[0].id
               }
            },
            `{
               passer {
                  id
                  displayName
                  avatar
                  roles
               }
            }`
         );
         return deletedPass;
      }
      const newPass = await ctx.db.mutation.createPass(
         {
            data: {
               passer: {
                  connect: {
                     id: ctx.request.memberId
                  }
               },
               onThing: {
                  connect: {
                     id: thingID
                  }
               }
            }
         },
         `{passer {
            id
            displayName
            avatar
            roles
         }}`
      );
      return newPass;
   },
   eliminateThing(parent, { thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }

      const updatedThing = ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               eliminated: true
            }
         },
         info
      );

      return updatedThing;
   },
   promoteThing(parent, { thingID }, ctx, info) {
      if (!ctx.request.memberId) {
         throw new Error('You must be logged in to do that');
      }
      if (
         !ctx.request.member.roles.some(role =>
            ["Admin", "Editor", "Moderator"].includes(role)
         )
      ) {
         throw new Error("You don't have permission to do that");
      }

      // Set now back in time 4 hours so that the finalistDate will have the day it was on east coast time, not zulu time
      const now = new Date(Date.now() - 1000 * 60 * 60 * 4);
      const promotedThing = ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               finalistDate: now
            }
         },
         info
      );
      return promotedThing;
   }
};

module.exports = Mutations;
