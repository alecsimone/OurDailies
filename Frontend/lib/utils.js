const convertISOtoAgo = function(isoTime) {
   const seconds = Math.floor((new Date() - new Date(isoTime)) / 1000);

   let interval = Math.floor(seconds / (60 * 60 * 24 * 365));

   if (interval >= 1) {
      return `${interval} YEAR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 30));
   if (interval >= 1) {
      return `${interval} MONTH${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24 * 7));
   if (interval >= 1) {
      return `${interval} WEEK${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60 * 24));
   if (interval >= 1) {
      return `${interval} DAY${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / (60 * 60));
   if (interval >= 1) {
      return `${interval} HOUR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 60);
   if (interval >= 1) {
      return `${interval} MINUTE${interval === 1 ? '' : 'S'}`;
   }
   return `${Math.floor(seconds)} SECOND${seconds === 1 ? '' : 'S'}`;
};

export { convertISOtoAgo };

const extractHostname = function(url) {
   let hostname;
   // find & remove protocol (http, ftp, etc.) and get hostname

   if (url.indexOf('//') > -1) {
      hostname = url.split('/')[2];
   } else {
      hostname = url.split('/')[0];
   }

   // find & remove port number
   hostname = hostname.split(':')[0];
   // find & remove "?"
   hostname = hostname.split('?')[0];

   return hostname;
};

export { extractHostname };

const getYoutubeVideoIdFromLink = function(url) {
   const lowerCaseUrl = url.toLowerCase();
   if (lowerCaseUrl.includes('youtube.com/watch?v=')) {
      const idStartPos = url.indexOf('youtube.com/watch?v=') + 20;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   if (lowerCaseUrl.includes('youtu.be')) {
      const idStartPos = url.indexOf('youtu.be/') + 9;
      if (url.includes('&')) {
         const idEndPos = url.indexOf('&');
         return url.substring(idStartPos, idEndPos);
      }
      return url.substring(idStartPos);
   }
   return false;
};

export { getYoutubeVideoIdFromLink };

const getGfycatSlugFromLink = function(url) {
   let gfyCode;
   if (url.indexOf('/detail/') > -1) {
      const gfyCodePosition = url.indexOf('/detail/') + 8;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   } else {
      const gfyCodePosition = url.indexOf('gfycat.com/') + 11;
      if (url.indexOf('?') > -1) {
         const gfyCodeEndPosition = url.indexOf('?');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('.mp4') > -1) {
         const gfyCodeEndPosition = url.indexOf('.mp4');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else if (url.indexOf('-') > -1) {
         const gfyCodeEndPosition = url.indexOf('-');
         gfyCode = url.substring(gfyCodePosition, gfyCodeEndPosition);
      } else {
         gfyCode = url.substring(gfyCodePosition);
      }
   }
   return gfyCode;
};

export { getGfycatSlugFromLink };

const getScoreForThing = function(thingObject) {
   const score = thingObject.votes.reduce(
      (thingScore, voteObject) => thingScore + voteObject.value,
      0
   );
   return score;
};
export { getScoreForThing };

const urlFinder = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
export { urlFinder };

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
export { tinyThingFields };

const littleThingFields = `
   __typename
   id
   title
   featuredImage
   partOfNarratives {
      id
      title
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
   eliminated
   finalistDate
   createdAt
   updatedAt
`;
export { littleThingFields };

const fullThingFields = `
   __typename
   id
   title
   author {
      id
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
export { fullThingFields };
