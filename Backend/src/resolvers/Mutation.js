const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { transport, basicEmailTemplate } = require('../mail');
const LoginWithTwitter = require('login-with-twitter');
const {
   loggedInGate,
   modGate,
   fullMemberGate,
   liveThingID,
   vote,
   pass,
   getFinalists,
   fullThingFields,
   getThing,
   publishThingUpdate,
   addNarrative,
   clearLiveVotes
} = require('../utils');

const Mutations = {
   async createThing(parent, args, ctx, info) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (args.summary.set[0] == '') {
         if (ctx.request.member.rep < 10) {
            throw new Error(
               'Members with less than 10 rep must give a summary when submitting things'
            );
         } else {
            delete args.summary;
         }
      }

      const link = args.originalSource;
      const lowerCasedLink = link.toLowerCase();
      let featuredImage = null;
      let includedLinks = [];
      if (
         lowerCasedLink.includes('jpg') ||
         lowerCasedLink.includes('jpeg') ||
         lowerCasedLink.includes('png') ||
         lowerCasedLink.includes('gif')
      ) {
         featuredImage = link;
      } else if (
         lowerCasedLink.includes('youtube.com/watch?v=') ||
         lowerCasedLink.includes('youtu.be/') ||
         lowerCasedLink.includes('gfycat.com/')
      ) {
         featuredImage = '/static/defaultPic.jpg';
         includedLinks = {
            create: {
               title: args.title,
               url: link
            }
         };
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
               },
               score: ctx.request.member.rep,
               featuredImage,
               includedLinks
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
         maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
         domain: process.env.DOMAIN
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
         maxAge: 1000 * 60 * 60 * 24 * 365 * 4,
         domain: process.env.DOMAIN
      });

      return member;
   },
   logout(parent, args, ctx, info) {
      ctx.response.clearCookie('token', { domain: process.env.DOMAIN });
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
      // loggedInGate(ctx);
      // fullMemberGate(ctx.request.member);

      if (title.indexOf(',') > -1) {
         const titlesArray = title.split(',');
         titlesArray.forEach(async title => {
            await addNarrative(title.trim(), thingID, ctx);
         });
      } else {
         await addNarrative(title, thingID, ctx);
      }

      const updatedThing = await getThing(thingID, ctx.db);
      publishThingUpdate(updatedThing, ctx);

      return updatedThing;
   },
   async addLinkToThing(
      parent,
      { title, url, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (isNarrative) {
         const updatedNarrative = await ctx.db.mutation.updateNarrative(
            {
               where: { id: thingID },
               data: {
                  includedLinks: {
                     create: {
                        title,
                        url
                     }
                  }
               }
            },
            `{id createdAt score}`
         );

         // We need a new subscription for narratives
         // publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }

      const thingUrlStructure = `${process.env.FRONTEND_URL}/thing?id=`;
      const thingUrlStructureNoHTTP = thingUrlStructure.substring(
         thingUrlStructure.indexOf('://') + 3
      );

      if (
         url.includes(thingUrlStructure) ||
         url.includes(thingUrlStructureNoHTTP)
      ) {
         let thingToLinkID;
         const startPos = url.indexOf('/thing?id=') + 10;
         if (url.includes('&')) {
            thingToLinkID = url.substring(startPos, url.indexOf('&'));
         } else {
            thingToLinkID = url.substring(startPos);
         }

         const updatedThing = await ctx.db.mutation.updateThing(
            {
               where: { id: thingID },
               data: {
                  includedThings: {
                     connect: {
                        id: thingToLinkID
                     }
                  }
               }
            },
            `{${fullThingFields}}`
         );

         publishThingUpdate(updatedThing, ctx);
         return { message: 'Success!' };
      }
      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               includedLinks: {
                  create: {
                     title,
                     url
                  }
               }
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);
      return { message: 'Success!' };
   },
   async addSummaryLineToThing(
      parent,
      { summaryLine, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (isNarrative) {
         modGate(ctx.request.member);
         const currentSummary = await ctx.db.query.narrative(
            {
               where: {
                  id: thingID
               }
            },
            `{summary}`
         );
         currentSummary.summary.push(summaryLine);

         const updatedNarrative = await ctx.db.mutation.updateNarrative(
            {
               where: { id: thingID },
               data: {
                  summary: {
                     set: currentSummary.summary
                  }
               }
            },
            `{id title score}`
         );

         // We need a narrative subscription
         // publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }

      const currentSummary = await ctx.db.query.thing(
         {
            where: {
               id: thingID
            }
         },
         `{summary author {id}}`
      );

      if (
         currentSummary.author.id !== ctx.request.memberId ||
         !ctx.request.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         )
      ) {
         throw new Error(
            "You can't edit the summaries of things you didn't create"
         );
      }

      currentSummary.summary.push(summaryLine);

      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               summary: {
                  set: currentSummary.summary
               }
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);

      return { message: 'Success!' };
   },
   async removeSummaryLineFromThing(
      parent,
      { summaryLine, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (isNarrative) {
         modGate(ctx.request.member);
         const currentSummary = await ctx.db.query.narrative(
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

         const updatedNarrative = await ctx.db.mutation.updateNarrative(
            {
               where: { id: thingID },
               data: {
                  summary: {
                     set: newSummary
                  }
               }
            },
            `{id title score}`
         );

         // We need a narrative subscription
         // publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }

      const currentSummary = await ctx.db.query.thing(
         {
            where: {
               id: thingID
            }
         },
         `{summary author {id}}`
      );

      if (
         currentSummary.author.id !== ctx.request.memberId ||
         !ctx.request.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         )
      ) {
         throw new Error(
            "You can't edit the summaries of things you didn't create"
         );
      }

      const newSummary = currentSummary.summary.filter(
         line => line !== summaryLine
      );

      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               summary: {
                  set: newSummary
               }
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);

      return updatedThing;
   },
   async editSummaryLineOnThing(
      parent,
      { editedIndex, newSummaryLine, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (isNarrative) {
         modGate(ctx.request.member);
         const currentSummary = await ctx.db.query.narrative(
            {
               where: {
                  id: thingID
               }
            },
            `{summary}`
         );
         const newSummary = currentSummary.summary;
         newSummary[editedIndex] = newSummaryLine;

         const updatedNarrative = await ctx.db.mutation.updateNarrative(
            {
               where: { id: thingID },
               data: {
                  summary: {
                     set: newSummary
                  }
               }
            },
            `{id title score}`
         );

         // We need a narrative subscription
         // publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }

      const currentSummary = await ctx.db.query.thing(
         {
            where: {
               id: thingID
            }
         },
         `{summary author {id}}`
      );

      if (
         currentSummary.author.id !== ctx.request.memberId ||
         !ctx.request.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         )
      ) {
         throw new Error(
            "You can't edit the summaries of things you didn't create"
         );
      }

      const newSummary = currentSummary.summary;
      newSummary[editedIndex] = newSummaryLine;

      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: { id: thingID },
            data: {
               summary: {
                  set: newSummary
               }
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);

      return updatedThing;
   },
   async setFeaturedImage(
      parent,
      { imageUrl, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      modGate(ctx.request.member);

      if (!isNarrative) {
         const updatedThing = await ctx.db.mutation.updateThing(
            {
               where: {
                  id: thingID
               },
               data: {
                  featuredImage: imageUrl
               }
            },
            `{${fullThingFields}}`
         );

         publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }
      const updatedNarrative = await ctx.db.mutation.updateNarrative(
         {
            where: {
               id: thingID
            },
            data: {
               featuredImage: imageUrl
            }
         },
         `{id title createdAt}`
      );

      // We need a narrative subscription
      // publishThingUpdate(updatedThing, ctx);

      return { message: 'Success!' };
   },
   async changeThingTitle(parent, { title, thingID, isNarrative }, ctx, info) {
      loggedInGate(ctx);
      modGate(ctx.request.member);

      if (!isNarrative) {
         const updatedThing = await ctx.db.mutation.updateThing(
            {
               where: {
                  id: thingID
               },
               data: {
                  title
               }
            },
            `{${fullThingFields}}`
         );
         publishThingUpdate(updatedThing, ctx);

         return { message: 'Success!' };
      }
      const updatedNarrative = await ctx.db.mutation.updateNarrative(
         {
            where: {
               id: thingID
            },
            data: {
               title
            }
         },
         `{id title createdAt}`
      );
      // We need a narrative subscription
      // publishThingUpdate(updatedThing, ctx);

      return { message: 'Success!' };
   },
   async addCommentToThing(
      parent,
      { comment, thingID, isNarrative },
      ctx,
      info
   ) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      if (isNarrative) {
         const addedComment = await ctx.db.mutation.createComment({
            data: {
               comment,
               onNarrative: {
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

         // We need a new subscription for narratives
         // const updatedThing = await getThing(thingID, ctx.db);
         // publishThingUpdate(updatedThing, ctx);

         return addedComment;
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

      const updatedThing = await getThing(thingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return addedComment;
   },
   async deleteComment(parent, { id }, ctx, info) {
      loggedInGate(ctx);

      const comment = await ctx.db.query.comment(
         { where: { id } },
         `{id author {id} onThing {id} onNarrative {id}}`
      );

      const thingID = comment.onThing
         ? comment.onThing.id
         : comment.onNarrative.id;

      if (
         !ctx.request.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
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

      if (comment.onNarrative) {
         // We need a new subscription for Narratives

         return deletedComment;
      }

      const updatedThing = await getThing(thingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return deletedComment;
   },
   async editComment(parent, { id, newComment }, ctx, info) {
      loggedInGate(ctx);

      const comment = await ctx.db.query.comment(
         { where: { id } },
         `{id author {id} onThing {id} onNarrative {id}}`
      );

      const thingID = comment.onThing
         ? comment.onThing.id
         : comment.onNarrative.id;

      if (
         !ctx.request.member.roles.some(role =>
            ['Admin', 'Editor', 'Moderator'].includes(role)
         ) &&
         comment.author.id !== ctx.request.memberId
      ) {
         throw new Error("You don't have permission to do that");
      }

      const editedComment = await ctx.db.mutation.updateComment({
         where: {
            id
         },
         data: {
            comment: newComment
         }
      });

      const updatedThing = await getThing(thingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return editedComment;
   },
   async voteOnThing(parent, { thingID }, ctx, info) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      const newVote = await vote(thingID, ctx.request.member, ctx);

      const updatedThing = await getThing(thingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return newVote.newVote;
   },
   async liveChatVote(parent, { voter }, ctx, info) {
      // if (!ctx.request.memberId) {
      //    throw new Error("You must be logged in to do that");
      // }
      const member = await ctx.db.query.member(
         {
            where: {
               id: voter
            }
         },
         `{id, rep}`
      );

      const newVote = await vote(liveThingID, member, ctx);

      const updatedThing = await getThing(liveThingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return newVote.newVote;
   },
   async passOnThing(parent, { thingID }, ctx, info) {
      loggedInGate(ctx);
      fullMemberGate(ctx.request.member);

      const newPass = await pass(thingID, ctx.request.member, ctx);

      const updatedThing = await getThing(thingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return newPass.newPass;
   },
   async liveChatPass(parent, { voter }, ctx, info) {
      // if (!ctx.request.memberId) {
      //    throw new Error("You must be logged in to do that");
      // }

      const member = { id: voter };

      const newPass = await pass(liveThingID, member, ctx);

      const updatedThing = await getThing(liveThingID, ctx.db);

      publishThingUpdate(updatedThing, ctx);

      return newPass.newPass;
   },
   async contenderVote(parent, { voteNumber, direction, voter }, ctx, info) {
      const finalists = await getFinalists(ctx);
      const thingIndex = voteNumber - 1;
      if (thingIndex > finalists.length) {
         throw new Error('You have picked an invalid play number');
      }
      const member = await ctx.db.query.member(
         {
            where: {
               id: voter
            }
         },
         `{id, rep}`
      );
      let message;
      if (direction === 'yea') {
         const newVote = await vote(finalists[thingIndex].id, member, ctx);
         message = `${newVote.deletedVote ? 'un' : ''}voted on ${
            finalists[thingIndex].title
         }`;
      }
      if (direction === 'nay') {
         const newPass = await pass(finalists[thingIndex].id, member, ctx);
         message = `${newPass.deletedPass ? 'un' : ''}passed on ${
            finalists[thingIndex].title
         }`;
      }

      const updatedThing = await getThing(finalists[thingIndex].id, ctx.db);
      publishThingUpdate(updatedThing, ctx);

      return { message };
   },
   async resetLiveThing(parent, args, ctx, info) {
      const deletedVoteCount = clearLiveVotes(ctx);

      return deletedVoteCount;
   },
   async eliminateThing(parent, { thingID }, ctx, info) {
      loggedInGate(ctx);
      modGate(ctx.request.member);

      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               eliminated: true
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);
      clearLiveVotes(ctx);

      return updatedThing;
   },
   async promoteThing(parent, { thingID }, ctx, info) {
      loggedInGate(ctx);
      modGate(ctx.request.member);

      // Set now back in time 4 hours so that the finalistDate will have the day it was on east coast time, not zulu time
      const now = new Date(Date.now() - 1000 * 60 * 60 * 4);
      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               finalistDate: now
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);
      clearLiveVotes(ctx);

      return updatedThing;
   },
   async makeThingWinner(parent, { thingID }, ctx, info) {
      loggedInGate(ctx);
      modGate(ctx.request.member);

      // Set now back in time 4 hours so that the winner will have the day it was on east coast time, not zulu time
      const now = new Date(Date.now() - 1000 * 60 * 60 * 4);
      const updatedThing = await ctx.db.mutation.updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               winner: now
            }
         },
         `{${fullThingFields}}`
      );

      publishThingUpdate(updatedThing, ctx);

      return updatedThing;
   },
   async initiateTwitterLogin(parent, args, ctx, info) {
      let message = false;
      const tw = new LoginWithTwitter({
         consumerKey: process.env.TWITTER_CONSUMER_KEY,
         consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
         callbackUrl: `${process.env.FRONTEND_URL}/twitter`
      });
      tw.login(async (err, tokenSecret, url) => {
         if (err) {
            console.log('failure!');
            console.log(err);
         }
         await ctx.db.mutation.updateMember({
            where: { id: ctx.request.memberId },
            data: { twitterTokenSecret: tokenSecret }
         });
         message = url;
         console.log(message);
      });
      const wait = ms => new Promise((r, j) => setTimeout(r, ms));
      let i = 0;
      while (!message && i < 60) {
         await wait(500);
         i++;
      }
      return { message };
   },
   async markTweetsSeen(parent, { listID, tweetIDs }, ctx, info) {
      const {
         twitterSinceIDsObject,
         twitterSeenIDsObject
      } = await ctx.db.query.member(
         {
            where: { id: ctx.request.memberId }
         },
         `{twitterSinceIDsObject, twitterSeenIDsObject}`
      );
      let sinceIDsObject;
      if (twitterSinceIDsObject == null) {
         sinceIDsObject = {};
      } else {
         sinceIDsObject = JSON.parse(twitterSinceIDsObject);
      }
      let seenIDsObject;
      if (twitterSeenIDsObject == null) {
         seenIDsObject = {};
      } else {
         seenIDsObject = JSON.parse(twitterSeenIDsObject);
      }

      sinceIDsObject[listID] = tweetIDs[0];

      if (seenIDsObject[listID] == null) seenIDsObject[listID] = [];
      tweetIDs.forEach(tweetID => seenIDsObject[listID].push(tweetID));

      const updatedMember = await ctx.db.mutation.updateMember(
         {
            where: { id: ctx.request.memberId },
            data: {
               twitterSinceIDsObject: JSON.stringify(sinceIDsObject),
               twitterSeenIDsObject: JSON.stringify(seenIDsObject)
            }
         },
         `{id
         twitterSinceIDsObject
         twitterSeenIDsObject}`
      );

      return updatedMember;
   }
};

module.exports = Mutations;
