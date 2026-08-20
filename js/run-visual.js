/* RUN 67 — smooth runner visual layer */
(function(){
 const overlay=document.getElementById('miniOverlay'),title=document.getElementById('miniTitle');if(!overlay||!title)return;
 const sync=()=>overlay.classList.toggle('run-mode',title.textContent.includes('Забег'));
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});sync();
 const getState=()=>typeof miniState!=='undefined'?miniState:null;
 window.drawRun=function(c){const s=getState();if(!s||s.type!=='run')return;const w=s.w,h=s.h,t=performance.now()/1000;c.clearRect(0,0,w,h);
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#101833');sky.addColorStop(.5,'#42245c');sky.addColorStop(.72,'#a04f6b');sky.addColorStop(1,'#120b18');c.fillStyle=sky;c.fillRect(0,0,w,h);
  const glow=c.createRadialGradient(w*.5,h*.52,5,w*.5,h*.52,w*.7);glow.addColorStop(0,'rgba(255,178,110,.24)');glow.addColorStop(.55,'rgba(143,80,255,.08)');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.fillRect(0,0,w,h);
  for(let i=0;i<48;i++){const x=(i*113+19)%w,y=(i*47+13)%(h*.48);c.fillStyle=i%7?'rgba(255,255,255,.5)':'rgba(255,215,242,.9)';c.fillRect(x,y,i%8?1:2,i%8?1:2)}
  c.save();c.shadowColor='#e8d5ff';c.shadowBlur=24;c.fillStyle='#fff6ff';c.beginPath();c.arc(w*.82,h*.17,24,0,Math.PI*2);c.fill();c.restore();
  const cityY=h*.68;for(let i=0;i<24;i++){const bw=30+(i*23)%52,bh=38+(i*37)%Math.max(45,Math.floor(h*.27)),x=((i*86-s.distance*.10)%(w+130))-65;c.fillStyle=i%4===0?'#211432':'#100d20';c.fillRect(x,cityY-bh,bw,bh);for(let y=cityY-bh+12;y<cityY-8;y+=17)if((i+Math.floor(y))%3){c.fillStyle='rgba(255,205,104,.62)';c.fillRect(x+8,y,5,3);if(bw>45)c.fillRect(x+bw-14,y,5,3)}}
  const roadY=h*.70,rg=c.createLinearGradient(0,roadY,0,h);rg.addColorStop(0,'#3a3341');rg.addColorStop(.35,'#211c27');rg.addColorStop(1,'#0b0a10');c.fillStyle=rg;c.fillRect(0,roadY,w,h-roadY);
  c.strokeStyle='rgba(255,151,218,.32)';c.lineWidth=2;c.beginPath();c.moveTo(0,roadY);c.lineTo(w,roadY);c.stroke();
  // calm road motion
  const dash=(s.distance*1.05)%88;for(let x=-88+dash;x<w+88;x+=88){c.fillStyle='rgba(255,255,255,.42)';c.fillRect(x,h-39,38,4)}
  // slow parallax lamps
  for(let i=0;i<8;i++){const x=((i*175-s.distance*.32)%(w+190))-55;c.save();c.shadowColor='#a86cff';c.shadowBlur=13;c.fillStyle='#bd9aff';c.fillRect(x,roadY-43,3,43);c.fillStyle='#ffe6fa';c.fillRect(x-4,roadY-44,11,5);c.restore()}
  (s.items||[]).forEach(o=>drawObject(c,o,t));(s.particles||[]).forEach(p=>{c.globalAlpha=Math.max(0,p.life/18);c.fillStyle='#ffd95a';c.shadowColor='#ffd95a';c.shadowBlur=7;c.beginPath();c.arc(p.x,p.y,2.5,0,Math.PI*2);c.fill()});c.globalAlpha=1;c.shadowBlur=0;drawRunner(c,s.player,t);
 };
 function drawObject(c,o,t){c.save();c.translate(o.x,o.y);if(o.kind==='coin'){const pulse=1+Math.sin(t*4.5+o.x*.02)*.05;c.translate(o.w/2,o.h/2);c.scale(pulse,1);c.shadowColor='#ffd34d';c.shadowBlur=18;const g=c.createRadialGradient(-4,-5,2,0,0,15);g.addColorStop(0,'#fffbd0');g.addColorStop(.5,'#ffd34d');g.addColorStop(1,'#c87500');c.fillStyle=g;c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff1a0';c.lineWidth=2;c.stroke();c.fillStyle='#684100';c.font='900 9px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,1);c.restore();return}
  if(o.kind==='spike'){c.shadowColor='#ff4d9f';c.shadowBlur=14;c.fillStyle='#ff4f9d';c.beginPath();c.moveTo(0,o.h);c.lineTo(o.w*.2,o.h*.25);c.lineTo(o.w*.38,o.h);c.lineTo(o.w*.52,0);c.lineTo(o.w*.7,o.h);c.lineTo(o.w,o.h);c.closePath();c.fill();c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.55)';c.stroke()}
  else if(o.kind==='wall'){const g=c.createLinearGradient(0,0,o.w,o.h);g.addColorStop(0,'#b391ff');g.addColorStop(.5,'#6845d8');g.addColorStop(1,'#29155f');c.shadowColor='#8055ff';c.shadowBlur=16;c.fillStyle=g;rr(c,0,0,o.w,o.h,9);c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.28)';c.strokeRect(5,5,o.w-10,o.h-10);c.fillStyle='#eee5ff';c.font='900 9px Arial';c.textAlign='center';c.fillText('67',o.w/2,o.h/2+3)}
  else{const g=c.createLinearGradient(0,0,0,o.h);g.addColorStop(0,'#ff9b63');g.addColorStop(1,'#9b3040');c.shadowColor='#ff694f';c.shadowBlur=13;c.fillStyle=g;rr(c,0,0,o.w,o.h,8);c.shadowBlur=0;c.strokeStyle='rgba(255,235,190,.65)';c.strokeRect(5,5,o.w-10,o.h-10);c.fillStyle='#ffd76d';c.font='900 11px Arial';c.textAlign='center';c.fillText('67',o.w/2,o.h/2+4)}c.restore()}
 function drawRunner(c,p,t){if(!p)return;const a=t*6.5,sw=Math.sin(a),lift=Math.max(0,Math.sin(a))*2.2,squash=1+Math.abs(sw)*.025;c.save();c.translate(p.x,p.y-lift);c.scale(1.12*squash,1.12/squash);
  // soft ground shadow
  c.fillStyle='rgba(0,0,0,.42)';c.beginPath();c.ellipse(0,31,30,6,0,0,Math.PI*2);c.fill();
  // smooth opposite arm/leg cycle
  limb(c,'#4a229f',-6,13,-15+sw*8,22,-25+sw*14,29,8);limb(c,'#7041db',6,13,15-sw*8,22,25-sw*14,29,8);shoe(c,-31+sw*14,27);shoe(c,24-sw*14,27);
  limb(c,'#6332ca',-14,-3,-25-sw*7,5,-29-sw*9,13,7);limb(c,'#9565ff',14,-3,25+sw*7,5,29+sw*9,13,7);
  let b=c.createLinearGradient(-18,-15,18,20);b.addColorStop(0,'#d9c9ff');b.addColorStop(.4,'#8a58ef');b.addColorStop(1,'#43239d');c.fillStyle=b;rr(c,-18,-15,36,34,10);
  c.strokeStyle='rgba(255,255,255,.42)';c.lineWidth=1;c.beginPath();c.moveTo(0,-10);c.lineTo(0,14);c.moveTo(-13,-5);c.lineTo(-5,-1);c.moveTo(13,-5);c.lineTo(5,-1);c.stroke();c.fillStyle='rgba(255,255,255,.2)';rr(c,-9,-2,18,12,4);c.fillStyle='#fff';c.font='900 10px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,4);
  c.fillStyle='#efb28f';c.fillRect(-5,-20,10,8);c.beginPath();c.arc(0,-30,16,0,Math.PI*2);c.fill();c.beginPath();c.arc(-15,-30,4,0,Math.PI*2);c.arc(15,-30,4,0,Math.PI*2);c.fill();
  c.fillStyle='#241a2f';c.beginPath();c.moveTo(-15,-31);c.quadraticCurveTo(-16,-46,0,-47);c.quadraticCurveTo(17,-46,15,-29);c.lineTo(9,-34);c.lineTo(5,-40);c.lineTo(0,-34);c.lineTo(-5,-41);c.lineTo(-10,-33);c.closePath();c.fill();
  c.fillStyle='#2b1c2b';c.beginPath();c.arc(-5,-29,2.2,0,Math.PI*2);c.arc(5,-29,2.2,0,Math.PI*2);c.fill();c.strokeStyle='#a55f55';c.lineWidth=1.2;c.beginPath();c.arc(0,-25,4,0,Math.PI);c.stroke();c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.arc(-6,-38,4,0,Math.PI*2);c.fill();c.fillStyle='#39206e';rr(c,-22,-8,7,20,3);c.fillStyle='#a77cff';c.fillRect(-20,-4,3,10);c.restore()}
 function limb(c,col,x1,y1,x2,y2,x3,y3,width){c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.stroke()}
 function shoe(c,x,y){const g=c.createLinearGradient(x,y,x+16,y+8);g.addColorStop(0,'#fff');g.addColorStop(1,'#aaa5c2');c.fillStyle=g;rr(c,x,y,16,8,3);c.fillStyle='#7047dc';c.fillRect(x+3,y+5,10,2)}
 function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fill()}
})();