/* global clarifyURL */

function trackStrip(req) {
  // 1. Filter type
  const ACCEPT_TYPE = ['main_frame', 'xmlhttprequest'];
  if (!ACCEPT_TYPE.includes(req.type)) {
    return;
  }

  const url = new URL(req.url);

  // 2. Case by case clarify URLs
  if (url.hostname === 'www.facebook.com') {
    if (
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/ufi') ||
      url.pathname.startsWith('/ajax') ||
      url.pathname.startsWith('/chat') ||
      url.pathname.startsWith('/pages_reaction_units') ||
      url.pathname.startsWith('/groups/member_bio')) {
      return;
    }

    const good = clarifyURL(url);

    console.info('case 1', req, good);

    if (req.url !== good) {
      return {
        redirectUrl: good,
      };
    }
  } else if (url.hostname === 'upload.facebook.com') {
    // ignore it!
  } else if (url.hostname.endsWith('fbcdn.net')) {
    // ignore it!
  } else if (url.hostname.endsWith('-chat.facebook.com')) {
    // ignore it!
  } else {
    const good = clarifyURL(url);

    console.info('Case 2', req, good);

    if (req.url !== good) {
      return {
        redirectUrl: good,
      };
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  trackStrip,
  { urls: ['<all_urls>'] },
  ['blocking']
);

chrome.contextMenus.create({
  title: chrome.i18n.getMessage('CopyCleanUrl'),
  contexts: ['link'],
});

// Chrome
if (navigator.userAgent.includes('Chrome')) {
  chrome.contextMenus.onClicked.addListener((info) => {
    const good = clarifyURL(info.linkUrl);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { type: 'clipboard-write', msg: good });
    });
  });
}
// Firefox
else if (navigator.userAgent.includes('Firefox')) {
  chrome.contextMenus.onClicked.addListener((info) => {
    const good = clarifyURL(info.linkUrl);
    navigator.clipboard.writeText(good);
  });
}


