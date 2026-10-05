(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    $('#main-nav').classList.toggle('open', open);
  });
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); $('#main-nav').classList.remove('open'); };
  $$('#main-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const services = {
    general: ['Medicina general y prevención.', 'La web del centro publica medicina general, prevención, vacunaciones e identificación animal. Son cuidados que el equipo valora según cada animal. También comunica certificación veterinaria. Consulta directamente con la clínica las condiciones y los requisitos de una visita real.'],
    surgery: ['Cirugía y traumatología.', 'El centro publica atención quirúrgica y traumatología veterinaria. La valoración, la indicación y la planificación de cualquier intervención corresponden al equipo clínico. La recepción de demostración no recomienda tratamientos ni reserva operaciones.'],
    diagnostics: ['Diagnóstico y laboratorio.', 'La web del centro comunica diagnóstico por imagen y laboratorio veterinario. Estas pruebas forman parte de los servicios publicados; su necesidad y sus condiciones deben confirmarse en consulta. El asistente no interpreta resultados ni informes.'],
    dental: ['Salud bucodental.', 'La odontología veterinaria figura entre los servicios del centro. El equipo te orientará sobre la valoración clínica y el cuidado adecuado para tu animal. No damos diagnósticos, tratamientos o precios desde esta demo.'],
    hospital: ['Hospitalización y certificados.', 'El centro comunica hospitalización y certificación veterinaria. Contacta con el equipo para conocer disponibilidad, requisitos y condiciones actuales. No asumimos hospitalización con personal presente las 24 horas ni reservamos ingresos desde la demostración.'],
    horses: ['Atención equina.', 'La web del centro publica atención equina: consultas generales, medicina deportiva, diagnóstico, reproducción y cirugía. La coordinación debe realizarse directamente con el equipo. La agenda ficticia de esta demo no reserva visitas equinas ni intervenciones.']
  };
  $$('[data-species]').forEach(button => button.addEventListener('click', () => {
    const horses = button.dataset.species === 'horses';
    $('#pet-services').hidden = horses;
    $('#horse-services').hidden = !horses;
    $$('[data-species]').forEach(item => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
  }));
  $$('[data-service]').forEach(button => button.addEventListener('click', () => {
    const [title, copy] = services[button.dataset.service];
    $('#service-dialog-title').textContent = title;
    $('#service-dialog-copy').textContent = copy;
    $('#service-dialog').showModal();
  }));
  $$('[data-photo]').forEach(button => button.addEventListener('click', () => {
    $('#photo-full').src = button.dataset.photo;
    $('#photo-full').alt = button.dataset.caption;
    $('#photo-caption').textContent = button.dataset.caption + ' · Fotografía publicada por el centro';
    $('#photo-dialog').showModal();
  }));
  $$('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog a[href^="#"]').forEach(link => link.addEventListener('click', () => link.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));

  const steps = [
    ['«Luna necesita su revisión anual.»', 'La recepción recoge el motivo, nombre y especie de la mascota, propietario y teléfono. Para recibir la confirmación de prueba, puedes facilitar tu propio correo. No pide diagnósticos ni informes.'],
    ['«En este ejemplo: martes, 10:00 o 11:00.»', 'Son horarios escritos para esta simulación local, no disponibilidad del centro ni de la agenda de IA. En el asistente, los huecos se consultan mediante la herramienta del calendario ficticio.'],
    ['«Confirmo los datos y la cita de prueba.»', 'En el asistente, la reserva se registra realmente en el CRM de demostración: el propietario recibe su confirmación por correo y el responsable un aviso independiente. Este recorrido local no guarda ni envía nada.'],
    ['«Ejemplo: recuerda tu cita de mañana.»', 'Vista previa del recordatorio administrativo por correo, según las reglas de la agenda de prueba. Este recorrido local no envía mensajes. No hay SMS ni WhatsApp conectados.'],
    ['«Necesito cambiar o cancelar mi cita de prueba.»', 'El asistente identifica tu cita, confirma el cambio y actualiza la agenda conectada. Los avisos de cambio o cancelación llegan al cliente y al responsable por correo. Este recorrido local no modifica ninguna reserva.']
  ];
  let activeStep = 0;
  const showStep = index => {
    activeStep = index;
    const content = $('#journey-content');
    content.querySelector('h3').textContent = steps[index][0];
    content.querySelector('p').textContent = steps[index][1];
    $$('[data-step]').forEach(button => { const selected = Number(button.dataset.step) === index; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); });
    $('#journey-next').firstChild.textContent = index === 4 ? 'Volver al inicio ' : 'Siguiente paso ';
  };
  $$('[data-step]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.step))));
  $('#journey-next').addEventListener('click', () => showStep((activeStep + 1) % steps.length));
  $$('[data-copy-prompt]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copyPrompt); $('#copy-status').textContent = 'Pregunta copiada. Pégala en el chat después de activarlo.'; }
    catch { $('#copy-status').textContent = 'Puedes copiar esta pregunta: ' + button.dataset.copyPrompt; }
  }));

  let requestedMode = null;
  const loaded = new Map();
  const config = window.BIENESTAR_DEMO || {enabled:false};
  $$('[data-open-privacy]').forEach(button => button.addEventListener('click', () => {
    requestedMode = null;
    $('#confirm-demo').hidden = true;
    $('#privacy-dialog').showModal();
  }));
  $$('[data-start-demo]').forEach(button => button.addEventListener('click', () => {
    if (!config.enabled) { $('#demo-status').textContent = 'La adaptación del asistente está en revisión. No se cargan proveedores hasta completar las pruebas.'; return; }
    requestedMode = button.dataset.startDemo;
    if (loaded.has(requestedMode)) { $('#demo-status').textContent = requestedMode === 'voice' ? 'La voz está activa. Usa el botón nativo del visualizador y permite el micrófono solo si quieres hablar.' : 'El chat está activo. Abre la burbuja de conversación para escribir.'; return; }
    $('#confirm-demo').hidden = false;
    $('#confirm-demo').disabled = false;
    $('#privacy-dialog').showModal();
  }));
  const loadWidget = (mode, id) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://widgets.leadconnectorhq.com/loader.js';
    script.dataset.resourcesUrl = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
    script.dataset.widgetId = id;
    script.dataset.demoMode = mode;
    script.onload = resolve;
    script.onerror = () => { script.remove(); reject(new Error('Widget no disponible')); };
    if (mode === 'voice') $('#voice-widget-mount').replaceChildren(script);
    else document.body.append(script);
  });
  $('#confirm-demo').addEventListener('click', async () => {
    const mode = requestedMode;
    const id = mode === 'voice' ? config.voiceWidget : config.textWidget;
    if (!config.enabled || !mode || !id || loaded.has(mode)) return;
    loaded.set(mode, 'loading');
    $('#privacy-dialog').close();
    $('#demo-status').textContent = 'Cargando ' + (mode === 'voice' ? 'la prueba de voz…' : 'el chat de prueba…');
    $('#stop-demo').hidden = false;
    try {
      await loadWidget(mode, id);
      loaded.set(mode, 'loaded');
      $('#demo-status').textContent = mode === 'voice' ? 'Voz cargada. Usa datos de ejemplo y, si quieres recibir la confirmación, tu propio correo. El navegador puede solicitar el micrófono.' : 'Chat cargado. Usa datos de ejemplo y tu propio correo si quieres recibir la confirmación de prueba. Abre la burbuja para conversar.';
      const button = $('[data-start-demo="' + mode + '"]');
      button.firstChild.textContent = mode === 'voice' ? 'Prueba de voz activada ' : 'Chat de prueba activado ';
      if (mode === 'chat') document.body.classList.add('chat-active');
    } catch {
      loaded.delete(mode);
      $('#demo-status').textContent = 'No se ha podido cargar el asistente. Reintenta o recarga la página. No se ha creado ninguna cita.';
      if (mode === 'voice') $('#voice-widget-mount').textContent = 'Visualizador no disponible. Puedes volver a intentarlo.';
    }
  });
  $('#stop-demo').addEventListener('click', () => location.reload());
  const motion = $('#motion-toggle');
  motion.addEventListener('click', () => {
    const paused = document.body.classList.toggle('motion-paused');
    motion.setAttribute('aria-pressed', String(paused));
    motion.textContent = paused ? 'Reanudar animaciones' : 'Pausar animaciones';
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold:0.08});
    $$('.section-head, .manifesto>div, .clinic-copy, .journey-intro, .opportunity-grid article, .confidence>div:first-child, .contact>div:first-child').forEach(element => { element.classList.add('reveal'); observer.observe(element); });
    document.body.classList.add('js-ready');
  }
})();
