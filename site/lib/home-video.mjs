// The local MP4 is physically trimmed to 47 s; native loop repeats that exact file.
export function createBannerPlayback(video,{onBlocked=()=>{}}={}){
  let enabled=false,blocked=false,pending=false;
  video.muted=true;video.defaultMuted=true;video.loop=true;
  async function resume(){
    if(!enabled||blocked||pending||!video.paused)return;
    pending=true;
    try{await video.play();}
    catch(error){if(enabled&&!blocked&&error.name!=='AbortError'){blocked=true;onBlocked();}}
    finally{pending=false;}
  }
  function sync(){if(enabled&&!blocked)void resume();else video.pause();}
  return {
    setEnabled(value){enabled=value;sync();},
    retry(){blocked=false;sync();},
    sync,
    onPlay(){if(!enabled||blocked)video.pause();}
  };
}

export function wireHomeVideo(root){
  const video=root.querySelector('video'),play=root.querySelector('[data-video-start]');
  const loading=root.querySelector('[data-video-loading]'),status=root.querySelector('[data-video-status]');
  let active=false,inView=false;
  const announce=text=>{status.textContent=text;status.hidden=!text;};
  const playback=createBannerPlayback(video,{onBlocked:()=>{play.hidden=false;announce('Toque em Reproduzir vídeo para iniciar.');}});
  const sync=()=>playback.setEnabled(active&&inView&&!document.hidden);
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.1});observer.observe(root);
  document.addEventListener('visibilitychange',sync);
  video.addEventListener('canplay',()=>{loading.hidden=true;sync();});
  video.addEventListener('playing',()=>{loading.hidden=true;play.hidden=true;announce('');});
  video.addEventListener('play',()=>playback.onPlay());
  video.addEventListener('error',()=>{loading.hidden=true;announce('Não foi possível carregar o vídeo. Tente recarregar a página.');});
  play.addEventListener('click',()=>{announce('');play.hidden=true;playback.retry();});
  sync();
  return {setActive(value){active=value;sync();}};
}
