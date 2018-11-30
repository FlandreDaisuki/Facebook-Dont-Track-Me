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

    for (const key of useless) {
      url.searchParams.delete(key);
    }

    location.assign(url.href);
  }
});
