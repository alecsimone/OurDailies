window.onload = function() {
   removeRoomsBar();
   setupGlobalVariables();

   getMemberDB();

   const wholeChatBox = $('.chat-list');
   addChatBG(wholeChatBox);

   const leftButtons = $($('.tw-flex.tw-flex-row')[0]);
   addResetButton(leftButtons);

   wholeChatBox.on('mouseenter', '.chat-author__display-name', function(e) {
      whitenName(e.target);
   });

   wholeChatBox.on('mouseleave', '.chat-author__display-name', function(e) {
      recolorName(e.target);
   });

   // Now we get into the meat of the extension. A mutation observer that watches for any changes to .chat-list
   const toBeObserved = document.querySelector('.chat-list');

   // We don't want attribute changes, those are boring. Just childList changes down the subtree.
   const observationConfig = {
      attributes: false,
      childList: true,
      subtree: true
   };

   const observer = new MutationObserver(function(mutationsList) {
      // We're going to get little packets of elements that have been changed. Sometimes there will multiple elements in each package, so we need to loop through them.
      $.each(mutationsList, function(index, message) {
         try {
            if (
               message.addedNodes[0].className === 'chat-line__message' &&
               message.target.className !== 'messageWrapper'
            ) {
               processMessage(message);
            }
         } catch (error) {}
      });
   });

   observer.observe(toBeObserved, observationConfig);
};

function processMessage(message) {
   // Twitch uses a lot of placeholders, which then get removed, so we need to filter those out.
   if (message.removedNodes[0] !== undefined) {
      return;
   }

   const fullMsgHTML = message.addedNodes[0];
   if (fullMsgHTML === undefined) {
      return;
   }
   if (fullMsgHTML.textContent === 'Welcome to the chat room!') {
      return;
   }
   const messageSender = fullMsgHTML.querySelector('.chat-author__display-name')
      .textContent;
   const displayName = fullMsgHTML.querySelector('.chat-author__display-name');
   const messageSenderLowerCase = messageSender.toLowerCase();

   showProfilePicture(messageSenderLowerCase, fullMsgHTML);
   addRepToName(messageSenderLowerCase, displayName);

   if (!checkIfChatterHasRep(messageSenderLowerCase)) {
      displayName.style.color = 'hsla(0, 0%, 80%, .5)';
      fullMsgHTML.classList.add('noRep');
   }

   const badges = fullMsgHTML.querySelectorAll('.chat-badge');
   processBadges(badges, messageSender);

   const modIcons = fullMsgHTML.querySelectorAll('.mod-icon');
   processModIcons(modIcons);

   const links = fullMsgHTML.querySelectorAll('.link-fragment');
   if (links.length > 0) {
      processLinks(links, messageSender);
   }

   const wholeMessageContent = fullMsgHTML.querySelectorAll(
      '[data-a-target="chat-message-text"], .chat-line__message--emote, .mention-fragment'
   );
   const wholeMessage = turnWholeMessageIntoWords(wholeMessageContent);

   recognizeNewChatters(fullMsgHTML, messageSender);

   const emotes = fullMsgHTML.querySelectorAll('.chat-line__message--emote');
   const emoteVote =
      emotes.length > 0 ? checkEmotesForVotes(emotes, messageSender) : false;

   const messageTextPieces = fullMsgHTML.querySelectorAll(
      '[data-a-target="chat-message-text"]'
   );
   const textVote =
      messageTextPieces.length > 0
         ? checkMessageForVotes(messageTextPieces, messageSender)
         : false;

   if (
      (emoteVote === 'yea' && (!textVote || textVote === 'yea')) ||
      (textVote === 'yea' && (!emoteVote || emoteVote === 'yea'))
   ) {
      if (checkIfChatterHasRep(messageSender)) {
         sendVote(messageSender, 'yea');
      } else {
         printToChat(
            `${messageSender}, you can't vote because you're not a member. Sorry.`,
            'error'
         );
      }
   } else if (
      (emoteVote === 'nay' && (!textVote || textVote === 'nay')) ||
      (textVote === 'nay' && (!emoteVote || emoteVote === 'nay'))
   ) {
      if (checkIfChatterHasRep(messageSender)) {
         sendVote(messageSender, 'nay');
      } else {
         printToChat(
            `${messageSender}, you can't vote because you're not a member. Sorry.`,
            'error'
         );
      }
   }

   const messageObject = {
      messageSender,
      wholeMessage: wholeMessage.toLowerCase()
   };
   soundEngine(messageObject);
   wordReplacer(messageTextPieces);
}

