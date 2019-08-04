/* global createUrl, cleanObject, $Console, getBaseURI, cleanUrl, areEqualUrls */

let $console;
chrome.storage.sync.get('options', ({ options }) => {
  $console = options.HideConsoleLog ? new $Console({ fake: true }) : new $Console();
});
chrome.storage.onChanged.addListener(({ options }, area) => {
  if (area === 'sync' && options) {
    $console = options.newValue.HideConsoleLog ? new $Console({ fake: true }) : new $Console();
  }
});

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

  const url = createUrl(req.url);

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
        const options = {
          hard: true,
          force: ['fb_dtsg_ag', 'fb_dtsg', 'jazoest'], // experiment
        };

        if (url.pathname.startsWith('/ajax/bz')) {
          options.force.push('q', 'ph', 'ts'); // experiment
        }

        if (url.pathname.startsWith('/api/graphql')) {
          options.force.push('variables', 'fb_api_caller_class', 'fb_api_req_friendly_name', 'doc_id', 'av'); // experiment
        }

        const { bad, good } = cleanObject(req.requestBody.formData, options);
        $console.diff(`𝐏𝐎𝐒𝐓 ${decodeURI(getBaseURI(url))}`, bad, good);
        req.requestBody.formData = good;
      }
    }

    const IGNORE_FB_PATHES = [
      '/ajax/pagelet', // subpage reaction
    ];

    if (IGNORE_FB_PATHES.some((p) => url.pathname.startsWith(p))) {
      return;
    }

    const cleaned = cleanUrl(url, getBaseURI(url), { hard: true });

    if (!areEqualUrls(url.href, cleaned)) {

      const bad = createUrl(url).searchParams;
      const good = createUrl(cleaned).searchParams;

      $console.diff(`💩 ${decodeURI(getBaseURI(url))}`, bad, good);

      return {
        redirectUrl: cleaned,
      };
    }
  } else {
    const cleaned = cleanUrl(url, getBaseURI(url));

    if (!areEqualUrls(url.href, cleaned)) {

      const bad = createUrl(url).searchParams;
      const good = createUrl(cleaned).searchParams;

      $console.diff(`🛰 ${decodeURI(getBaseURI(url))}`, bad, good);

      return {
        redirectUrl: cleaned,
      };
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  trackStrip,
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody']
);

chrome.contextMenus.create({
  title: chrome.i18n.getMessage('CopyCleanedUrl'),
  contexts: ['link'],
});

// Chrome
if (navigator.userAgent.includes('Chrome')) {
  chrome.contextMenus.onClicked.addListener((info) => {
    let cleaned = null;
    const { linkUrl, pageUrl } = info;
    if (createUrl(pageUrl).hostname.includes('facebook.com')) {
      cleaned = cleanUrl(linkUrl, pageUrl, { hard: true });
    } else {
      cleaned = cleanUrl(linkUrl, pageUrl);
    }

    const bad = createUrl(linkUrl).searchParams;
    const good = createUrl(cleaned).searchParams;

    $console.diff(`📋 ${decodeURI(getBaseURI(linkUrl))}`, bad, good);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(tab.id, { type: 'clipboard-write', msg: cleaned });
    });
  });
}
// Firefox
else if (navigator.userAgent.includes('Firefox')) {
  chrome.contextMenus.onClicked.addListener((info) => {
    let cleaned = null;
    const { linkUrl, pageUrl } = info;
    if (createUrl(info.pageUrl).hostname.includes('facebook.com')) {
      cleaned = cleanUrl(linkUrl, pageUrl, { hard: true });
    } else {
      cleaned = cleanUrl(linkUrl, pageUrl);
    }

    const bad = createUrl(linkUrl).searchParams;
    const good = createUrl(cleaned).searchParams;

    $console.diff(`📋 ${decodeURI(getBaseURI(linkUrl))}`, bad, good);

    navigator.clipboard.writeText(cleaned);
  });
}
