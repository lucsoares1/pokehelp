/* Apply before styles load so a saved light theme never flashes dark. */
(()=>{
  const key='pokechess-theme-v1';
  const normalize=value=>value==='light'?'light':'dark';
  function apply(value){
    const theme=normalize(value),light=theme==='light';
    document.documentElement.dataset.theme=theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
      button.setAttribute('aria-checked',String(light));
      button.title=light?'Ativar tema escuro':'Ativar tema claro';
      button.querySelector('.theme-toggle-icon').textContent=light?'☀':'☾';
      button.querySelector('.theme-toggle-label').textContent=light?'Claro':'Escuro';
    });
  }
  let stored;try{stored=localStorage.getItem(key);}catch{/* Theme works without storage. */}
  apply(stored);
  document.addEventListener('DOMContentLoaded',()=>apply(document.documentElement.dataset.theme),{once:true});
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-theme-toggle]'))return;
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    apply(next);try{localStorage.setItem(key,next);}catch{/* Keep the current session usable. */}
  });
  window.addEventListener('storage',event=>{if(event.key===key||event.key===null)apply(event.newValue);});
})();
