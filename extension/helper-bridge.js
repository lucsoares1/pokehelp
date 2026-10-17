(()=>{
  if(window!==top||!['http://127.0.0.1:4173','http://localhost:4173'].includes(location.origin)||!['/','/index.html'].includes(location.pathname))return;
  window.addEventListener('message',async event=>{
    const m=event.data;if(event.source!==window||event.origin!==location.origin||m?.channel!=='PCH_HELPER_REQUEST'||!['PCH_HELLO','PCH_IMPORT','PCH_STATE','PCH_PATCH'].includes(m.type)||typeof m.requestId!=='string'||!/^[\w-]{1,80}$/.test(m.requestId))return;
    try{const result=await chrome.runtime.sendMessage({type:m.type,selection:m.selection,theme:m.theme,action:m.action,slot:m.slot,level:m.level});window.postMessage({channel:'PCH_HELPER_RESPONSE',requestId:m.requestId,...result},location.origin);}
    catch{window.postMessage({channel:'PCH_HELPER_RESPONSE',requestId:m.requestId,ok:false,error:'Recarregue o Helper após ativar ou atualizar a extensão.'},location.origin);}
  });
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes['pokechess-game-overlay-v1'])window.postMessage({channel:'PCH_HELPER_STATE',state:changes['pokechess-game-overlay-v1'].newValue},location.origin);});
})();