function removeRoomsBar() {
   const roomsBar = $('.rooms-header')[0];
   roomsBar.remove();
}

function setupGlobalVariables() {
   window.chattersSoFar = [];
}

function ajaxReplacement(data) {
   return new Promise(function(resolve, reject) {
      chrome.runtime.sendMessage(data, function(response) {
         resolve(response.ajaxResponse);
      });
   });
}

function printToChat(message, tone = 'success') {
   // const wholeChatBox = $('.chat-list');
   // const chatMessagesContainer = $("[role='log']");
   let messageColor = 'hsla(106, 68%, 54%, 1)';
   if (tone === 'error') {
      messageColor = 'hsla(0, 68%, 54%, 1)';
   }
   const wrappedMessage = `<div class="printed_message" style="color: ${messageColor}; font-weight: bold;">${message}</div>`;
   // chatMessagesContainer.append(wrappedMessage);
   $(wrappedMessage).insertBefore($('.scrollable-trigger__wrapper'));
}

function getMemberDB() {
   const ajaxData = JSON.stringify({
      query: `query { members { id, displayName, avatar, rep, points, giveableRep, twitchName, roles } }`
   });
   ajaxReplacement(ajaxData).then(function(data) {
      window.memberDB = data.members;
   });
}
window.setInterval(getMemberDB, 30000);

function addChatBG(wholeChatBox) {
   const chatBG = chrome.runtime.getURL('images/chatBG.jpg');
   wholeChatBox.css('background', `url(${chatBG}) no-repeat`);
}

function addResetButton(container) {
   const reset = chrome.runtime.getURL('images/reset.png');
   container.append(`<img id='resetbutton' src='${reset}'>`);
   $('#resetbutton').click(function() {
      resetVotes();
   });
}

function whitenName(nameToWhiten) {
   const originalColor = getOriginalColor(nameToWhiten);
   $(nameToWhiten).attr('originalcolor', originalColor);
   nameToWhiten.style.color = 'white';
}
function getOriginalColor(el) {
   const originalStyle = $(el).attr('style');
   const colorIndex = originalStyle.indexOf('color: ');
   const colorCodeIndex = colorIndex + 7;
   const semicolonIndex = originalStyle.indexOf(';');
   const originalColor = originalStyle.substring(
      colorCodeIndex,
      semicolonIndex
   );
   return originalColor;
}
function recolorName(nameToRecolor) {
   const originalColor = $(nameToRecolor).attr('originalcolor');
   nameToRecolor.style.color = originalColor;
}

function findOurGuy(messageSender) {
   const { memberDB } = window;
   messageSender = messageSender.toLowerCase();
   const ourGuy = memberDB.find(member => {
      if (member.twitchName == null) return false;
      return member.twitchName.toLowerCase() === messageSender;
   });
   return ourGuy;
}

const defaultPic = chrome.runtime.getURL('images/defaultPic.jpg');
function showProfilePicture(messageSender, fullMsgHTML) {
   fullMsgHTML = jQuery(fullMsgHTML);
   const ourGuy = findOurGuy(messageSender);
   let senderPic;
   if (ourGuy != null) {
      senderPic = ourGuy.avatar;
      if (senderPic == null) {
         senderPic = defaultPic;
      }
   } else {
      senderPic = defaultPic;
   }
   // fullMsgHTML.wrap("<div class='messageWrapper'></div>");
   fullMsgHTML.prepend(
      `<img src="${senderPic}" class="chatter-avatar ${messageSender}-avatar">`
   );
}

