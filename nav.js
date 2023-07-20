const activeTab = 'combine';
const nav = document.querySelector('nav');

nav.addEventListener('click', event => {
  /**
   * @type HTMLElement | null
   */
  const link = event.target.closest('a');

  if (!link) {
    return;
  }

  for (const a of nav.querySelectorAll('a')) {
    const active = a === link;

    if (active) {
      a.setAttribute('aria-selected', 'true');
    } else {
      a.removeAttribute('aria-selected');
    }

    document.querySelector(a.getAttribute('href')).style.display = active
      ? 'block'
      : 'none';
  }
});
