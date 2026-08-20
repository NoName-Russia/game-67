(function(){
  const KEY='game67_run_record_v1';
  let current=null;

  function getRecord(){
    try{return JSON.parse(localStorage.getItem(KEY))||{score:0,distance:0,time:0};}
    catch(e){return {score:0,distance:0,time:0};}
  }

  function saveRecord(r){
    try{localStorage.setItem(KEY,JSON.stringify(r));}catch(e){}
  }

  function ensureRecordUI(){
    const info=document.querySelector('#miniOverlay .mini-info');
    if(!info)return null;
    let el=document.getElementById('runRecord');
    if(!el){
      el=document.createElement('span');
      el.id='runRecord';
      el.style.display='none';
      info.appendChild(el);
    }
    return el;
  }

  function showRecord(){
    const el=ensureRecordUI();
    if(!el)return;
    const r=getRecord();
    el.style.display='';
    el.innerHTML='Рекорд: <b>'+Math.floor(r.score)+'</b>';
  }

  function hideRecord(){
    const el=ensureRecordUI();
    if(el)el.style.display='none';
  }

  function finish(s){
    if(!current||current.state!==s)return;
    const r=getRecord();
    const score=Math.floor(s.score||0);
    const distance=Math.floor(s.distance||0);
    const survived=Math.min(30,Math.max(0,(Date.now()-current.started)/1000));
    if(score>r.score||distance>r.distance){
      saveRecord({score:Math.max(score,r.score),distance:Math.max(distance,r.distance),time:Math.max(survived,r.time||0)});
      if(typeof notify==='function')notify('🏆 Новый рекорд: '+score+' очков!');
    }
    showRecord();
    current=null;
  }

  setInterval(function(){
    if(typeof miniState==='undefined')return;
    const s=miniState;
    if(!s||s.type!=='run'){
      current=null;
      return;
    }

    if(!current||current.state!==s){
      current={state:s,started:Date.now()};
      s.startedAt=current.started;
      s.time=30;
      showRecord();
    }

    if(s.over){finish(s);return;}

    const elapsed=(Date.now()-current.started)/1000;
    s.time=Math.max(0,30-elapsed);
    const timeEl=document.getElementById('miniTime');
    if(timeEl)timeEl.textContent=Math.ceil(s.time)+'с';

    if(s.time<=0&&typeof endMini==='function'){
      endMini();
      return;
    }
  },100);

  document.addEventListener('click',function(e){
    if(e.target&&e.target.id==='openRun'){
      setTimeout(showRecord,50);
    }
    if(e.target&&e.target.id==='restartMini'){
      setTimeout(function(){
        if(typeof miniState!=='undefined'&&miniState&&miniState.type==='run'){
          current={state:miniState,started:Date.now()};
          miniState.startedAt=current.started;
          miniState.time=30;
          showRecord();
        }
      },50);
    }
  });
})();