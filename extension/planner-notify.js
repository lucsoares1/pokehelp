// Relay only the native preference notification in the page's MAIN world.
// No storage contents, game objects, networking or gameplay commands are accessed.
(()=>{
  if(window!==top||location.origin!=='https://pokemon-auto-chess.com')return;
  const CHANNEL='PCH_NATIVE_PLANNER_V1';
  let pending=false;
  window.addEventListener('message',event=>{
    const m=event.data;
    if(event.source!==window||event.origin!==location.origin||m?.channel!==CHANNEL||m.type!=='notify'||m.key!=='team_planner'||pending)return;
    pending=true;
    setTimeout(()=>{pending=false;window.dispatchEvent(new StorageEvent('storage',{key:'team_planner'}));},0);
  });
  window.postMessage({channel:CHANNEL,type:'ready'},location.origin);
})();