function addRepToName(messageSender, displayName) {
   let rep = 0;
   const ourGuy = findOurGuy(messageSender);
   if (ourGuy) {
      rep = ourGuy.rep;
   }
   if (messageSender === 'nightbot') {
      rep = '♾️';
   }
   displayName.innerText = `[${rep}] ${displayName.innerText}`;
}

function checkIfChatterHasRep(messageSender) {
   messageSender = messageSender.toLowerCase();
   const ourGuy = findOurGuy(messageSender);
   if (ourGuy != null) {
      if (ourGuy.rep > 0) {
         return true;
      }
   }
   return false;
}

const dailiesBadge = chrome.runtime.getURL('images/subBadge.png');
const modBadge = chrome.runtime.getURL('images/sword.jpg');
function processBadges(badges, messageSender) {
   let isSub = false;
   jQuery.each(badges, function(index, badge) {
      badge = jQuery(badge);
      if (badge.attr('aria-label').indexOf('Subscriber') > -1) {
         isSub = true;
         const badgeContainer = badge.parent();
         badge.css('display', 'none');
         badgeContainer.append(
            `<img class='dailiesSubBadge chat-badge' src='${dailiesBadge}'>`
         );
      } else if (badge.attr('aria-label') === 'Moderator badge') {
         const badgeContainer = badge.parent();
         badge.css('display', 'none');
         badgeContainer.prepend(
            `<img class='dailiesModBadge chat-badge' src='${modBadge}'>`
         );
      } else if (
         badge.attr('aria-label').indexOf('cheer') > -1 ||
         badge.attr('aria-label') === 'Sub Gifter badge' ||
         badge.attr('aria-label') === 'Verified badge'
      ) {
      } else {
         badge.css('display', 'none');
      }
   });
}

const timeoutIcon = chrome.runtime.getURL('images/timeout.png');
function processModIcons(modIcons) {
   $.each(modIcons, function(index, element) {
      element = $(element);
      if (element.attr('data-test-selector') === 'chat-ban-button') {
         element.css('display', 'none');
      } else if (element.attr('data-test-selector') === 'chat-timeout-button') {
         element.html(`<img class='timeoutIcon' src=${timeoutIcon}>`);
      } else if (element.attr('data-test-selector') === 'chat-delete-button') {
         element.css('display', 'none');
      }
   });
}

function processLinks(links, messageSender) {
   if (!checkIfChatterHasRep(messageSender)) {
      links.forEach(link => {
         link.innerHTML = '';
         link.innerText = '<link hidden because you have 0 rep>';
         link.style =
            'text-decoration: none; color: hsla(0, 0%, 90%, .5) !important;';
      });
   }
}

function turnWholeMessageIntoWords(messageArray) {
   let wholeMessage = '';
   $.each(messageArray, function(index, val) {
      if (
         $(val).attr('data-a-target') === 'chat-message-text' ||
         $(val).attr('data-a-target') === 'chat-message-mention'
      ) {
         wholeMessage += val.textContent;
      } else if (val.className.indexOf('chat-image') > -1) {
         wholeMessage += val.alt;
      }
   });
   return wholeMessage;
}

function turnMessagePieceIntoWords(messagePiece) {
   return messagePiece.split(/[ ,.]+/);
}

const voteYeaEmote = chrome.runtime.getURL('images/voteyea.png');
const voteNayEmote = chrome.runtime.getURL('images/votenay.png');
const wordReplacements = {
   vy: `<img src=${voteYeaEmote} style="width: 28px; height: 28px; vertical-align: middle;" />`,
   vn: `<img src=${voteNayEmote} style="width: 28px; height: 28px; vertical-align: middle;" />`
};
function wordReplacer(messageTextPieces) {
   messageTextPieces.forEach(messageTextPiece => {
      const theMessage = messageTextPiece.innerText;
      const messageTextArray = turnMessagePieceIntoWords(theMessage);
      messageTextArray.forEach(word => {
         lowercasedWord = word.toLowerCase();
         if (wordReplacements.hasOwnProperty(lowercasedWord)) {
            wordLocation = theMessage.indexOf(word);
            wordLength = word.length;
            const messageBeginning = theMessage.substring(0, wordLocation);
            const messageEnd = theMessage.substring(wordLocation + wordLength);
            const newMessage =
               messageBeginning + wordReplacements[lowercasedWord] + messageEnd;
            messageTextPiece.innerHTML = newMessage;
         }
      });
   });
}

