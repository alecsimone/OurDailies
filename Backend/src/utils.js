function loggedInGate(context) {
   if (!context.request.memberId) {
      throw new Error('You must be logged in to do that');
   }
}
exports.loggedInGate = loggedInGate;

function modGate(member) {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator'].includes(role)
      )
   ) {
      throw new Error("You don't have permission to do that");
   }
}
exports.modGate = modGate;

function fullMemberGate(member) {
   if (
      !member.roles.some(role =>
         ['Admin', 'Editor', 'Moderator', 'Member'].includes(role)
      )
   ) {
      throw new Error('Only full members can do that');
   }
}
exports.fullMemberGate = fullMemberGate;

const liveThingID = 'ck0660isb7fnt0b09rh569iu0';
exports.liveThingID = liveThingID;

async function vote(thingID, voter, ctx) {
   const oldVote = await ctx.db.query.votes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               voter: {
                  id: voter.id
               }
            }
         }
      },
      `{id}`
   );
   const oldThing = await getThing(thingID, ctx.db);
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
               value,
               id
            }`
      );
      ctx.db.mutation
         .updateThing(
            {
               where: {
                  id: thingID
               },
               data: {
                  score: oldThing.score - voter.rep
               }
            },
            `{id score}`
         )
         .catch(err => console.log(err));
      return { newVote: deletedVote, deletedVote: true };
      // return deletedVote;
   }
   const oldPass = await ctx.db.query.passes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               passer: {
                  id: voter.id
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
         `{id}`
      );
   }
   const newVote = await ctx.db.mutation.createVote(
      {
         data: {
            value: voter.rep,
            voter: {
               connect: {
                  id: voter.id
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
         id
         value}`
   );
   ctx.db.mutation
      .updateThing(
         {
            where: {
               id: thingID
            },
            data: {
               score: oldThing.score + voter.rep
            }
         },
         `{id score}`
      )
      .catch(err => console.log(err));

   return { newVote, deletedVote: false };
   // return newVote;
}
exports.vote = vote;

async function pass(thingID, passer, ctx) {
   const oldPass = await ctx.db.query.passes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               passer: {
                  id: passer.id
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
               id
            }`
      );
      return { newPass: deletedPass, deletedPass: true };
   }
   const oldVote = await ctx.db.query.votes(
      {
         where: {
            AND: {
               onThing: {
                  id: thingID
               },
               voter: {
                  id: passer.id
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
         `{id}`
      );
   }
   const newPass = await ctx.db.mutation.createPass(
      {
         data: {
            passer: {
               connect: {
                  id: passer.id
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
         }
         id
      }`
   );
   return { newPass, deletedPass: false };
}
exports.pass = pass;

async function getFinalists(ctx) {
   const now = new Date();
   const yesterday = new Date(now.getTime() - 1000 * 60 * 60 * 24);
   const finalists = await ctx.db.query.things(
      {
         where: {
            AND: {
               finalistDate_gte: yesterday.toISOString()
            }
         }
      },
      `{id
         title
         author {
         displayName
      }
         featuredImage
         originalSource
         summary
         includedLinks {
         title
            url
            id
      }
         includedThings {
         id
            title
            originalSource
            author {
         displayName
      }
            createdAt
         }
      partOfNarratives {
         id
         title
      }
      comments {
         id
         author {
            id
            displayName
            avatar
            rep
         }
         comment
         createdAt
         updatedAt
      }
      votes {
         voter {
            id
            displayName
            avatar
            roles
         }
         value
      }
      passes {
         passer {
            id
            displayName
            avatar
            roles
         }
      }
      finalistDate
      eliminated
      createdAt
      updatedAt}`
   );
   return finalists;
}
exports.getFinalists = getFinalists;

const requiredThingParts = `id title author{displayName} originalSource summary eliminated createdAt`;
exports.requiredThingParts = requiredThingParts;

const tinyThingFields = `
   __typename
   id
   title
   featuredImage
   originalSource
   votes {
      value
   }
   createdAt
`;
exports.tinyThingFields = tinyThingFields;

const fullThingFields = `
         __typename
         id
         title
         author {
            displayName
         }
         featuredImage
         originalSource
         summary
         includedLinks {
            title
            url
            id
         }
         includedThings {
            ${tinyThingFields}
         }
         partOfNarratives {
            id
            title
         }
         comments {
            id
            author {
               id
               displayName
               avatar
               rep
            }
            comment
            createdAt
            updatedAt
         }
         votes {
            voter {
               id
               displayName
               avatar
               roles
            }
            value
         }
         passes {
            passer {
               id
               displayName
               avatar
               roles
            }
         }
         score
         winner
         finalistDate
         eliminated
         createdAt
         updatedAt
      `;
exports.fullThingFields = fullThingFields;

async function getThing(id, db) {
   const updatedThing = await db.query.thing(
      {
         where: {
            id
         }
      },
      `{${fullThingFields}}`
   );

   return updatedThing;
}
exports.getThing = getThing;

function publishThingUpdate(thing, ctx) {
   ctx.pubsub.publish('thing', {
      thing: {
         node: thing
      }
   });
}
exports.publishThingUpdate = publishThingUpdate;

async function addNarrative(title, thingID, ctx) {
   const narrative = await ctx.db.query.narrative({
      where: { title }
   });
   let narrativeConnectionMethod;
   if (!narrative) {
      narrativeConnectionMethod = 'create';
   } else {
      narrativeConnectionMethod = 'connect';
   }
   const updatedThing = await ctx.db.mutation.updateThing(
      {
         where: { id: thingID },
         data: {
            partOfNarratives: {
               [narrativeConnectionMethod]: {
                  title
               }
            }
         }
      },
      `{${fullThingFields}}`
   );
   return updatedThing;
}
exports.addNarrative = addNarrative;
