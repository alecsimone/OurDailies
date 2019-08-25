const convertISOtoAgo = function(isoTime) {
   const seconds = Math.floor((new Date() - new Date(isoTime)) / 1000);

   let interval = Math.floor(seconds / 31536000);

   if (interval >= 1) {
      return `${interval} YEAR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 2592000);
   if (interval >= 1) {
      return `${interval} MONTH${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 86400);
   if (interval >= 1) {
      return `${interval} DAY${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 3600);
   if (interval >= 1) {
      return `${interval} HOUR${interval === 1 ? '' : 'S'}`;
   }
   interval = Math.floor(seconds / 60);
   if (interval >= 1) {
      return `${interval} MINUTE${interval === 1 ? '' : 'S'}`;
   }
   return `${Math.floor(seconds)} SECOND${seconds === 1 ? "" : "S"}`;
};

export { convertISOtoAgo };

const extractHostname = function(url) {
   let hostname;
   // find & remove protocol (http, ftp, etc.) and get hostname

   if (url.indexOf('//') > -1) {
      hostname = url.split("/")[2];
   } else {
      hostname = url.split("/")[0];
   }

   // find & remove port number
   hostname = hostname.split(":")[0];
   // find & remove "?"
   hostname = hostname.split("?")[0];

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
