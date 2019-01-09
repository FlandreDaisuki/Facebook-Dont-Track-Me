/* global softClarifyURL hardClarifyURL betterLog newURL */

function trackStrip(req) {
  // 1. Filter type
  const ACCEPT_TYPES = [
    'beacon',
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
    const BLOCK_FB_PATHES = [
      '/ajax/bz',
    ];

    if (BLOCK_FB_PATHES.some((p) => url.pathname.startsWith(p))) {
      console.info('BLOCK_FB_PATHES'); /*
      console.info('BLOCK_FB_PATHES', req);
      betterLog(url.href, good);
      // */
      return { cancel: true };
    }

    const IGNORE_FB_PATHES = [
      '/ajax/pagelet', // subpage reaction
      '/groups/member_bio', // subpage reaction
      '/messaging/save_thread_emoji', // ?source will break the function
    ];

    if (IGNORE_FB_PATHES.some((p) => url.pathname.startsWith(p))) {
      return;
    }

    const good = hardClarifyURL(url);

    if (url.href !== good) {
      console.info('IN_FB_REQ'); /*
      console.info('IN_FB_REQ', req);
      betterLog(url.href, good);
      // */
      return {
        redirectUrl: good,
      };
    }
  } else {
    const good = softClarifyURL(url);

    if (url.href !== good) {
      console.info('OUT_FB_REQ'); /*
      console.info('OUT_FB_REQ', req);
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

    console.info('COPY_URL');
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

    console.info('COPY_URL');
    betterLog(linkUrl, good);

    navigator.clipboard.writeText(good);
  });
}
