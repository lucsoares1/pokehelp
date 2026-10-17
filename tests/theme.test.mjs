import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const source=await readFile(new URL('../site/theme.js',import.meta.url),'utf8');
function boot(saved,{blocked=false}={}){
  const events={},windowEvents={},buttons=[0,1].map(()=>({attributes:{},parts:{'.theme-toggle-icon':{},'.theme-toggle-label':{}},setAttribute(k,v){this.attributes[k]=v;},querySelector(s){return this.parts[s];}}));
  let value=saved;
  const document={documentElement:{dataset:{}},querySelectorAll:()=>buttons,addEventListener:(name,fn)=>events[name]=fn};
  const localStorage={getItem(){if(blocked)throw Error('unavailable');return value;},setItem(k,v){if(blocked)throw Error('unavailable');value=v;}};
  runInNewContext(source,{document,localStorage,window:{addEventListener:(name,fn)=>windowEvents[name]=fn}});
  return {document,buttons,events,windowEvents,get saved(){return value;},click(){events.click({target:{closest:()=>buttons[0]}});}};
}
test('tema padrão escuro, preferência válida é aplicada antes dos controles e persiste ao alternar',()=>{
  for(const saved of [undefined,null,'invalid','dark'])assert.equal(boot(saved).document.documentElement.dataset.theme,'dark');
  const app=boot('light');assert.equal(app.document.documentElement.dataset.theme,'light');
  app.events.DOMContentLoaded();assert(app.buttons.every(b=>b.attributes['aria-checked']==='true'));
  app.click();assert.equal(app.saved,'dark');assert(app.buttons.every(b=>b.attributes['aria-checked']==='false'));
  app.click();assert.equal(app.saved,'light');
});
test('tema funciona sem armazenamento e acompanha mudança ou remoção em outra aba',()=>{
  const app=boot(null,{blocked:true});app.click();assert.equal(app.document.documentElement.dataset.theme,'light');
  app.windowEvents.storage({key:'pokechess-theme-v1',newValue:'dark'});assert.equal(app.document.documentElement.dataset.theme,'dark');
  app.windowEvents.storage({key:'unrelated',newValue:'light'});assert.equal(app.document.documentElement.dataset.theme,'dark');
  app.windowEvents.storage({key:null,newValue:null});assert(app.buttons.every(b=>b.attributes['aria-checked']==='false'));
});
