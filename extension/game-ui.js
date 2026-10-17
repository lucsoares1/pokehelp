// Only native blocking menus; ordinary item/Pokémon tooltips stay interactive.
(()=>{
  const SELECTOR='.game-choice > .my-container, dialog[open], [role="dialog"][aria-modal="true"], .modal.show';
  const listeners=new Set();let observer=null,tick=0,signature='';
  function rects(selector){
    return [...document.querySelectorAll(selector)].flatMap(el=>{
      const style=getComputedStyle(el),r=el.getBoundingClientRect();
      if(style.display==='none'||style.visibility==='hidden'||el.hidden||r.width<=0||r.height<=0||r.bottom<=0||r.right<=0||r.left>=innerWidth||r.top>=innerHeight)return [];
      return [{x:r.left,y:r.top,width:r.width,height:r.height}];
    });
  }
  const blocks=()=>rects(SELECTOR),widgets=()=>rects('.game-choice .show-hide-action button');
  const overlaps=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
  function schedule(){if(!tick)tick=requestAnimationFrame(()=>{tick=0;const rects=blocks(),next=JSON.stringify([rects,widgets()]);if(next!==signature){signature=next;for(const fn of listeners)fn(rects);}});}
  function subscribe(fn){
    listeners.add(fn);if(!observer){observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','open','hidden','aria-hidden','aria-modal','role']});window.addEventListener('resize',schedule);}
    fn(blocks());return ()=>listeners.delete(fn);
  }
  globalThis.PCHGameUI={blocks,widgets,overlaps,subscribe};
})();
