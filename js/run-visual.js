(function(){
 const overlay=document.getElementById('miniOverlay');
 const title=document.getElementById('miniTitle');
 if(!overlay||!title)return;
 const sync=()=>overlay.classList.toggle('run-mode',title.textContent.includes('Забег'));
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true}); sync();

 window.drawRun=function(ctx){
  const s=window.miniState;if(!s)return;const w=s.w,h=s.h,t=performance.now()/1000;
  ctx.clearRect(0,0,w,h);
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#07051b');sky.addColorStop(.5,'#241040');sky.addColorStop(1,'#100717');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  // atmospheric glow
  const glow=ctx.createRadialGradient(w*.5,h*.35,20,w*.5,h*.35,w*.65);glow.addColorStop(0,'rgba(125,75,255,.20)');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  // moon
  ctx.fillStyle='rgba(244,232,255,.9)';ctx.shadowColor='#caaaff';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(w*.8,h*.19,25,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  // skyline
  const base=h*.70;for(let i=0;i<22;i++){let bw=30+(i*17)%50,bh=35+(i*29)%(h*.28),x=((i*81-s.distance*.18)%(w+100))-50;ctx.fillStyle=i%3?'#0b0a18':'#120d22';ctx.fillRect(x,base-bh,bw,bh);for(let yy=base-bh+10;yy<base-8;yy+=15){if((i+yy)%3){ctx.fillStyle='rgba(255,194,82,.5)';ctx.fillRect(x+7,yy,4,3);}}}
  // road
  const road=ctx.createLinearGradient(0,base,0,h);road.addColorStop(0,'#292333');road.addColorStop(1,'#09080f');ctx.fillStyle=road;ctx.fillRect(0,base,w,h-base);
  ctx.strokeStyle='rgba(194,145,255,.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,base);ctx.lineTo(w,base);ctx.stroke();
  const off=(s.distance*2)%54;ctx.fillStyle='rgba(255,255,255,.35)';for(let x=-54+off;x<w;x+=54)ctx.fillRect(x,h-36,28,3);
  // neon lamps
  for(let i=0;i<9;i++){let x=((i*145-s.distance*.7)%(w+160))-40;ctx.shadowColor='#9b62ff';ctx.shadowBlur=16;ctx.fillStyle='#b88aff';ctx.fillRect(x,base-38,3,38);ctx.fillStyle='#f7d6ff';ctx.fillRect(x-3,base-39,9,4);ctx.shadowBlur=0;}
  s.items.forEach(o=>drawObject(ctx,o,t));
  (s.particles||[]).forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/18);ctx.fillStyle='#ffd85a';ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  drawRunner(ctx,s.player,t);
 };

 function drawObject(c,o,t){
  c.save();c.translate(o.x,o.y);
  if(o.kind==='coin'){let p=1+Math.sin(t*8+o.x*.02)*.1;c.translate(o.w/2,o.h/2);c.scale(p,1);c.shadowColor='#ffd34d';c.shadowBlur=22;let g=c.createRadialGradient(-4,-5,2,0,0,15);g.addColorStop(0,'#fff6a0');g.addColorStop(.45,'#ffd34d');g.addColorStop(1,'#db8a00');c.fillStyle=g;c.beginPath();c.arc(0,0,13,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff2a3';c.lineWidth=2;c.stroke();c.fillStyle='#674100';c.font='900 9px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,1);c.restore();return;}
  if(o.kind==='spike'){c.shadowColor='#ff3d91';c.shadowBlur=18;c.fillStyle='#ff4d92';c.beginPath();c.moveTo(0,o.h);c.lineTo(o.w*.18,o.h*.28);c.lineTo(o.w*.36,o.h);c.lineTo(o.w*.52,0);c.lineTo(o.w*.7,o.h);c.lineTo(o.w,o.h);c.closePath();c.fill();c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.55)';c.stroke();}
  else if(o.kind==='wall'){c.shadowColor='#7650ff';c.shadowBlur=18;let g=c.createLinearGradient(0,0,o.w,o.h);g.addColorStop(0,'#9b73ff');g.addColorStop(.5,'#5934c7');g.addColorStop(1,'#27125f');c.fillStyle=g;round(c,0,0,o.w,o.h,9);c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.16)';c.fillRect(5,5,3,o.h-10);c.strokeStyle='rgba(255,255,255,.25)';c.strokeRect(6,6,o.w-12,o.h-12);}
  else{c.shadowColor='#ff704d';c.shadowBlur=14;let g=c.createLinearGradient(0,0,0,o.h);g.addColorStop(0,'#ff8254');g.addColorStop(1,'#9e2f32');c.fillStyle=g;round(c,0,0,o.w,o.h,8);c.shadowBlur=0;c.strokeStyle='rgba(255,220,170,.55)';c.strokeRect(5,5,o.w-10,o.h-10);c.fillStyle='rgba(255,255,255,.2)';c.fillRect(6,6,o.w-12,3);c.fillStyle='#ffd36b';c.font='900 12px Arial';c.textAlign='center';c.fillText('67',o.w/2,o.h/2+4);}
  c.restore();
 }

 function drawRunner(c,p,t){
  if(!p)return;const bob=Math.sin(t*11)*2,phase=t*13; c.save();c.translate(p.x,p.y+bob);c.scale(1.12,1.12);
  // ground shadow
  c.fillStyle='rgba(0,0,0,.48)';c.beginPath();c.ellipse(0,30,29,7,0,0,Math.PI*2);c.fill();
  // back leg
  limb(c,'#5129b8',-5,13,-16+Math.sin(phase)*11,31,-28+Math.sin(phase)*11,31,8);
  // front leg
  limb(c,'#6d3ce0',6,13,17-Math.sin(phase)*11,28,30-Math.sin(phase)*11,28,8);
  // shoes
  shoe(c,-34+Math.sin(phase)*11,27);shoe(c,23-Math.sin(phase)*11,25);
  // back arm
  limb(c,'#6337d0',-14,-5,-29-Math.sin(phase)*7,4,-33-Math.sin(phase)*7,14,7);
  // front arm
  limb(c,'#8758f1',14,-5,29+Math.sin(phase)*7,4,33+Math.sin(phase)*7,14,7);
  // jacket body
  let body=c.createLinearGradient(-18,-13,18,18);body.addColorStop(0,'#c0a1ff');body.addColorStop(.45,'#8050ec');body.addColorStop(1,'#43229d');c.fillStyle=body;round(c,-18,-14,36,33,10);
  // zipper and seams
  c.strokeStyle='rgba(255,255,255,.38)';c.lineWidth=1;c.beginPath();c.moveTo(0,-10);c.lineTo(0,14);c.stroke();c.beginPath();c.moveTo(-13,-5);c.lineTo(-5,-1);c.moveTo(13,-5);c.lineTo(5,-1);c.stroke();
  // chest badge
  c.fillStyle='rgba(255,255,255,.18)';round(c,-8,-2,16,11,4);c.fillStyle='#fff';c.font='900 10px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,3);
  // neck
  c.fillStyle='#efb28f';c.fillRect(-5,-18,10,7);
  // head with ears
  c.fillStyle='#f4c29f';c.beginPath();c.arc(0,-28,15,0,Math.PI*2);c.fill();c.beginPath();c.arc(-14,-28,4,0,Math.PI*2);c.arc(14,-28,4,0,Math.PI*2);c.fill();
  // hair detailed
  c.fillStyle='#21182d';c.beginPath();c.moveTo(-14,-29);c.quadraticCurveTo(-15,-43,0,-44);c.quadraticCurveTo(16,-43,14,-27);c.lineTo(8,-32);c.lineTo(4,-38);c.lineTo(0,-32);c.lineTo(-5,-39);c.lineTo(-10,-31);c.closePath();c.fill();
  // face
  c.fillStyle='#2b1d2b';c.beginPath();c.arc(-5,-27,2,0,Math.PI*2);c.arc(5,-27,2,0,Math.PI*2);c.fill();c.strokeStyle='#a55f55';c.lineWidth=1.2;c.beginPath();c.arc(0,-23,4,0,Math.PI);c.stroke();
  // head highlight
  c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.arc(-5,-34,4,0,Math.PI*2);c.fill();
  // backpack detail
  c.fillStyle='#39206e';round(c,-22,-8,7,20,3);c.fillStyle='#a77cff';c.fillRect(-20,-4,3,10);
  c.restore();
 }
 function limb(c,color,x1,y1,x2,y2,x3,y3,width){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.stroke();}
 function shoe(c,x,y){let g=c.createLinearGradient(x,y,x+15,y+7);g.addColorStop(0,'#fff');g.addColorStop(1,'#b9b4ce');c.fillStyle=g;round(c,x,y,15,7,3);c.fillStyle='#6b45d7';c.fillRect(x+3,y+5,9,2);}
 function round(c,x,y,w,h,r){const q=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath();c.fill();}
})();