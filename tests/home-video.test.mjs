import test from 'node:test';
import assert from 'node:assert/strict';
import {createBannerPlayback} from '../site/lib/home-video.mjs';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function setup(blocked=false){
  const video={paused:true,muted:false,defaultMuted:false,loop:false,plays:0,pauses:0,
    async play(){this.plays++;if(blocked)throw new Error('Autoplay blocked');this.paused=false;},
    pause(){this.pauses++;this.paused=true;}};
  let failures=0;const controller=createBannerPlayback(video,{onBlocked:()=>failures++});
  return {video,controller,get failures(){return failures;}};
}
test('vídeo local começa mudo, repete o arquivo e solicita autoplay quando visível',async()=>{
  const {video,controller}=setup();assert(video.muted&&video.defaultMuted&&video.loop);
  controller.setEnabled(true);await flush();assert.equal(video.plays,1);assert(!video.paused);
});
test('sair da home pausa o vídeo e retornar retoma o autoplay',async()=>{
  const {video,controller}=setup();controller.setEnabled(true);await flush();
  controller.setEnabled(false);assert(video.paused);controller.setEnabled(true);await flush();assert.equal(video.plays,2);
});
test('bloqueio do navegador não gera tentativas automáticas infinitas',async()=>{
  const app=setup(true);app.controller.setEnabled(true);await flush();assert.equal(app.failures,1);
  app.controller.setEnabled(false);app.controller.setEnabled(true);await flush();assert.equal(app.video.plays,1);
  app.controller.retry();await flush();assert.equal(app.video.plays,2);
});
