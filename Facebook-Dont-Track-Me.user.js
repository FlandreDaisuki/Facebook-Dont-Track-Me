// ==UserScript==
// @name         Facebook-Dont-Track-Me
// @namespace    https://github.com/FlandreDaisuki
// @version      1.0
// @description  Strip Facebook track parameters and clarify url
// @description:zh-TW 移除 Facebook 追蹤參數及淨化網址欄
// @author       FlandreDaisuki
// @include      *
// @grant        none
// @noframes
// ==/UserScript==

const useless = [
  '__tn__',
  '__xts__[0]',
  'eid',
  'ref',
  'fref',
  'hc_ref',
  'notif_id',
  'notif_t',
  'dti',
  'comment_tracking',
  'tn-str',
];

const url = new URL(location.href);

url.searchParams.delete('fbclid');

if (location.hostname === 'www.facebook.com') {
  for (const key of useless) {
    url.searchParams.delete(key);
  }
}

if (location.href !== url.href) {
  // 只能讓網址欄變漂亮，requests 還是會帶追蹤參數
  // 要在 request 移除追蹤參數，請安裝 webextension 版本

  // Just clarify url in address bar but the tracking parameters are still in requests
  // The webextension version can remove them from requests
  history.replaceState({}, document.title, url.href.replace(url.origin, ''));
}

// process <a> in www.facebook.com
if (location.hostname === 'www.facebook.com') {
  document.body.addEventListener('click', (event) => {
    const ta = event.target.closest('a');

    if (ta &&
        ta.target !== '_blank' &&
        !ta.classList.contains('see_more_link') &&
        ta.getAttribute('role') !== 'button' &&
        ta.getAttribute('href') !== '#' &&
        ta.rel !== 'ignore' &&
        ta.rel !== 'theater')
    {
      event.preventDefault();
      const url = new URL(ta.href);

      for (const key of useless) {
        url.searchParams.delete(key);
      }

      location.assign(url.href);
    }
  });
}
