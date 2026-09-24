/* Zaluea proxy frontend v3: self-hosted bare + public rotation, loader, custom bare */
(function () {
  // Free public bare servers, used ONLY if your own /bare/ backend is unreachable
  // (e.g. static hosting with no `npm start`). Community-run: can be slow or die.
  // You can add your own in Settings → Proxy backend.
  const PUBLIC_BARES = [
    'https://tomp.app/bare/',
    'https://bare.uriahfoster.com/bare/',
    'https://bare.holyubofficial.net/bare/',
    'https://bare.playrservers.tk/bare/'
  ];

  const form = document.getElementById('proxyForm');
  const input = document.getElementById('proxyInput');
  const errBox = document.getElementById('proxyError');
  const pill = document.getElementById('statusPill');
  const bareLabel = document.getElementById('bareLabel');
  const diagBox = document.getElementById('diagBox');
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loaderText');

  function loading(on, text) {
    if (!loader) return;
    loader.hidden = !on;
    if (text && loaderText) loaderText.textContent = text;
  }

  function diag(html) {
    if (diagBox) diagBox.innerHTML = html;
  }

  function showError(msg) {
    loading(false);
    if (!errBox) { alert(msg); return; }
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  function setPill(mode, text) {
    if (!pill) return;
    pill.className = 'pill ' + mode;
    pill.textContent = text;
  }

  function isUrl(val = '') {
    val = val.trim();
    if (/^https?:\/\//i.test(val)) return true;
    if (val.includes('.') && !val.includes(' ') && val.length > 3) return true;
    return false;
  }

  function normalizeUrl(val) {
    val = val.trim();
    if (!isUrl(val)) return 'https://www.google.com/search?q=' + encodeURIComponent(val);
    if (!/^https?:\/\//i.test(val)) return 'https://' + val;
    return val;
  }

  async function bareWorks(base) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(base, { signal: ctrl.signal });
      clearTimeout(t);
      return r.ok;
    } catch (e) { return false; }
  }

  function shortBare(b) {
    try {
      const u = new URL(b, location.href);
      if (u.origin === location.origin) return 'self-hosted ✓';
      return u.host;
    } catch (e) { return b; }
  }

  async function ensureBare(forceAuto) {
    // 1) explicit custom backend (Settings)
    try {
      const saved = localStorage.getItem('z_bare');
      if (saved && !forceAuto) {
        __uv$config.bare = saved;
        if (bareLabel) bareLabel.textContent = 'bare: ' + shortBare(saved);
        setPill('online', 'proxy ready');
        diag('<b>backend:</b> ' + saved + '<br><b>mode:</b> custom');
        return saved;
      }
    } catch (e) {}

    // 2) self-hosted (free, no key) — primary
    setPill('checking', 'checking…');
    diag('backend: checking self-hosted /bare/ …');
    if (await bareWorks('/bare/')) {
      __uv$config.bare = '/bare/';
      try { localStorage.removeItem('z_bare'); } catch (e) {}
      if (bareLabel) bareLabel.textContent = 'bare: self-hosted ✓';
      setPill('online', 'proxy online');
      diag('<b>backend:</b> self-hosted /bare/<br><b>mode:</b> auto');
      return '/bare/';
    }
    if (await bareWorks('/api/')) {
      __uv$config.bare = '/api/';
      try { localStorage.removeItem('z_bare'); } catch (e) {}
      if (bareLabel) bareLabel.textContent = 'bare: self-hosted ✓';
      setPill('online', 'proxy online');
      diag('<b>backend:</b> self-hosted /api/<br><b>mode:</b> auto');
      return '/api/';
    }

    // 3) public rotation (for static hosts / school Chromebooks)
    setPill('checking', 'finding proxy…');
    for (const url of PUBLIC_BARES) {
      diag('backend: trying public ' + url + ' …');
      if (await bareWorks(url)) {
        __uv$config.bare = url;
        try { localStorage.setItem('z_bare', url); } catch (e) {}
        if (bareLabel) bareLabel.textContent = 'bare: ' + shortBare(url);
        setPill('offline', 'public proxy');
        diag('<b>backend:</b> ' + url + '<br><b>mode:</b> public fallback (slower)');
        return url;
      }
    }

    setPill('offline', 'backend offline');
    diag('<b>backend:</b> none reachable<br><b>sw:</b> ' + ('serviceWorker' in navigator ? 'supported' : 'NOT supported'));
    return null;
  }

  async function ensureSW() {
    if (!('serviceWorker' in navigator)) {
      throw new Error(
        'Service workers are blocked in this browser. ' +
        'On a school Chromebook: host these files over HTTPS (GitHub Pages / Netlify / Cloudflare Pages), ' +
        'then open with ⧉ Blank. file:// and some locked-down profiles block proxy workers.'
      );
    }
    await navigator.serviceWorker.register('./sw.js', { scope: __uv$config.prefix });
    await navigator.serviceWorker.ready;
  }

  function stealthEnabled() {
    try { return localStorage.getItem('z_stealth') !== '0'; } catch (e) { return true; }
  }

  // --- Viewer (keeps address bar clean) ---
  const viewer = document.getElementById('viewer');
  const frame = document.getElementById('viewerFrame');
  const vUrl = document.getElementById('viewerUrl');

  function openViewer(proxied, original) {
    if (!viewer) { location.href = proxied; return; }
    viewer.hidden = false;
    document.body.style.overflow = 'hidden';
    frame.src = proxied;
    if (vUrl) vUrl.value = original;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }

  function closeViewer() {
    if (!viewer) return;
    viewer.hidden = true;
    document.body.style.overflow = '';
    frame.removeAttribute('src');
  }

  async function go(raw) {
    if (!raw || !raw.trim()) return;
    loading(true, 'Connecting to proxy…');
    const target = normalizeUrl(raw);
    const bare = await ensureBare();
    if (!bare) {
      showError(
        'Proxy backend offline.\n\n' +
        '• On your own PC: run `npm start` in the project folder, then reload.\n' +
        '• On a school Chromebook (no Node): host this folder on any static host ' +
        '(GitHub Pages / Netlify / Cloudflare Pages) over HTTPS and it will auto-use a public backend.\n' +
        '• Or paste any working bare URL in ⚙ Settings → Proxy backend.'
      );
      return;
    }
    loading(true, 'Starting secure worker…');
    try { await ensureSW(); }
    catch (e) { showError('Could not start proxy worker:\n\n' + e.message); return; }
    let encoded;
    try { encoded = __uv$config.prefix + __uv$config.encodeUrl(target); }
    catch (e) { showError('Encoder failed, reloading…'); setTimeout(() => location.reload(), 800); return; }

    loading(false);
    if (stealthEnabled() && viewer) openViewer(encoded, target);
    else location.href = encoded;
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureBare();

    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); go(input.value); });

    document.querySelectorAll('.chips button').forEach((b) => {
      b.addEventListener('click', () => go(b.getAttribute('data-url')));
    });

    // viewer controls
    const back = document.getElementById('viewerBack');
    const fwd = document.getElementById('viewerFwd');
    const rel = document.getElementById('viewerReload');
    const vg = document.getElementById('viewerGo');
    const vo = document.getElementById('viewerOpen');
    const vc = document.getElementById('viewerClose');
    if (back) back.onclick = () => { try { frame.contentWindow.history.back(); } catch (e) {} };
    if (fwd) fwd.onclick = () => { try { frame.contentWindow.history.forward(); } catch (e) {} };
    if (rel) rel.onclick = () => { try { frame.contentWindow.location.reload(); } catch (e) {} };
    if (vg) vg.onclick = () => go(vUrl.value);
    if (vUrl) vUrl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(vUrl.value); } });
    if (vo) vo.onclick = () => { try { window.open(frame.src, '_blank'); } catch (e) {} };
    if (vc) vc.onclick = closeViewer;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && viewer && !viewer.hidden) closeViewer(); });

    // custom backend controls
    const cb = document.getElementById('customBare');
    const useC = document.getElementById('useCustomBare');
    const useA = document.getElementById('useAutoBare');
    try { if (cb) cb.value = localStorage.getItem('z_bare') || ''; } catch (e) {}
    if (useC) useC.onclick = async () => {
      const v = (cb.value || '').trim();
      if (!v) return;
      const fixed = v.endsWith('/') ? v : v + '/';
      loading(true, 'Testing custom backend…');
      if (await bareWorks(fixed)) {
        try { localStorage.setItem('z_bare', fixed); } catch (e) {}
        __uv$config.bare = fixed;
        setPill('online', 'proxy ready');
        if (bareLabel) bareLabel.textContent = 'bare: ' + shortBare(fixed);
        diag('<b>backend:</b> ' + fixed + '<br><b>mode:</b> custom ✓');
      } else {
        diag('<b>backend:</b> ' + fixed + ' — NOT reachable ✕');
        showError('That backend is not reachable. It must be a bare server root ending in / (try opening it in a tab — a working one returns JSON).');
        return;
      }
      loading(false);
    };
    if (useA) useA.onclick = async () => {
      loading(true, 'Auto-detecting…');
      try { localStorage.removeItem('z_bare'); } catch (e) {}
      if (cb) cb.value = '';
      await ensureBare(true);
      loading(false);
    };

    // auto-blank launch
    try {
      if (localStorage.getItem('z_autoblank') === '1' && window.top === window.self && !sessionStorage.getItem('z_blanked')) {
        sessionStorage.setItem('z_blanked', '1');
        if (window.ZalueaStealth) window.ZalueaStealth.openBlank();
      }
    } catch (e) {}
  });

  window.zalueaGo = go;
})();
