/** @type {(url: URLString | URL, base: URLString) => URL} */
const createUrl = (url, base) => {
  try {
    return new URL(url, base);
  } catch {
    return new URL(url, document.baseURI);
  }
};

/** @type {(url: URLString | URL) => URLString} */
const getBaseURI = (url) => {
  const u = createUrl(url);
  return `${u.protocol}${u.host ? '//' : ''}${u.host}${u.pathname}`;
};

/** @type {(a: URLString | URL, b: URLString | URL) => boolean} */
const areEqualUrls = (a, b) => {
  const aUrl = createUrl(a);
  const bUrl = createUrl(b);
  const aSearchParams = aUrl.searchParams;
  const bSearchParams = bUrl.searchParams;
  const allQueries = [...aSearchParams.keys(), ...bSearchParams.keys()];

  return [
    a.origin === b.origin,
    a.pathname === b.pathname,
    allQueries.every((q) => aSearchParams.get(q) === bSearchParams.get(q)),
  ].every(Boolean);
};

/** @type { Rule[] } */
const rules = [
  { type: ['main_frame', 'sub_frame'], host: '*', path: '*',
    action: 'strip', query: [
      'fbclid',
      /^utm_/, // Google Analytics
    ] },

  { type: ['xmlhttprequest'], method: '*', host: /.facebook.com$/, path: '*',
    action: 'strip', query: [
      'rc',
      'dti',
      'dpr',
      'eid',
      'lst',
      'epa',
      'tn-str',
      'extragetparams',
      'comment_tracking',
      'tracking_message',
      'refid',
      '_ft_',
      'av',
      'eav',
      'origin_uri',
      /^__/,
      /^hc_/,
      /^ft\[/,
      /^\w+ref/,
      /^notif_/,
      /^timeline_context_item_/,
    ] },

  { type: 'beacon', host: /.facebook.com$/, path: '*',
    action: 'drop' },

  { type: ['beacon', 'xmlhttprequest'], host: 'www.facebook.com', path: '/ajax/bnzai',
    action: 'drop' },
];

const cleanUrl = (url, base) => {
  const cleanedUrl = createUrl(url, base);

  if (!cleanedUrl.protocol.match(/^https?:$/) || cleanedUrl.hash !== '') {
    return cleanedUrl.href;
  }

  if (getBaseURI(cleanedUrl) === 'https://l.facebook.com/l.php') {
    return cleanUrl(cleanedUrl.searchParams.get('u'));
  }

  const matchedRules = rules
    .filter((rule) => rule.action === 'strip')
    .filter((rule) => {
      if (rule.host === '*') { return true; }
      if (typeof(rule.host) === 'string') {return rule.host === cleanedUrl.host;}
      return rule.host.test(cleanedUrl.host);
    })
    .filter((rule) => {
      if (rule.path === '*') { return true; }
      if (typeof(rule.path) === 'string') {return rule.path === cleanedUrl.pathname;}
      return rule.path.test(cleanedUrl.pathname);
    });

  for (const matchedRule of matchedRules) {
    if (matchedRule.query === '*') {
      cleanedUrl.search = '';
    } else {
      const urlQueries = [...cleanedUrl.searchParams.keys()];
      for (const q of matchedRule.query) {
        if (typeof(q) === 'string') {
          cleanedUrl.searchParams.delete(q);
        } else {
          for (const uq of urlQueries) {
            if (uq.match(q)) {
              cleanedUrl.searchParams.delete(uq);
            }
          }
        }
      }
    }
  }

  return cleanedUrl;
};

function handleRequest(req) {
  const url = createUrl(req.url);
  const matchedRules = rules
    .filter((rule) => !rule.method || rule.method === '*' || rule.method === req.method)
    .filter((rule) => [].concat(rule.type).includes(req.type))
    .filter((rule) => {
      if (rule.host === '*') { return true; }
      if (typeof(rule.host) === 'string') {return rule.host === url.host;}
      return rule.host.test(url.host);
    })
    .filter((rule) => {
      if (rule.path === '*') { return true; }
      if (typeof(rule.path) === 'string') {return rule.path === url.pathname;}
      return rule.path.test(url.pathname);
    });

  if (matchedRules.length === 0) { return; }
  if (matchedRules.some((rule) => rule.action === 'drop')) { return { cancel: true }; }

  const cleanedUrl = cleanUrl(url);

  if (!areEqualUrls(url.href, cleanedUrl.href)) {
    return { redirectUrl: cleanedUrl.href };
  }
}


browser.webRequest.onBeforeRequest.addListener(
  handleRequest,
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody'],
);

browser.contextMenus.create({
  title: browser.i18n.getMessage('CopyCleanedUrl'),
  contexts: ['link'],
});

// Chrome
if (navigator.userAgent.includes('Chrome')) {
  browser.contextMenus.onClicked.addListener(async(info) => {
    const { linkUrl, pageUrl } = info;
    const cleanedUrl = cleanUrl(linkUrl, pageUrl);

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    browser.tabs.sendMessage(tab.id, {
      type: 'clipboard-write',
      msg: cleanedUrl.href,
    });
  });
}
// Firefox
else if (navigator.userAgent.includes('Firefox')) {
  browser.contextMenus.onClicked.addListener((info) => {
    const { linkUrl, pageUrl } = info;
    const cleanedUrl = cleanUrl(linkUrl, pageUrl);

    navigator.clipboard.writeText(cleanedUrl.href);
  });
}
