/* global clarifyURL */

document.addEventListener('mousedown', (event) => {
  const ta = event.target.closest('a');

  if (!ta) {
    return;
  }

  if (isNeedClarifyA(ta)) {
    const good = clarifyURL(ta.href);
    ta.href = good;
  }

  const ajaxify = ta.getAttribute('ajaxify');
  if (ajaxify) {
    const good = clarifyURL(ajaxify);
    ta.setAttribure('ajaxify', good);
  }
});

function isNeedClarifyA(el) {
  return el.target !== '_blank' &&
    !el.classList.contains('see_more_link') &&
    el.getAttribute('role') !== 'button' &&
    el.getAttribute('href') !== '#' &&
    el.rel !== 'ignore' &&
    el.rel !== 'theater';
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
