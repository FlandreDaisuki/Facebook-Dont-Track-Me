// ==UserScript==
// @name         Facebook-Dont-Track-Me
// @namespace    https://github.com/FlandreDaisuki
// @version      1.5.4
// @description  Strip Facebook track parameters and clarify url
// @description:zh-TW 移除 Facebook 追蹤參數及淨化網址欄
// @author       FlandreDaisuki
// @include      *
// @run-at       document-start
// @grant        none
// @noframes
// ==/UserScript==
/* eslint-disable no-unused-vars */

const DEBUG_MODE = false;

const SOFT_USELESS = [
  'fbclid', // 元兇
];

const SOFT_PATTERNS = [
  /^utm_/,       // google analysis
  /^guce_/,      // yahoo advertising
  /^guccounter/, // yahoo advertising
];

const SOFT_USEFUL = [];

const HARD_USELESS = [
  'eid',        // 動態的發文者/粉專使用者連結
  'dti',      // 不知道從來定位到個人頁面會出現
  'dpr',      // 不知道從來定位到個人頁面會出現
  'rc',      // 不知道從來定位到個人頁面會出現
  'comment_tracking', // 留言連結
  'tn-str',   // theater 模式的發文者連結
  'extragetparams',
  'lst', // 跟個人頁面有關
  'epa', // 跟 hashtag 有關
];

const HARD_PATTERNS = [
  /^__/,
  /^hc_/,
  /^ft\[/,
  /^\w+ref/,
  /^notif_/,
  /^timeline_context_item_/,
];

const HARD_USEFUL = [
  '__a',
  '__adt',
  'ref_type',
];

// Thanks this bug...
// https://bugzilla.mozilla.org/show_bug.cgi?id=1508174
function* keyIterator(obj) {
  const itor = obj.keys ? obj.keys() : Object.keys(obj)[Symbol.iterator]();

  while (1) {
    const { done, value } = itor.next();
    if (done) { return; }
    yield value;
  }
}

function Objectify(obj) {
  const o = {};
  for (const k of keyIterator(obj)) {
    o[k] = obj.get ? obj.get(k) : obj[k];
  }
  return o;
}

/**
 * New an URL object accepts cross browser href/url
 *
 * @param {String|URL} url
 * @returns {URL} URLObject
 */
function newURL(url, base) {
  try {
    return new URL(url, base);
  } catch (error) {
    return new URL(url, document.baseURI);
  }
}

function diffObjectKeys(_ref, _cmp) {
  const ref = Objectify(_ref), cmp = Objectify(_cmp);
  const both = new Set(), added = new Set(), striped = new Set();
  const keys = new Set([...keyIterator(ref), ...keyIterator(cmp)]);
  for (const key of keys) {
    if (key in ref && key in cmp) {
      both.add(key);
    } else if (!(key in ref) && key in cmp) {
      added.add(key);
    } else {
      striped.add(key);
    }
  }

  return {
    both: [...both],
    added: [...added],
    striped: [...striped],
  };
}

function softClarifyURL(_url, base) {
  return clarifyURL(_url, base);
}

function hardClarifyURL(_url, base) {

  // No facebook redirect
  const isFacebookRedirect = (l) => {
    const u = newURL(l);
    u.search = '';
    return u.href === 'https://l.facebook.com/l.php';
  };

  if (isFacebookRedirect(_url)) {
    const u = newURL(newURL(_url).searchParams.get('u'));
    return softClarifyURL(u, base);
  }

  return clarifyURL(_url, base, { hard: true });
}

/**
 * Strip useless search parameters
 *
 * @param {String|URL} url
 * @returns {String} href
 */
function clarifyURL(url, base, options = {}) {
  let u = newURL(url, base);
  if (u.href.includes('#') && !u.hash) {
    // <a href="#">
    return '#';
  }

  const good = clarifyObject(u.searchParams, options);
  const badKeys = [];
  for (const key of keyIterator(u.searchParams)) {
    if (!(key in good)) {
      badKeys.push(key);
    }
  }

  for (const key of badKeys) {
    u.searchParams.delete(key);
  }

  return u.href;
}

function clarifyObject(bad, options) {
  const useless = SOFT_USELESS.slice();
  const patterns = SOFT_PATTERNS.slice();
  const useful = SOFT_USEFUL.slice();

  if (options.hard) {
    useless.push(...HARD_USELESS);
    patterns.push(...HARD_PATTERNS);
    useful.push(...HARD_USEFUL);
  }

  const good = Objectify(bad);

  for (const key of keyIterator(bad)) {
    if (!useful.includes(key) && patterns.some((p) => p.test(key)) || useless.includes(key)) {
      delete good[key];
    }
  }

  return good;
}

function log$Object(bad, good, title = 'Object') {
  if (!DEBUG_MODE) { return; }

  const { both, striped, added } = diffObjectKeys(bad, good);

  console.groupCollapsed(title);

  console.log('lefted:');
  both.forEach((k) => console.log(`  ${k}`));

  console.log('striped:');
  striped.forEach((k) => console.log(`  ${k}`));

  console.log('added:');
  added.forEach((k) => console.log(`  ${k}`));

  console.groupEnd(title);
}

function log$URL(bad, good, title = '') {
  if (!DEBUG_MODE) { return; }

  const [b, g] = [newURL(bad), newURL(good)];
  const groupName = title || ((url) => {
    const u = newURL(url);
    u.search = '';
    return u.href;
  })(g);

  const { both, striped } = diffObjectKeys(b.searchParams, g.searchParams);

  console.groupCollapsed(groupName);

  console.log('lefted:');
  both.forEach((k) => console.log(`  ${k}`));

  console.log('striped:');
  striped.forEach((k) => console.log(`  ${k}`));

  console.groupEnd(groupName);
}

if (location.hostname.includes('facebook.com')) {
  document.addEventListener('mousedown', (event) => {
    const ta = event.target.closest('a');

    if (!ta) {
      return;
    }

    const href = ta.getAttribute('href');
    if (href) {
      const good = hardClarifyURL(ta.href);
      log$URL(ta.href, good, 'ta[href]');
      ta.href = good;
    }

    const ajaxify = ta.getAttribute('ajaxify');
    if (ajaxify) {
      const good = hardClarifyURL(ajaxify).replace(location.origin, '');
      log$URL(ajaxify, good, 'ta[ajaxify]');
      ta.setAttribute('ajaxify', good);
    }

    const lynxUri = ta.dataset.lynxUri;
    if (lynxUri) {
      const good = hardClarifyURL(lynxUri);
      log$URL(lynxUri, good, 'ta[data-lynx-uri]');
      ta.dataset.lynxUri = good;
    }
  });
}

document.addEventListener('readystatechange', () => {
  const sp = new URLSearchParams(location.search);
  const options = location.hostname.includes('facebook.com') ? { hard: true } : {};
  const goodSearch = new URLSearchParams(clarifyObject(sp, options)).toString();
  const goodURL = newURL(location.href);
  goodURL.search = goodSearch;
  history.replaceState(history.state, document.title, goodURL);
});
