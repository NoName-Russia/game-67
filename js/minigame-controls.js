document.addEventListener('DOMContentLoaded',()=>{
  const on=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('click',fn)};
  on('openRun',()=>openMiniGame('run'));
  on('openShooter',()=>openMiniGame('shooter'));
  on('openMatch',()=>openMiniGame('match'));
  on('closeMini',()=>closeMiniGame());
  on('restartMini',()=>{if(miniState&&miniState.type)startMiniGame(miniState.type)});
});