// const ajaxURL = 'http://localhost:4444';
const ajaxURL = 'https://playground.ourdailies.org';

let urls;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
   fetch(ajaxURL, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${privateData.prismaToken}`
      },
      body: request
   })
      .then(response => response.json())
      .then(responseAsJson => {
         sendResponse({ ajaxResponse: responseAsJson.data });
      })
      .catch(err => console.log(err));
   return true;
});
