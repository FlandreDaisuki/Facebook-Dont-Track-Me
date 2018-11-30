// ref: https://github.com/nboughton/nofbclid/blob/81f2e1c/nofbclid.js
function trackStrip(req) {
  const url = new URL(req.url);
  const cid = url.searchParams.get('fbclid');
  if (cid) {
    url.searchParams.delete('fbclid');
    return {
      redirectUrl: url.href,
    };
  }

  if (url.hostname.includes('facebook.com')) {

    // ignore upload.facebook.com
    if (url.hostname.startsWith('upload')) {
      return;
    }

    const useless = [
      '__tn__',     // 動態所有連結
      '__xts__[0]', // 動態所有連結
      'eid',        // 動態的發文者/粉專使用者連結
      'ref',        // 左欄快捷連結
      'fref',       // 不知道從哪來但跟動態有關
      'hc_ref',   // 動態的被分享者連結
      'notif_id', // 右上角通知連結
      'notif_t',  // 右上角通知連結
      'dti',      // 不知道從來定位到個人頁面會出現
      'comment_tracking', // 留言連結
      'tn-str',   // theater 模式的發文者連結
    ];

    for (const key of useless) {
      url.searchParams.delete(key);
    }

    if (req.url !== url.href) {
      return {
        redirectUrl: url.href,
      };
    }
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  trackStrip,
  { urls: ['<all_urls>'] },
  ['blocking']
);
