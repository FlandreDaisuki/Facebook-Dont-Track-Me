/* global softClarifyURL hardClarifyURL clarifyObject log$URL log$Object newURL DEBUG_MODE */

const log$$ = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args);
  } else {
    console.log(args[0]);
  }
};

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
    if (req.method === 'POST') {
      // mainly filter /ajax/bz
      if (req.requestBody.formData) {
        const formData = req.requestBody.formData;
        req.requestBody.formData = clarifyObject(req.requestBody.formData, { hard: true });

        log$$('POST', req.url);
        log$Object(formData, req.requestBody.formData, `The formData of ${req.url}`);
      }
    }

    const IGNORE_FB_PATHES = [
      '/ajax/pagelet', // subpage reaction
    ];

    if (IGNORE_FB_PATHES.some((p) => url.pathname.startsWith(p))) {
      return;
    }

    const good = hardClarifyURL(url);

    if (url.href !== good) {

      log$$('IN_FB_REQ', req);
      log$URL(url.href, good);

      return {
        redirectUrl: good,
      };
    }
  } else {
    const good = softClarifyURL(url);

    if (url.href !== good) {

      log$$('OUT_FB_REQ', req);
      log$URL(url.href, good);

      return {
        redirectUrl: good,
      };
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  trackStrip,
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody']
);

function tabLinkStrip(tab) {
  const good = softClarifyURL(tab.url);
  log$$('tabLinkStrip', tab);
  if (tab.url !== good) {
    log$$('good:', good, 'bad:', tab.url);
    chrome.tabs.update(tab.id, { url: good });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && changeInfo.url) {
    tabLinkStrip(tab);
  }
});

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

    log$$('COPY_URL');
    log$URL(linkUrl, good);

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

    log$$('COPY_URL');
    log$URL(linkUrl, good);

    navigator.clipboard.writeText(good);
  });
}
