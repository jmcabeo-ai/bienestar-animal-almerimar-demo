const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../propuesta');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'propuesta.js'),'utf8');
const pricing=fs.readFileSync(path.join(root,'precios.js'),'utf8');
const {estimate}=require('../propuesta/precios.js');

test('Periodo pagado: exactamente 100 minutos y 500 respuestas sin exceso',()=>{
  const result=estimate({voiceSeconds:6000,replies:500});
  assert.equal(result.fee,197);
  assert.equal(result.walletCents,0);
  assert.equal(result.totalCents,23837);
  const extra=estimate({voiceSeconds:6060,replies:501});
  assert.equal(extra.voiceCents,29);
  assert.equal(extra.replyCents,4);
});
test('El ejemplo separa cuota, consumo, Meta e IVA sin duplicar recargas',()=>{
  const result=estimate({voiceSeconds:9000,replies:650,metaEUR:3.57});
  for(const [key,value] of Object.entries({voiceCents:1450,replyCents:600,metaCents:357,walletCents:2407,netCents:22107,vatCents:4642,totalCents:26749,standardNetCents:22107,unlimitedNetCents:40057}))assert.equal(result[key],value,key);
});
test('Ilimitada: conserva Meta y elimina excesos incluso con uso alto',()=>{
  const result=estimate({plan:'unlimited',voiceSeconds:600000,replies:25000,metaEUR:3.57});
  for(const [key,value] of Object.entries({fee:397,voiceCents:0,replyCents:0,walletCents:357,totalCents:48469}))assert.equal(result[key],value,key);
  assert.equal(estimate({voiceSeconds:60000,replies:500}).standardNetCents,45800);
});
test('Primeros 30 días: cuota cero sin franquicias, aun seleccionando ilimitada',()=>{
  for(const plan of ['standard','unlimited']){
    const result=estimate({period:'initial',plan,voiceSeconds:9000,replies:650,metaEUR:3.57});
    for(const [key,value] of Object.entries({fee:0,voiceCents:4350,replyCents:2600,walletCents:7307,netCents:7307,totalCents:8841}))assert.equal(result[key],value,key);
  }
});
test('Meta independiente de franquicias y cálculo de fracciones de minuto',()=>{
  for(const plan of ['standard','unlimited']){
    assert.equal(estimate({plan,metaEUR:12.50}).metaCents,1250);
    assert.equal(estimate({plan,voiceSeconds:6000,replies:500}).metaCents,0);
  }
  assert.equal(estimate({voiceSeconds:6030,replies:500}).voiceCents,15);
});
test('Rechaza negativos, infinitos, contadores fraccionarios y modalidades inválidas',()=>{
  for(const input of [{voiceSeconds:-1},{replies:-1},{replies:1.5},{voiceSeconds:1.5},{metaEUR:-1},{metaEUR:Infinity},{replies:NaN},{period:'other'},{plan:'other'}])assert.throws(()=>estimate(input),RangeError);
});
test('Oferta estática: precios, gastos y límites presentes sin calculadora',()=>{
  assert.doesNotMatch(html+js,/bono|call-bundle|bundles/i);
  for(const text of ['147 €','50 €','100 min','500 respuestas','0,29 €/min','0,04 €/respuesta','397 €','Meta aparte','238,37 €','480,37 €','1.206,37 €','21 %','Dominio y renovaciones','sin descubierto','se conserva','saldo no consumido'])assert.ok(html.toLowerCase().includes(text.toLowerCase()),text);
  assert.match(html,/<p class="static-example">[\s\S]*?267,49 €/);
  assert.match(html,/primeros 1\.000/i);
  assert.match(html,/mes natural/);
  assert.match(html,/0,0200 USD/);
  assert.match(html,/0,0707 USD/);
  assert.match(html,/sin los 100 min ni las 500 respuestas incluidos/);
  assert.match(html,/no muestra un monedero ya operativo/);
});
test('Sin servicios reales ni información interna en la propuesta',()=>{
  assert.doesNotMatch(html+js+pricing,/api[_-]?key|Bearer\s|CRITERIO_INTERNO|97 USD|107 USD|41[,.]577|0[,.]19873/i);
  assert.doesNotMatch(js+pricing,/fetch\s*\(|XMLHttpRequest|WebSocket|getUserMedia|sendBeacon/);
  assert.doesNotMatch(html,/<iframe|demo-config\.js|src="https?:/);
  assert.match(html,/Sin citas, llamadas ni envíos reales/);
  assert.match(html,/Google Calendar, WhatsApp y telefonía del centro todavía no están conectados/);
});
test('Recursos locales, IDs únicos y anclas válidas',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    const resource=match[1].split('?')[0];
    if(!/^(https?:|mailto:|tel:)/.test(resource))assert.ok(fs.existsSync(path.resolve(root,resource)),resource);
  }
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),match[1]);
});
