/**
 * Strip useless search parameters
 *
 * @param {String|URL} url
 * @returns {String} href
 */
function clarifyURL(url) {
  const useless = [
    'eid',        // 動態的發文者/粉專使用者連結
    'ref',        // 左欄快捷連結
    'fref',       // 不知道從哪來但跟動態有關
    'source_ref', // 跟個人頁面有關
    'notif_id', // 右上角通知連結
    'notif_t',  // 右上角通知連結
    'dti',      // 不知道從來定位到個人頁面會出現
    'dpr',      // 不知道從來定位到個人頁面會出現
    'rc',      // 不知道從來定位到個人頁面會出現
    'comment_tracking', // 留言連結
    'tn-str',   // theater 模式的發文者連結
    'fbclid', // 元兇
    'extragetparams',
    'lst', // 跟個人頁面有關
    'source', // 跟 hashtag 有關
    'epa', // 跟 hashtag 有關
    'timeline_context_item_type', // 跟個人頁面經歷有關
    'timeline_context_item_source', // 跟個人頁面經歷有關
  ];

  const patterns = [
    /^_+/,
    /^hc_/,
    /^utm_/, // google analysis
  ];

  let u = new URL(url.toString());

  // No facebook redirect
  const isFacebookRedirect = (l) => {
    const u = new URL(l);
    u.search = '';
    return u.href === 'https://l.facebook.com/l.php';
  };

  if (isFacebookRedirect(u)) {
    u = new URL(u.searchParams.get('u'));
  }

  const badKeys = [];

  // Thanks this bug...
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1508174
  function* keyIterator() {
    const itor = u.searchParams.keys();

    while (1) {
      const { done, value } = itor.next();
      if (done) { return; }
      yield value;
    }
  }

  for (const key of keyIterator()) {
    if (patterns.some((p) => key.match(p)) || useless.includes(key)) {
      badKeys.push(key);
    }
  }

  for (const key of badKeys) {
    u.searchParams.delete(key);
  }

  return u.href;
}
