const optionsData = {
  HideConsoleLog: true,
  has(attr) {
    return Object.prototype.hasOwnProperty.call(this, attr);
  },
};

const CaseTransKebabToTitle = (s) => {
  return s.replace(/(^|-)[a-z]/ig, (m) => m.slice(-1).toUpperCase());
};

const restoreOptions = () => {
  chrome.storage.sync.get('options', ({ options: storedOptionsData }) => {
    // console.debug('restoreOptions::storedOptionsData', storedOptionsData);

    Object.assign(optionsData, storedOptionsData);

    for (const optInput of document.querySelectorAll('input')) {
      const id = optInput.id;
      const titleCaseId = CaseTransKebabToTitle(id);

      if (optInput.type === 'checkbox' && optionsData.has(titleCaseId)) {
        optInput.checked = optionsData[titleCaseId];
      }
    }
  });
};

const saveOptions = () => {
  // console.debug('saveOptions::optionsData', optionsData);
  chrome.storage.sync.set({ options: optionsData });
};

document.addEventListener('DOMContentLoaded', restoreOptions);

for (const optInput of document.querySelectorAll('input')) {
  const id = optInput.id;
  const titleCaseId = CaseTransKebabToTitle(id);

  const labelEl = document.querySelector(`label[for="${id}"]`);
  labelEl.textContent = chrome.i18n.getMessage(CaseTransKebabToTitle(id));

  if (optInput.type === 'checkbox' && optionsData.has(titleCaseId)) {
    optInput.addEventListener('input', () => {
      optionsData[titleCaseId] = optInput.checked;
      saveOptions();
    });
  }
}
