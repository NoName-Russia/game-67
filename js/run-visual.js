(function(){
 const overlay=document.getElementById('miniOverlay');
 const title=document.getElementById('miniTitle');
 if(!overlay||!title)return;
 const sync=()=>overlay.classList.toggle('run-mode',title.textContent.includes('Забег'));
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});
 sync();

 // Detailed Run 67 scene + character. Keeps the existing game physics intact.
 window.drawRun=function(ctx){
   const s=window.miniState||null;
   if(!s)return;
   const w=s.w,h=s.h,t=performance.now()/1000;
   ctx.clearRect(0,0,w,h);

   const sky=ctx.createLinearGradient(0,0,0,h);
   sky.addColorStop(0,'#08091b');sky.addColorStop(.42,'#17102d');sky.addColorStop(1,'#27121e');
   ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

   // moon / city glow
   const moon=ctx.createRadialGradient(w*.78,h*.22,4,w*.78,h*.22,150);
   moon.addColorStop(0,'rgba(255,190,130,.26)');moon.addColorStop(1,'rgba(255,80,160,0)');ctx.fillStyle=moon;ctx.fillRect(0,0,w,h);
   ctx.fillStyle='rgba(255,220,190,.85)';ctx.beginPath();ctx.arc(w*.78,h*.2,30,0,Math.PI*2);ctx.fill();

   // stars
   for(let i=0;i<48;i++){
     const px=(i*97-(s.distance*.18+i*3))%w;const py=22+(i*53)%Math.max(40,h*.42);
     const a=.25+.35*(i%4)/4;ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fillRect(px<0?px+w:px,py,i%7===0?2:1,i%7===0?2:1);
   }

   // distant skyline
   const base=h-72;
   ctx.fillStyle='#0d0c19';
   for(let i=0;i<18;i++){
     const bw=35+(i*17)%45,bh=35+(i*29)%(h*.24);const bx=((i*73-s.distance*.12)%(w+80))-40;
     ctx.fillRect(bx,base-bh,bw,bh);
     ctx.fillStyle='rgba(255,176,92,.16)';
     for(let yy=base-bh+12;yy<base-8;yy+=14)if((i+Math.floor(yy))%3!==0)ctx.fillRect(bx+7,yy,4,3);
     ctx.fillStyle='#0d0c19';
   }

   // road depth
   const horizon=base-2;
   const road=ctx.createLinearGradient(0,horizon,0,h);road.addColorStop(0,'#1a1722');road.addColorStop(1,'#090910');ctx.fillStyle=road;ctx.fillRect(0,horizon,w,h-horizon);
   ctx.strokeStyle='rgba(255,92,151,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,horizon);ctx.lineTo(w,horizon);ctx.stroke();
   ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=2;
   const laneY=h-34;const dash=42;const offset=(s.distance*2)%dash;
   for(let xx=-dash+offset;xx<w;xx+=dash){ctx.fillRect(xx,laneY,22,3)}

   // neon roadside posts
   for(let i=0;i<9;i++){const px=((i*150-s.distance*.7)% (w+180))-50;ctx.fillStyle='#ff4f9a';ctx.fillRect(px,horizon-28,3,28);ctx.fillStyle='rgba(255,79,154,.18)';ctx.fillRect(px-7,horizon-25,17,4)}

   // objects
   s.items.forEach(o=>drawRunObject(ctx,o,t));
   s.particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/18);ctx.fillStyle='#ffd45c';ctx.fillRect(p.x,p.y,4,4)});ctx.globalAlpha=1;
   drawRunner(ctx,s.player,t);
 };

 function drawRunObject(c,o,t){
   if(o.kind==='coin'){
     const pulse=1+Math.sin(t*7+o.x*.02)*.1;c.save();c.translate(o.x+o.w/2,o.y+o.h/2);c.scale(pulse,1);
     c.shadowColor='#ffd34d';c.shadowBlur=20;c.fillStyle='#ffd34d';c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();c.shadowBlur=0;c.strokeStyle='#fff0a0';c.lineWidth=2;c.stroke();c.fillStyle='#714400';c.font='900 8px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,1);c.restore();return;
   }
   c.save();c.translate(o.x,o.y);
   if(o.kind==='spike'){
     c.shadowColor='#ff3f8f';c.shadowBlur=15;c.fillStyle='#ff477f';c.beginPath();c.moveTo(0,o.h);c.lineTo(o.w*.18,o.h*.3);c.lineTo(o.w*.35,o.h);c.lineTo(o.w*.55,0);c.lineTo(o.w*.72,o.h);c.lineTo(o.w,o.h);c.closePath();c.fill();c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.55)';c.stroke();
   }else if(o.kind==='wall'){
     c.shadowColor='#8a5cff';c.shadowBlur=18;c.fillStyle='#5d3ad4';c.fillRect(0,0,o.w,o.h);c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.13)';c.fillRect(5,5,4,o.h-10);c.fillStyle='#bdaaff';for(let y=14;y<o.h;y+=18)c.fillRect(10,y,o.w-16,2);
   }else{
     c.shadowColor='#ff7a45';c.shadowBlur=12;c.fillStyle='#d95432';round(c,0,0,o.w,o.h,8);c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.18)';c.fillRect(5,5,o.w-10,3);c.strokeStyle='rgba(255,200,130,.45)';c.strokeRect(5,5,o.w-10,o.h-10);c.fillStyle='#ffb35b';c.font='900 12px Arial';c.textAlign='center';c.fillText('67',o.w/2,o.h/2+4);
   }
   c.restore();
 }
 function drawRunner(c,p,t){
   if(!p)return;const bob=Math.sin(t*12)*2;const run=Math.sin(t*18)*.7;c.save();c.translate(p.x,p.y+bob);c.scale(1.08,1.08);
   // shadow
   c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.ellipse(0,27,27,7,0,0,Math.PI*2);c.fill();
   // legs
   c.strokeStyle='#5b35d6';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(-7,13);c.lineTo(-17+run*9,30);c.lineTo(-27+run*9,30);c.stroke();c.beginPath();c.moveTo(7,13);c.lineTo(17-run*9,29);c.lineTo(27-run*9,29);c.stroke();
   // shoes
   c.fillStyle='#f7f4ff';round(c,-31+run*9,27,14,7,3);round(c,20-run*9,26,14,7,3);
   // torso jacket
   const body=c.createLinearGradient(-18,-14,18,16);body.addColorStop(0,'#b28cff');body.addColorStop(.55,'#7548e8');body.addColorStop(1,'#4d2ab6');c.fillStyle=body;round(c,-18,-14,36,34,10);
   // 67 chest mark
   c.fillStyle='#fff';c.font='900 12px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('67',0,1);
   // arms
   c.strokeStyle='#8658ee';c.lineWidth=7;c.beginPath();c.moveTo(-14,-8);c.lineTo(-27,2+run*7);c.stroke();c.beginPath();c.moveTo(14,-8);c.lineTo(27,2-run*7);c.stroke();
   // head
   const skin='#ffd1b0';c.fillStyle=skin;c.beginPath();c.arc(0,-25,14,0,Math.PI*2);c.fill();
   // hair
   c.fillStyle='#21172d';c.beginPath();c.arc(0,-29,14,Math.PI,Math.PI*2);c.lineTo(12,-28);c.lineTo(7,-34);c.lineTo(2,-29);c.lineTo(-4,-35);c.lineTo(-11,-28);c.closePath();c.fill();
   // visor / eye highlight
   c.fillStyle='#151326';round(c,-8,-27,16,5,2);c.fillStyle='#fff';c.fillRect(4,-26,3,2);
   c.restore();
 }
 function round(c,x,y,w,h,r){const q=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath();c.fill();}
})();