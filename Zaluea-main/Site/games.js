/* Zaluea games */
(function () {
  const games = [
    { name: 'Flappy Bird', desc: 'Local · no proxy needed', path: 'games/flappybird/index.html', emoji: '🐤' },
    { name: 'YouTube', desc: 'Via proxy', proxy: 'https://www.youtube.com', emoji: '▶' },
    { name: 'TikTok', desc: 'Via proxy', proxy: 'https://www.tiktok.com', emoji: '♪' },
    { name: 'Discord', desc: 'Via proxy', proxy: 'https://discord.com', emoji: '◈' },
    { name: 'Twitch', desc: 'Via proxy', proxy: 'https://www.twitch.tv', emoji: '✦' }
  ];

  const grid = document.getElementById('gamesGrid');
  const wrap = document.getElementById('gameWrap');
  const frame = document.getElementById('gameFrame');
  const gname = document.getElementById('gameName');

  function openLocal(item) {
    gname.textContent = item.name;
    frame.src = item.path;
    wrap.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  async function openProxied(item) {
    try {
      if (!window.zalueaGo) {
        // games.html doesn't load index.js — do a minimal proxy launch here
        await navigator.serviceWorker.register('./sw.js', { scope: __uv$config.prefix });
        location.href = __uv$config.prefix + __uv$config.encodeUrl(item.proxy);
        return;
      }
      window.zalueaGo(item.proxy);
    } catch (e) {
      location.href = __uv$config.prefix + __uv$config.encodeUrl(item.proxy);
    }
  }

  games.forEach((g) => {
    const card = document.createElement('div');
    card.className = 'game-card glass';
    card.innerHTML = '<div class="thumb">' + g.emoji + '</div><h4></h4><p></p>';
    card.querySelector('h4').textContent = g.name;
    card.querySelector('p').textContent = g.desc;
    card.onclick = () => (g.path ? openLocal(g) : openProxied(g));
    grid.appendChild(card);
  });

  document.getElementById('closeBtn').onclick = () => {
    wrap.hidden = true;
    frame.removeAttribute('src');
    document.body.style.overflow = '';
  };
  document.getElementById('fsBtn').onclick = () => {
    if (frame.requestFullscreen) frame.requestFullscreen();
  };
  wrap.addEventListener('click', (e) => { if (e.target === wrap) document.getElementById('closeBtn').click(); });

  // legacy function names used by old inline handlers (kept for safety)
  window.loadGame = openLocal;
  window.closeGame = () => document.getElementById('closeBtn').click();
  window.fullscreenGame = () => document.getElementById('fsBtn').click();
})();
