import test from 'node:test';
import assert from 'node:assert/strict';
import {readDiagnostics} from '../extension/diagnostic-view.mjs';

test('diagnóstico diferencia leitor ausente, cena ausente e pacote antigo sem dados privados',()=>{
  assert.match(readDiagnostics({diagnostics:{context:'timeout'}},'0.13.1').summary,/serviço da extensão/);
  assert.match(readDiagnostics({diagnostics:{bridge:'module-error'}},'0.13.1').summary,/módulos/);
  assert.match(readDiagnostics({diagnostics:{bridge:'received',scene:'waiting'}},'0.13.1').summary,/procurando a cena/);
  assert.match(readDiagnostics({diagnostics:{hostVersion:'0.13.0',nativeVersion:'0.13.1'}},'0.13.1').summary,/Versões diferentes/);
  const d=readDiagnostics({diagnostics:{bridge:'received',scene:'render-loop',shop:'read',domSlots:6,nativeSlots:6,badges:2,account:'private',uid:'private',read:'<img src=x onerror=alert(1)>'}},'0.13.1');
  assert.match(d.summary,/ativa/);assert.match(d.text,/6\/6 · badges: 2/);assert(!d.text.includes('private'));assert(!d.text.includes('<img'));
});
