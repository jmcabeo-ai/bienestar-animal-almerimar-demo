const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../propuesta');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'propuesta.js'),'utf8');
test('La propuesta conserva precios, pagos y comunicaciones separados',()=>{
  for(const text of ['1.497','597','748,50','8.661','30 días','sin IVA','Tarifa de comunicaciones pendiente'])assert.ok(html.includes(text),text);
  assert.match(html,/no una permanencia anual/);
  assert.match(html,/sin margen adicional de OMNIA/);
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
