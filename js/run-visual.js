(function(){
 const overlay=document.getElementById('miniOverlay');
 const title=document.getElementById('miniTitle');
 if(!overlay||!title)return;
 const sync=()=>{
   const isRun=title.textContent.includes('Забег');
   overlay.classList.toggle('run-mode',isRun);
 };
 new MutationObserver(sync).observe(title,{childList:true,characterData:true,subtree:true});
 sync();
})();
