const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../propuesta');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'propuesta.js'),'utf8');
test('La oferta distingue implantación, periodo sin cuota y minutos incluidos',()=>{
  for(const text of ['997','600 €','397 €','197','30 días','día 31','sin IVA','100 min','49 €','99 €','179 €','249 €'])assert.ok(html.includes(text),text);
  assert.match(html,/0 € de mantenimiento tras la entrega/);
  assert.match(html,/cada mes de cuota pagada/);
  assert.match(html,/sin cuota ni 100 min base/);
  assert.match(html,/Sin permanencia anual/);
  assert.match(html,/Sin acumulación entre periodos mensuales/);
  assert.match(html,/Sin recargas ni cobros sin autorización/);
  assert.match(html,/sin volver a cobrar los minutos del bono/);
});
test('La propuesta no conecta servicios reales ni publica datos internos',()=>{
  assert.doesNotMatch(html+js,/api[_-]?key|Bearer\s|CRITERIO_INTERNO|97 USD|107 USD/i);
  assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|WebSocket|getUserMedia|sendBeacon/);
  assert.doesNotMatch(html,/<iframe|demo-config\.js|src="https?:/);
  assert.match(html,/Sin citas, llamadas ni envíos reales/);
  assert.match(html,/Google Calendar, WhatsApp y telefonía del centro todavía no están conectados/);
});
test('La propuesta tiene recursos locales y anclas válidos',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    const resource=match[1].split('?')[0];
    if(!/^(https?:|mailto:|tel:)/.test(resource))assert.ok(fs.existsSync(path.resolve(root,resource)),resource);
  }
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),match[1]);
});
