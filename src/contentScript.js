'use strict';

// TODO - Custom prompt window for a better experience

// https://developer.chrome.com/extensions/content_scripts

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {  
    if(request.type === 'GROUPTITLE') {
		const message = prompt('Group Title:', request.payload.message);
    	sendResponse({message,});
    } else {
		// Send an empty response
		sendResponse({});
	}
	// https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
	return true;
});
