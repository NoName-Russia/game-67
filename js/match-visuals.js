(() => {
  const originalDrawMatch = window.drawMatch;
  if (typeof originalDrawMatch !== 'function') return;

  window.drawMatch = function(ctx) {
    originalDrawMatch(ctx);
    const s = window.miniState;
    if (!s || !s.board || !s.cell) return;

    const icons = ['★','◆','✦','♛'];
    const colors = ['#ffffff','#fff7ff','#eaffff','#fffbe0'];
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 350);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let y = 0; y < s.n; y++) {
      for (let x = 0; x < s.n; x++) {
        const v = s.board[y][x];
        if (v === null || v === undefined) continue;

        const cx = s.offX + x * s.cell + s.cell / 2;
        const cy = s.offY + y * s.cell + s.cell / 2;
        const size = Math.max(18, s.cell * 0.30);

        // Закрываем старую надпись 67 мягким внутренним кругом.
        ctx.globalAlpha = 0.94;
        ctx.fillStyle = ['#8157ff','#ff4fc3','#35e8ff','#ffd34d'][v];
        ctx.beginPath();
        ctx.arc(cx, cy, s.cell * 0.20, 0, Math.PI * 2);
        ctx.fill();

        // Свой символ для каждого типа плитки.
        ctx.globalAlpha = 1;
        ctx.fillStyle = colors[v];
        ctx.font = `900 ${size}px Arial`;
        ctx.fillText(icons[v], cx, cy + 1);

        // Маленький живой блик.
        ctx.globalAlpha = 0.25 + pulse * 0.25;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - s.cell * 0.08, cy - s.cell * 0.08, Math.max(2, s.cell * 0.035), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };
})();