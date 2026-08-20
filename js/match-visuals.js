(() => {
  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  const icons = {
    '#8157ff': '★',
    '#ff4fc3': '◆',
    '#35e8ff': '✦',
    '#ffd34d': '♛'
  };

  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    const canvas = this.canvas;
    const isMatchCanvas = canvas && canvas.id === 'miniCanvas';
    const color = String(this.fillStyle).toLowerCase();

    if (isMatchCanvas && text === '67' && icons[color]) {
      const icon = icons[color];
      const oldFont = this.font;
      const size = Math.max(18, parseInt(oldFont.match(/(\d+(?:\.\d+)?)px/)?.[1] || '18', 10) * 1.15);

      this.save();
      this.font = `900 ${size}px Arial`;
      this.textAlign = 'center';
      this.textBaseline = 'middle';
      this.shadowBlur = 8;
      this.shadowColor = color;
      this.fillStyle = '#ffffff';
      originalFillText.call(this, icon, x, y, maxWidth);
      this.restore();
      return;
    }

    originalFillText.call(this, text, x, y, maxWidth);
  };
})();