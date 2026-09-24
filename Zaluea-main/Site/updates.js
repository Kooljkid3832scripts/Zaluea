/* Zaluea updates feed (edit messages here) */
(function () {
  const updates = [
    { message: 'Welcome to Zaluea 2.0 — new look, faster proxy, stealth mode.' },
    { message: 'Tip: press ] anywhere to panic-cloak to Google Classroom.' },
    { message: 'Tip: use ⧉ Blank to hide the URL entirely.' }
  ];
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.getElementById('updatespage');
    if (!page) return;
    updates.forEach((u) => {
      const div = document.createElement('div');
      div.className = 'message';
      div.textContent = u.message;
      page.appendChild(div);
    });
  });
})();
