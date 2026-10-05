const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
test('Secciones de conversión completas, sin precios o identidad anterior', () => {
  for (const id of ['inicio','servicios','centro','urgencias','demo','resenas','dudas','contacto']) assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(!/Paco|fisioterapia|\b197\b|\b597\b|€|\bGHL\b/.test(html));
  assert.match(html,/no reserva citas reales/i);
  assert.match(html,/SIMULACIÓN LOCAL/);
});
test('IDs únicos y anclas internas resueltas', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const link of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(link[1]), link[1]);
});
test('Recursos locales y textos alternativos de imágenes', () => {
  for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const resource=match[1].split('?')[0];
    if(!/^(https?:|tel:|mailto:)/.test(resource)) assert.ok(fs.existsSync(path.join(root,resource)),resource);
  }
  for(const image of html.matchAll(/<img\b[^>]+>/g)) assert.match(image[0],/\balt="[^"]*"/);
});
test('Contacto y límites de urgencias verificables', () => {
  assert.match(html,/tel:\+34607168173/); assert.match(html,/tel:\+34950497048/);
  assert.match(html,/Calle Jabeque/); assert.match(html,/Local 7/);
  assert.match(js,/no interpreta resultados/);
});
test('Carga de proveedores solo tras activación explícita, sin credenciales', () => {
  assert.ok(!html.includes('widgets.leadconnectorhq.com'));
  assert.match(js,/confirm-demo.*addEventListener/);
  assert.match(js,/if \(!config.enabled \|\| !mode \|\| !id/);
  assert.ok(!/PRIVATE.*TOKEN|Bearer |api[_-]?key\s*[:=]/i.test(html+js));
  assert.match(js,/location.reload\(\)/);
});
test('Prueba administrativa con motivo, reserva CRM y email informado', () => {
  assert.match(html,/motivo de consulta, mascota y datos administrativos/);
  assert.match(html,/propio correo/);
  assert.match(html,/avisos administrativos reales/);
  assert.match(html,/no cancela la cita, los avisos programados/);
  assert.match(js,/motivo, nombre y especie de la mascota, propietario y teléfono/);
});
test('Accesibilidad y movimiento móvil con alternativa reducida', () => {
  assert.match(html,/lang="es"/); assert.match(html,/skip-link/);
  assert.match(html,/aria-live="polite"/); assert.match(html,/aria-controls="main-nav"/);
  assert.match(css,/prefers-reduced-motion/); assert.match(css,/focus-visible/);
  assert.match(css,/motion-paused/); assert.match(html,/motion-toggle/);
});
