/* Backwards-compat shim: old pages called settings()/updates()/titleSet()/quickLink().
   Real logic now lives in stealth.js + index.js. */
function settings() {
  const d = document.getElementById('drawer');
  const o = document.getElementById('drawerOverlay');
  if (d) d.hidden = false;
  if (o) o.hidden = false;
}
function updates() {
  const el = document.getElementById('updatespage');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function titleSet(t) {
  if (window.ZalueaStealth) window.ZalueaStealth.applyCustom(t, '');
}
function iconSet(u) {
  if (window.ZalueaStealth) window.ZalueaStealth.applyCustom('', u);
}
// legacy typo name
function icoSet(u) { iconSet(u); }
function reset() {
  try { localStorage.clear(); } catch (e) {}
  location.reload();
}
function quickLink(enc) {
  try {
    const url = __uv$config.decodeUrl(enc);
    if (window.zalueaGo) window.zalueaGo(url);
    else location.href = __uv$config.prefix + enc;
  } catch (e) {
    location.href = __uv$config.prefix + enc;
  }
}
