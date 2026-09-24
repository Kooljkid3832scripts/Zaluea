/* Zaluea stealth v3: tab cloak, panic key, about:blank, themes */
(function () {
  const CLOAKS = {
    classroom: { title: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    docs: { title: 'Google Docs', icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico' },
    drive: { title: 'Home - Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    khan: { title: 'Khan Academy | Free Online Courses', icon: 'https://cdn.kastatic.org/images/favicon.ico' },
    clever: { title: 'Clever | Log in', icon: 'https://assets.clever.com/favicon.ico' },
    zaluea: { title: 'Zaluea', icon: 'images/logo.png' }
  };

  function setFavicon(url) {
    let link = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png';
    link.href = url;
  }

  function applyCloak(name) {
    const c = CLOAKS[name] || CLOAKS.classroom;
    document.title = c.title;
    setFavicon(c.icon);
    try { localStorage.setItem('z_cloak', name); } catch (e) {}
    markSelected();
  }

  function applyCustom(title, icon) {
    if (title) { document.title = title; try { localStorage.setItem('z_title', title); } catch (e) {} }
    if (icon) { setFavicon(icon); try { localStorage.setItem('z_icon', icon); } catch (e) {} }
  }

  function applyTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem('z_theme', name); } catch (e) {}
    markSelected();
  }

  function markSelected() {
    try {
      const c = localStorage.getItem('z_cloak');
      document.querySelectorAll('[data-cloak]').forEach((b) => {
        b.classList.toggle('sel', b.getAttribute('data-cloak') === c);
      });
      const t = localStorage.getItem('z_theme') || 'cherri';
      document.querySelectorAll('[data-theme-pick]').forEach((b) => {
        b.classList.toggle('sel', b.getAttribute('data-theme-pick') === t);
      });
    } catch (e) {}
  }

  function restoreSaved() {
    try {
      const t = localStorage.getItem('z_title');
      const i = localStorage.getItem('z_icon');
      const c = localStorage.getItem('z_cloak');
      if (t) document.title = t;
      else if (c && CLOAKS[c]) { document.title = CLOAKS[c].title; }
      if (i) setFavicon(i);
      else if (c && CLOAKS[c]) setFavicon(CLOAKS[c].icon);
      const pk = localStorage.getItem('z_panic');
      if (pk) { const el = document.getElementById('panicKey'); if (el) el.value = pk; }
      const st = localStorage.getItem('z_stealth');
      if (st !== null) { const el = document.getElementById('stealthToggle'); if (el) el.checked = st === '1'; }
      markSelected();
    } catch (e) {}
  }

  function panic() {
    // No history trace of the proxy page: replace with Classroom
    applyCloak('classroom');
    location.replace('https://classroom.google.com');
  }

  function openBlank() {
    const url = location.href;
    const w = window.open('about:blank', '_blank');
    if (!w) { alert('Allow popups to use about:blank mode.'); return; }
    w.document.write(
      "<!DOCTYPE html><html><head><title>Google Classroom</title>" +
      "<link rel='icon' href='https://ssl.gstatic.com/classroom/favicon.png'></head>" +
      "<body style='margin:0'><iframe src='" + url.replace(/'/g, '') + "' style='border:none;width:100vw;height:100vh'></iframe></body></html>"
    );
    w.document.close();
  }

  function getPanicKey() {
    try { return localStorage.getItem('z_panic') || ']'; } catch (e) { return ']'; }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === getPanicKey() && !e.ctrlKey && !e.metaKey && document.activeElement && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      panic();
    }
  });

  // Drawer wiring (runs on pages that have the drawer)
  document.addEventListener('DOMContentLoaded', () => {
    restoreSaved();
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const open = () => { if (drawer) drawer.hidden = false; if (overlay) overlay.hidden = false; };
    const close = () => { if (drawer) drawer.hidden = true; if (overlay) overlay.hidden = true; };
    const sBtn = document.getElementById('settingsBtn');
    const cBtn = document.getElementById('drawerClose');
    if (sBtn) sBtn.onclick = open;
    if (cBtn) cBtn.onclick = close;
    if (overlay) overlay.onclick = close;

    document.querySelectorAll('[data-cloak]').forEach((b) => {
      b.onclick = () => {
        try { localStorage.removeItem('z_title'); localStorage.removeItem('z_icon'); } catch (e) {}
        applyCloak(b.getAttribute('data-cloak'));
      };
    });

    document.querySelectorAll('[data-theme-pick]').forEach((b) => {
      b.onclick = () => applyTheme(b.getAttribute('data-theme-pick'));
    });

    const cloakBtn = document.getElementById('cloakBtn');
    const cloakBtn2 = document.getElementById('cloakBtn2');
    if (cloakBtn) cloakBtn.onclick = () => applyCloak('classroom');
    if (cloakBtn2) cloakBtn2.onclick = () => applyCloak('classroom');

    const blankBtn = document.getElementById('blankBtn');
    const blankBtn2 = document.getElementById('blankBtn2');
    if (blankBtn) blankBtn.onclick = openBlank;
    if (blankBtn2) blankBtn2.onclick = openBlank;

    const applyBtn = document.getElementById('applyCustom');
    if (applyBtn) applyBtn.onclick = () => {
      const t = document.getElementById('customTitle').value.trim();
      const i = document.getElementById('customIcon').value.trim();
      applyCustom(t, i);
    };

    const pk = document.getElementById('panicKey');
    if (pk) pk.onchange = () => { try { localStorage.setItem('z_panic', pk.value || ']'); } catch (e) {} };

    const st = document.getElementById('stealthToggle');
    if (st) st.onchange = () => { try { localStorage.setItem('z_stealth', st.checked ? '1' : '0'); } catch (e) {} };

    const reset = document.getElementById('resetBtn');
    if (reset) reset.onclick = () => {
      ['z_title', 'z_icon', 'z_cloak', 'z_panic', 'z_stealth', 'z_bare', 'z_theme'].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
      applyCloak('zaluea');
      applyTheme('cherri');
      location.reload();
    };

    try {
      const bt = document.getElementById('blankToggle');
      if (bt) {
        bt.checked = localStorage.getItem('z_autoblank') === '1';
        bt.onchange = () => { try { localStorage.setItem('z_autoblank', bt.checked ? '1' : '0'); } catch (e) {} };
      }
    } catch (e) {}
  });

  window.ZalueaStealth = { applyCloak, applyCustom, applyTheme, panic, openBlank, CLOAKS };
})();
