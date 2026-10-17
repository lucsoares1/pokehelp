// Runs in the extension's ISOLATED world. Only these two origin-local keys are accessed.
(()=>{
  const KEY='team_planner',BACKUP='pokechess-native-planner-v1',LIMIT=200000;
  const validRaw=raw=>{if(raw===null)return true;if(typeof raw!=='string'||raw.length>LIMIT)return false;try{const data=JSON.parse(raw);return data&&typeof data==='object'&&Array.isArray(data.value)&&data.value.length<=24&&data.value.every(p=>p&&typeof p.name==='string'&&Array.isArray(p.items))&&Number.isFinite(data.expirationDate);}catch{return false;}};
  function create({storage,notify,flag,onStatus,now=Date.now}){
    let desired=null,paused=false,busy=false,last='';
    const report=code=>{flag(code==='synced');if(code!==last){last=code;onStatus(code);}};
    function journal(){const raw=storage.getItem(BACKUP);if(raw===null)return null;if(raw.length>LIMIT*3)throw Error('backup');const j=JSON.parse(raw);if(j?.version!==1||!validRaw(j.previous)||!validRaw(j.written)||j.written===null)throw Error('backup');return j;}
    function reconcile(){
      if(busy)return;busy=true;
      try{
        const current=storage.getItem(KEY),saved=journal();
        if(desired===null){
          if(saved){if(current===saved.written){if(saved.previous===null)storage.removeItem(KEY);else storage.setItem(KEY,saved.previous);notify();}storage.removeItem(BACKUP);}
          paused=false;report('off');return;
        }
        if(paused){report('conflict');return;}
        if(saved&&current!==saved.written){paused=true;report('conflict');return;}
        if(!validRaw(current)){report('incompatible');return;}
        const currentValue=current===null?null:JSON.parse(current).value;
        if(saved&&JSON.stringify(currentValue)===JSON.stringify(desired)){report('synced');return;}
        const written=JSON.stringify({expirationDate:now()+365*24*60*60*1000,value:desired});
        storage.setItem(BACKUP,JSON.stringify({version:1,previous:saved?saved.previous:current,written}));
        storage.setItem(KEY,written);notify();report('synced');
      }catch{report('error');}finally{busy=false;}
    }
    return {sync(board){desired=board;reconcile();},refresh:reconcile,
      // React may mount its storage subscriber after our first write. Replay only
      // while this exact preference is still owned by us; do not rewrite it.
      announce(){reconcile();if(desired!==null&&last==='synced')notify();},
      get status(){return last;}};
  }
  globalThis.PCHShopPlanner={KEY,BACKUP,create,validRaw};
})();