function recognizeNewChatters(message, messageSender) {
   if (!window.chattersSoFar.includes(messageSender.toLowerCase())) {
      message.style.background = 'hsla(225, 40%, 60%, .25)';
      window.chattersSoFar.push(messageSender.toLowerCase());
      announce(messageSender.toLowerCase());
      // notifyOfParticipation(messageSender);
   }
}

function checkEmotesForVotes(emotes, messageSender) {
   let yeaVote = false;
   let nayVote = false;
   $.each(emotes, function(index, thisEmoteElement) {
      const thisEmoteName = thisEmoteElement.alt;
      if (thisEmoteName === 'VoteYea') {
         yeaVote = true;
      } else if (thisEmoteName === 'VoteNay') {
         nayVote = true;
      }
   });
   if (yeaVote && nayVote) {
      console.log('you equivocating like a mothafucka');
      return false;
   }
   if (yeaVote) {
      return 'yea';
   }
   if (nayVote) {
      return 'nay';
   }
   return false;
}

function checkMessageForVotes(messageTextPieces, messageSender) {
   let voteYea = false;
   let voteNay = false;
   $.each(messageTextPieces, function(index, val) {
      const wordsArray = turnMessagePieceIntoWords(val.textContent);
      $.each(wordsArray, function(index, word) {
         const lowercasedWord = word.toLowerCase();
         if (lowercasedWord === 'voteyea' || lowercasedWord === 'vy') {
            voteYea = true;
         } else if (
            lowercasedWord === 'votenay' ||
            lowercasedWord === 'neigh' ||
            lowercasedWord === 'vn'
         ) {
            voteNay = true;
         } else if (
            lowercasedWord.includes('!vote') ||
            lowercasedWord.includes('!yea') ||
            lowercasedWord.match('![v|y][0-9]+') !== null
         ) {
            if (checkIfChatterHasRep(messageSender)) {
               var voteNumber = getVoteNumber(lowercasedWord);
               if (!isNaN(voteNumber)) {
                  contenderVote(messageSender, voteNumber, 'yea');
               }
            } else {
               printToChat(
                  `${messageSender}, you can't vote because you're not a member. Sorry.`,
                  'error'
               );
            }
         } else if (
            lowercasedWord.includes('!nay') ||
            lowercasedWord.match('!n[0-9]+') !== null
         ) {
            if (checkIfChatterHasRep(messageSender)) {
               var voteNumber = getVoteNumber(lowercasedWord);
               if (!isNaN(voteNumber)) {
                  contenderVote(messageSender, voteNumber, 'nay');
               }
            } else {
               printToChat(
                  `${messageSender}, you can't vote beacuse you're not a member. Sorry.`,
                  'error'
               );
            }
         }
      });
   });
   if (voteYea && voteNay) {
      console.log('you equivocatin like a mothafucka');
      return false;
   }
   if (voteYea) {
      return 'yea';
   }
   if (voteNay) {
      return 'nay';
   }
   return false;
}

function getVoteNumber(word) {
   const matchData = word.match(/[!](?:vote|yea|nay|v|y|n)/);
   const voteNumber = word.substring(matchData[0].length + matchData.index);
   return voteNumber;
}

function sendVote(voter, direction) {
   // const ajaxData = {
   //    voter,
   //    direction,
   //    action: "chat_vote"
   // };
   const ourGuy = findOurGuy(voter);
   const variables = {
      voter: ourGuy.id
   };
   let ajaxData;
   if (direction === 'yea') {
      ajaxData = JSON.stringify({
         query: `mutation($voter: ID!) { liveChatVote(voter: $voter) { id, value } }`,
         variables
      });
   } else if (direction === 'nay') {
      ajaxData = JSON.stringify({
         query: `mutation($voter: ID!) { liveChatPass(voter: $voter) { id } }`,
         variables
      });
   }
   ajaxReplacement(ajaxData).then(function(data) {
      console.log(data);
   });
}

