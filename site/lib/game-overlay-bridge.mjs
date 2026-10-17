import {wireOverlay} from './overlay-controller.mjs';
export function requestExtension(type,payload={},timeout=1800){
  return new Promise((resolve,reject)=>{
    const requestId=crypto.randomUUID();let timer;
    const receive=event=>{if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='PCH_HELPER_RESPONSE'||event.data.requestId!==requestId)return;cleanup();event.data.ok?resolve(event.data):reject(new Error(event.data.error||'A extensão não confirmou a importação.'));};
    const cleanup=()=>{clearTimeout(timer);window.removeEventListener('message',receive);};
    window.addEventListener('message',receive);timer=setTimeout(()=>{cleanup();reject(new Error('Extensão não conectada. Instale ou recarregue a extensão e atualize esta página.'));},timeout);
    window.postMessage({channel:'PCH_HELPER_REQUEST',requestId,type,...payload},location.origin);
  });
}
export function wireGameOverlay({announce=()=>{}}={}){
  const section=document.querySelector('#game-overlay-connection'),message=section.querySelector('[data-game-overlay-status]');
  let ready=false,transfer=0,version='';
  const local=wireOverlay(document.querySelector('#helper-overlay'),{announce,onSelect:publish,onAction:action=>void syncAction(action)});
  function feedback(text,connected=false){message.textContent=text;section.dataset.connected=String(connected);}
  function health(reply){
    if(version&&version!=='0.18.1')return `Extensão ${version} conectada. Recarregue a versão 0.18.1 para receber campo, itens e guia atualizados.`;
    const d=reply.game;
    if(!d)return 'Extensão antiga conectada. Atualize/recarregue a extensão 0.18.1 para verificar a aba do jogo.';
    if(d.unavailable)return 'Extensão conectada, mas não foi possível verificar o jogo. Confira o acesso da extensão a pokemon-auto-chess.com.';
    if(d.ready>0){const s=d.shop;return `Overlay carregado em ${d.ready} aba(s) do jogo.${s?.conflicts?' Destaques pausados: o planejador foi editado no jogo.':s?.synced?(s.visible?` Loja detectada · ${s.offers} oferta(s) com destaque nativo.`:' Plano preparado; aguardando a loja da partida.'):''}`;}
    if(d.connected>0)return 'Aba do jogo conectada; painel carregando ou recolhido no atalho PokeChess.';
    if(d.tabs>0)return 'O jogo está aberto, mas a extensão não respondeu nessa aba. Recarregue a página do jogo fora de uma partida.';
    return 'Extensão conectada. Abra Pokémon Auto Chess neste mesmo navegador/perfil.';
  }
  async function publish(selection){
    const token=++transfer;
    try{const reply=await requestExtension('PCH_IMPORT',{selection,theme:document.documentElement.dataset.theme},5000);if(token!==transfer)return;ready=true;feedback(`Equipe disponível no Helper. ${health(reply)}`,true);announce('Equipe aberta no Helper e salva na extensão do jogo.');return reply;}
    catch(e){if(token!==transfer)return;ready=false;feedback(`Overlay disponível no Helper. ${e.message}`);announce('Equipe aberta no Helper. Não foi possível sincronizar com a extensão.');}
  }
  async function syncAction(action){if(!ready)return;try{const reply=await requestExtension('PCH_PATCH',action);await local.applyRemote(reply.state);}catch(e){feedback(`Marca atualizada no Helper. ${e.message}`);}}
  async function connect(){
    feedback('Verificando extensão…');const token=transfer;
    try{const reply=await requestExtension('PCH_HELLO',{},5000);version=reply.version;ready=true;feedback(health(reply),true);
      if(token===transfer){const remote=await requestExtension('PCH_STATE');if(token!==transfer)return true;if(remote.state?.selection)await local.applyRemote(remote.state);else if(local.getState().selection)await publish(local.getState().selection);}
      return true;
    }catch(e){ready=false;feedback(`Overlay funciona no Helper. ${e.message}`);return false;}
  }
  function setup(){if(location.hash!=='#compositions')location.hash='#compositions';section.querySelector('details').open=true;requestAnimationFrame(()=>{section.scrollIntoView({block:'center',behavior:'instant'});section.focus({preventScroll:true});});}
  document.querySelectorAll('[data-overlay-toggle]').forEach(button=>button.addEventListener('click',local.show));
  document.querySelector('#helper-overlay').addEventListener('click',event=>{if(event.target.closest('[data-ov-connection]')){event.preventDefault();setup();}});
  section.querySelector('[data-check-overlay]').addEventListener('click',()=>void connect().then(ok=>announce(ok?'Extensão conectada. Escolha uma equipe e clique no botão amarelo.':message.textContent)));
  window.addEventListener('message',event=>{if(event.source!==window||event.origin!==location.origin||event.data?.channel!=='PCH_HELPER_STATE'||!ready)return;void local.applyRemote(event.data.state);});
  return {
    importTeam:local.importTeam,
    async restore(data){await local.restore(data);await connect();}
  };
}
