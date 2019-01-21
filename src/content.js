/* global hardClarifyURL log$URL */

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
