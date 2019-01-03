/* global hardClarifyURL */

document.addEventListener('mousedown', (event) => {
  const ta = event.target.closest('a');

  if (!ta) {
    return;
  }

  const href = ta.getAttribute('href');
  if (href) {
    const good = hardClarifyURL(ta.href);
    // console.info('ta[href]', ta.href, '→', good);
    ta.href = good;
  }

  const ajaxify = ta.getAttribute('ajaxify');
  if (ajaxify) {
    const good = hardClarifyURL(ajaxify).replace(location.origin, '');
    // console.info('ta[ajaxify]', ajaxify, '→', good);
    ta.setAttribute('ajaxify', good);
  }
});

// Chrome
if (navigator.userAgent.includes('Chrome')) {
  chrome.runtime.onMessage.addListener((info) => {
    if (info.type === 'clipboard-write') {
      const inputEl = document.createElement('input');
      inputEl.value = info.msg;
      document.body.appendChild(inputEl);
      inputEl.select();
      document.execCommand('copy');
      inputEl.remove();
    }
  });
}