function contenderVote(voter, voteNumber, direction) {
   if (voteNumber === 0 || voteNumber > 25) {
      return;
   }
   console.log(`${voter} voted ${direction} on play number ${voteNumber}`);
   const ourGuy = findOurGuy(voter);
   const variables = {
      voteNumber,
      voter: ourGuy.id,
      direction
   };
   const ajaxData = JSON.stringify({
      query: `mutation($voteNumber: Int!, $direction: String!, $voter: ID!) { contenderVote(voteNumber: $voteNumber, direction: $direction, voter: $voter) { message } }`,
      variables
   });
   ajaxReplacement(ajaxData).then(function(data) {
      console.log(data.contenderVote.message);
      if (data.contenderVote == null) {
         printToChat(
            `${voter}, ${voteNumber} is an invalid play number`,
            'error'
         );
         return;
      }
      if (direction === 'nay') {
         printToChat(`${voter} ${data.contenderVote.message}`, 'error');
      } else {
         printToChat(`${voter} ${data.contenderVote.message}`);
      }
   });
}

function resetVotes() {
   ajaxData = JSON.stringify({
      query: `mutation { resetLiveThing }`
   });
   ajaxReplacement(ajaxData).then(function(data) {
      console.log(data);
   });
}

function soundEngine(messageObject) {
   const sender = messageObject.messageSender.toLowerCase();
   const msg = messageObject.wholeMessage;

   if (sender === 'nightbot') {
      return;
   }
   if (!checkIfChatterHasRep(messageObject.messageSender)) {
      return;
   }

   const wordsArray = turnMessagePieceIntoWords(msg);
   wordsArray.forEach(word => {
      if (word === 'vy') {
         sounds.sounds.ding.play();
      } else if (word === 'vn') {
         sounds.sounds.snip2.play();
      }
   });

   if (msg.indexOf('voteyea') > -1 && msg.indexOf('votenay') > -1) {
      console.log('you equivocating like a mothafucka');
   } else if (msg.indexOf('voteyea') > -1) {
      sounds.sounds.ding.play();
   } else if (
      msg.indexOf('votenay') > -1 ||
      msg.indexOf('cut it') > -1 ||
      (msg.indexOf('!cut') > -1 && msg.indexOf('!cute') === -1)
   ) {
      sounds.sounds.snip2.play();
   } else if (msg.indexOf('neigh') > -1) {
      sounds.sounds.neigh.play();
   }

   // if (getChatterContribution(messageObject.messageSender) < 3) {
   //    if (getChatterRole(messageObject.messageSender) !== "editor" && getChatterRole(messageObject.messageSender) !== "administrator") {
   //       console.log("no sound privileges");
   //       return;
   //    }
   // }

   if (msg.indexOf('!justa') > -1) {
      sounds.sounds.yawn.play();
   } else if (msg.indexOf('burn it') > -1) {
      sounds.sounds.burn.play();
   } else if (msg.indexOf('kill it') > -1) {
      sounds.sounds.machinegun.play();
   } else if (msg.indexOf('!mozz') > -1) {
      sounds.sounds.chainsaw.play();
   } else if (msg.indexOf('!get') > -1) {
      sounds.sounds.get.play();
   }

   if (msg.indexOf('lul') > -1 || msg.indexOf('lol') > -1) {
      const lulArray = ['lul', 'lul2', 'lul3', 'lul4', 'lul5', 'lul6'];
      const lulCount = lulArray.length;
      const lulIndex = rand(0, lulCount);
      const lulToPlay = lulArray[lulIndex];
      sounds.sounds[lulToPlay].play();
   } else if (msg.indexOf('lmao') > -1 || msg.indexOf('lmfao') > -1) {
      const lmaoArray = ['lmao', 'lmao2', 'lmao3', 'lmao4', 'lmao5', 'lmao6'];
      const lmaoCount = lmaoArray.length;
      const lmaoIndex = rand(0, lmaoCount);
      const lmaoToPlay = lmaoArray[lmaoIndex];
      sounds.sounds[lmaoToPlay].play();
   }

   if (msg.indexOf('!alecdidsomethingdumbcounter') > -1) {
      sounds.sounds.wompWomp.play();
   }

   if (msg.indexOf('wallle') > -1) {
      sounds.sounds.wallle.play();
   }
}

