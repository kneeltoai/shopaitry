'use strict';

// Shopaitry background service worker
// Currently minimal — reserved for future features (e.g. badge count, notifications)

chrome.runtime.onInstalled.addListener(() => {
  console.log('Shopaitry extension installed.');
});
