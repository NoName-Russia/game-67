(function(){
 const overlay=document.getElementById('miniOverlay');
 const title=document.getElementById('miniTitle');
 if(!overlay||!title)return;
 const sync=()=>overlay.classList.toggle('run-mode',title.textContent.includes('Забег'));
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});sync();

 // The original runner calls its local drawRun(). We therefore render a separate
 // visual layer above the game canvas so the detailed scene is always visible.
 let visual=null,ctx=null;
 function ensure(){
   if(visual)return;
   const base=document.getElementById('miniCanvas');
   if(!base)return;
   visual=document.createElement('canvas');
   visual.id='runVisualCanvas';
   visual.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;border-radius:inherit;';
   base.parentElement.style.position='relative';
   base.parentElement.appendChild(visual);
   ctx=visual.getContext('2d');
 }
 function frame(){
   if(!overlay.classList.contains('active')||!title.textContent.includes('Забег')){requestAnimationFrame(frame);return;}
   ensure();
   const base=document.getElementById('miniCanvas');
   const s=window.miniState;
   if(!base||!ctx||!s){requestAnimationFrame(frame);return;}
   const r=base.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=r.width,h=r.height;
   if(visual.width!==Math.round(w*d)||visual.height!==Math.round(h*d)){visual.width=Math.round(w*d);visual.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0)}
   drawScene(w,h,s);
   requestAnimationFrame(frame);
 }
 function drawScene(w,h,s){
   const t=performance.now()/1000;
   ctx.clearRect(0,0,w,h);
   const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#111a3d');sky.addColorStop(.48,'#30205d');sky.addColorStop(1,'#d94f91');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
   const glow=ctx.createRadialGradient(w*.78,h*.18,5,w*.78,h*.18,130);glow.addColorStop(0,'rgba(255,245,210,.42)');glow.addColorStop(1,'rgba(255,100,180,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
   ctx.fillStyle='#fff0c7';ctx.shadowColor='#ffdca0';ctx.shadowBlur=25;ctx.beginPath();ctx.arc(w*.78,h*.18,23,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   for(let i=0;i<55;i++){let x=(i*89-s.distance*.25)%w;if(x<0)x+=w;let y=15+(i*47)%(h*.48);ctx.fillStyle=`rgba(255,255,255,${.25+(i%5)*.1})`;ctx.fillRect(x,y,i%9===0?2:1,i%9===0?2:1)}
   // city
   const city=h-82;ctx.fillStyle='rgba(7,8,20,.78)';
   for(let i=0;i<24;i++){const bw=28+(i*19)%48,bh=35+(i*31)%(h*.28),x=((i*67-s.distance*.13)%(w+80))-40;ctx.fillRect(x,city-bh,bw,bh);ctx.fillStyle='rgba(255,190,90,.32)';for(let y=city-bh+12;y<city-7;y+=15)if((i+Math.floor(y/15))%3)ctx.fillRect(x+7,y,4,3);ctx.fillStyle='rgba(7,8,20,.78)'}
   // road
   const horizon=city;const road=ctx.createLinearGradient(0,horizon,0,h);road.addColorStop(0,'#383044');road.addColorStop(1,'#101019');ctx.fillStyle=road;ctx.fillRect(0,horizon,w,h-horizon);
   ctx.fillStyle='rgba(255,255,255,.28)';const off=(s.distance*2)%70;for(let x=-70+off;x<w;x+=70)ctx.fillRect(x,h-30,35,4);
   // neon rails
   for(let i=0;i<10;i++){let x=((i*145-s.distance*.8)%(w+160))-40;ctx.fillStyle='#ff4fbd';ctx.shadowColor='#ff4fbd';ctx.shadowBlur=12;ctx.fillRect(x,horizon-35,4,35);ctx.shadowBlur=0;ctx.fillStyle='#ffd0ef';ctx.fillRect(x-4,horizon-38,12,4)}
   if(s.items)s.items.forEach(o=>drawObject(o,t));
   if(s.particles)s.particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/18);ctx.fillStyle='#ffd34d';ctx.shadowColor='#ffd34d';ctx.shadowBlur=8;ctx.fillRect(p.x,p.y,5,5);ctx.shadowBlur=0});ctx.globalAlpha=1;
   if(s.player)drawPlayer(s.player,t);
 }
 function drawObject(o,t){
   if(o.kind==='coin'){const q=1+Math.sin(t*8+o.x)*.12;ctx.save();ctx.translate(o.x+11,o.y+11);ctx.scale(q,1);ctx.shadowColor='#ffd34d';ctx.shadowBlur=22;ctx.fillStyle='#ffd34d';ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#fff4a8';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#6a4200';ctx.font='900 8px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('67',0,1);ctx.restore();return}
   ctx.save();ctx.translate(o.x,o.y);
   if(o.kind==='spike'){ctx.shadowColor='#ff3f9f';ctx.shadowBlur=18;ctx.fillStyle='#ff477f';ctx.beginPath();ctx.moveTo(0,o.h);ctx.lineTo(o.w*.25,2);ctx.lineTo(o.w*.5,o.h);ctx.lineTo(o.w*.72,0);ctx.lineTo(o.w,o.h);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.stroke()}
   else if(o.kind==='wall'){ctx.shadowColor='#8b68ff';ctx.shadowBlur=18;const g=ctx.createLinearGradient(0,0,o.w,0);g.addColorStop(0,'#4b32b9');g.addColorStop(.5,'#8b68ff');g.addColorStop(1,'#3b277f');ctx.fillStyle=g;ctx.fillRect(0,0,o.w,o.h);ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(5,5,4,o.h-10);for(let y=12;y<o.h;y+=18)ctx.fillRect(11,y,o.w-16,2)}
   else {ctx.shadowColor='#ff704b';ctx.shadowBlur=15;ctx.fillStyle='#d95b38';round(0,0,o.w,o.h,8);ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(5,5,o.w-10,3);ctx.strokeStyle='rgba(255,210,150,.6)';ctx.strokeRect(5,5,o.w-10,o.h-10);ctx.fillStyle='#ffd080';ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillText('67',o.w/2,o.h/2+4)}
   ctx.restore();
 }
 function drawPlayer(p,t){const bob=Math.sin(t*11)*2,run=Math.sin(t*16);ctx.save();ctx.translate(p.x,p.y+bob);ctx.scale(1.15,1.15);
   ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,31,27,7,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#5a35d5';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,10);ctx.lineTo(-17+run*8,28);ctx.lineTo(-27+run*8,28);ctx.stroke();ctx.beginPath();ctx.moveTo(7,10);ctx.lineTo(17-run*8,28);ctx.lineTo(27-run*8,28);ctx.stroke();
   ctx.fillStyle='#fff';round(-31+run*8,25,15,8,3);round(19-run*8,25,15,8,3);
   const g=ctx.createLinearGradient(-18,-15,18,18);g.addColorStop(0,'#c1a0ff');g.addColorStop(.5,'#7650ee');g.addColorStop(1,'#40269f');ctx.fillStyle=g;round(-18,-15,36,34,10);
   ctx.fillStyle='#fff';ctx.font='900 12px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('67',0,1);
   ctx.strokeStyle='#9a71ff';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(-27,2+run*6);ctx.stroke();ctx.beginPath();ctx.moveTo(14,-8);ctx.lineTo(27,2-run*6);ctx.stroke();
   ctx.fillStyle='#ffd0b0';ctx.beginPath();ctx.arc(0,-27,14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#21182f';ctx.beginPath();ctx.arc(0,-30,14,Math.PI,Math.PI*2);ctx.lineTo(12,-28);ctx.lineTo(7,-35);ctx.lineTo(1,-29);ctx.lineTo(-5,-35);ctx.lineTo(-12,-28);ctx.closePath();ctx.fill();
   ctx.fillStyle='#151326';round(-8,-29,16,5,2);ctx.fillStyle='#fff';ctx.fillRect(4,-28,3,2);ctx.restore();
 }
 function round(x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath();ctx.fill()}
 requestAnimationFrame(frame);
})();