const sounds = {
   soundFiles: {
      ding: 0.3,
      snip2: 0.5,
      burn: 0.4,
      machinegun: 0.25,
      chainsaw: 0.2,
      yawn: 0.2,
      lul: 0.2,
      lul2: 0.2,
      lul3: 0.2,
      lul4: 0.2,
      lul5: 0.2,
      lul6: 0.2,
      lmao: 0.08,
      lmao2: 0.2,
      lmao3: 0.2,
      lmao4: 0.4,
      lmao5: 0.6,
      lmao6: 0.6,
      wompWomp: 0.8,
      neigh: 0.25,
      fanfare: 0.2,
      wallle: 0.5,
      get: 0.3
   },
   sounds: []
};
function setupSounds() {
   jQuery.each(sounds.soundFiles, function(sound, volume) {
      const thisSoundFile = chrome.runtime.getURL(`sounds/${sound}.mp3`);
      sounds.sounds[sound] = new Audio(thisSoundFile);
      sounds.sounds[sound].volume = volume;
   });
}
setupSounds();

function rand(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

// These names are case sensitive
const customEntrances = {
   entranceFiles: {
      chimblade: 0.8,
      strangest_stranger: 0.3,
      seamuscahill: 0.1,
      fluctuantflatulence: 0.2,
      carbonxd: 1,
      shadow30128: 0.3,
      refrigeratedtoiletpaper: 0.5,
      orionrl: 1,
      pyre_eu: 0.4,
      satan_is_dirty: 0.2,
      thatguy_from_thatthing: 0.4,
      thecactuskeed: 0.5,
      jwols: 0.6,
      chillpanda5213_rl: 0.6,
      jake_kaufmann: 0.2,
      dackadoo1: 1,
      unduhscore: 0.8,
      crossingmarko: 0.5,
      ollopa: 0.4,
      wavepunk: 0.4,
      wakon1: 0.2,
      novacorpsrl: 0.1,
      gamazzle01: 0.4,
      flamingtreerl: 0.3,
      orange_burst: 1,
      notdrumzorz: 1,
      sixnineactual: 0.5,
      manhattaan: 0.1,
      mr_nyptrox: 0.2,
      haxzyt: 0.1,
      ganerrl: 0.6,
      fisheysauce: 0.7,
      iamjokarman: 0.8,
      therewillbebears: 0.4,
      jkbdoug: 1,
      kutturamaswami: 1,
      guann: 1,
      greentv23: 1,
      princey1997: 0.1,
      bat_rl: 1
   },
   entrances: []
};
function setupEntrances() {
   jQuery.each(customEntrances.entranceFiles, function(user, volume) {
      customEntrances.entrances[user] = new Audio(
         chrome.runtime.getURL(`sounds/entrances/${user}.mp3`)
      );
      customEntrances.entrances[user].volume = volume;
   });
}
setupEntrances();

function announce(arriver) {
   const mods = [
      'chimblade',
      'dailiesalec',
      'derrothh',
      'dudewiththenose',
      'mrtoastymuffinz',
      'mysterylsg',
      'orionrl',
      'refrigeratedtoiletpaper',
      'sid_o7',
      'skyrider50',
      'strangest_stranger',
      'theturbolemming',
      'wakon1'
   ];
   if (arriver in customEntrances.entranceFiles) {
      customEntrances.entrances[arriver].play();
   } else if (mods.includes(arriver)) {
      sounds.sounds.fanfare.play();
   }
}
