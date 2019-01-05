/* global softClarifyURL hardClarifyURL betterLog newURL */

function trackStrip(req) {
  // 1. Filter type
  const ACCEPT_TYPES = [
    'sub_frame',
    'main_frame',
    'xmlhttprequest',
  ];
  if (!ACCEPT_TYPES.includes(req.type)) {
    return;
  }

  const url = newURL(req.url);

  const IGNORE_FB_HOSTS = [
    'fbcdn.net',
    '-chat.facebook.com',
    'upload.facebook.com',
  ];
  // 2. Ignore specific hosts
  if (IGNORE_FB_HOSTS.some((h) => url.hostname.endsWith(h))) {
    return;
  }

  // 3. Clarify URLs
  if (url.hostname === 'www.facebook.com') {
    const IGNORE_FB_PATHES = [
      '/ajax/bz',
      '/ajax/pagelet',
      '/groups/member_bio',
    ];

    if (IGNORE_FB_PATHES.some((p) => url.pathname.startsWith(p))) {
      return;
    }

    const good = hardClarifyURL(url);

    if (url.href !== good) {
      console.info('case 1'); /*
      console.info('case 1', req);
      betterLog(url.href, good);
      // */
      return {
        redirectUrl: good,
      };
    }
  } else {
    const good = softClarifyURL(url);

    if (url.href !== good) {
      console.info('case 2'); /*
      console.info('case 2', req);
      betterLog(url.href, good);
      // */
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
    let good = null;
    const { linkUrl, pageUrl } = info;
    if (newURL(info.pageUrl).hostname.includes('facebook.com')) {
      good = hardClarifyURL(linkUrl, pageUrl);
    } else {
      good = softClarifyURL(linkUrl, pageUrl);
    }

    console.info('copy-clean-url');
    betterLog(linkUrl, good);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { type: 'clipboard-write', msg: good });
    });
  });
}
// Firefox
else if (navigator.userAgent.includes('Firefox')) {
  chrome.contextMenus.onClicked.addListener((info) => {
    let good = null;
    const { linkUrl, pageUrl } = info;
    if (newURL(info.pageUrl).hostname.includes('facebook.com')) {
      good = hardClarifyURL(linkUrl, pageUrl);
    } else {
      good = softClarifyURL(linkUrl, pageUrl);
    }

    console.info('copy-clean-url');
    betterLog(linkUrl, good);

    navigator.clipboard.writeText(good);
  });
}
