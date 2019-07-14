/* global cleanUrl, createUrl, $Console, cleanUrlSearchParams, getBaseURI */

const $console = new $Console();

if (location.hostname.includes('facebook.com')) {
  document.addEventListener('mousedown', async(event) => {
    const $sp = (url) => createUrl(url).searchParams;

    const ta = event.target.closest('a');

    if (!ta) {
      return;
    }

    const href = ta.getAttribute('href');
    if (href) {
      const cleaned = cleanUrl(href, document.baseURI, { hard: true });
      $console.diff(`a[href] ${decodeURI(getBaseURI(cleaned))}`, $sp(href), $sp(cleaned));
      ta.href = cleaned;
    }

    const ajaxify = ta.getAttribute('ajaxify');
    if (ajaxify) {
      const cleaned = cleanUrl(ajaxify, document.baseURI, { hard: true });
      $console.diff(`a[ajaxify] ${decodeURI(getBaseURI(cleaned))}`, $sp(ajaxify), $sp(cleaned));
      ta.setAttribute('ajaxify', cleaned.replace(location.origin, ''));
    }

    const lynxUri = ta.dataset.lynxUri;
    if (lynxUri) {
      const cleaned = cleanUrl(lynxUri, document.baseURI, { hard: true });
      $console.diff(`a[data-lynx-uri] ${decodeURI(getBaseURI(cleaned))}`, $sp(lynxUri), $sp(cleaned));
      ta.dataset.lynxUri = cleaned;
    }
  });
}

document.addEventListener('readystatechange', () => {
  const bad = new URLSearchParams(location.search);
  const options = location.hostname.includes('facebook.com') ? { hard: true } : {};
  const good = cleanUrlSearchParams(bad, options).good;
  const cleaned = createUrl(location.href);
  cleaned.search = good;
  $console.diff(`⚡️ ${decodeURI(document.baseURI)}`, bad, good);
  history.replaceState(history.state, document.title, cleaned);
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
