// Chrome
if (navigator.userAgent.includes('Chrome')) {
  browser.runtime.onMessage.addListener((info) => {
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
