'use strict';

document.documentElement.classList.add('js');
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = motionPreference.matches;
let step = 0;
let channel = 'call';
let changed = false;
let cancelled = false;
let attended = false;

const channels = {
  call: {label:'Recepción por llamada · Ejemplo escrito', icon:'phone', note:'Ejemplo escrito. No se activa el micrófono.', first:'Hola, quiero pedir una revisión para Luna, mi perra.'},
  whatsapp: {label:'WhatsApp · Conversación de ejemplo', icon:'chat', note:'Simulación local. No se envían mensajes.', first:'¡Hola! ¿Tenéis cita para una revisión de Luna? Es mi perra.'},
  web: {label:'Chat de la web · Conversación de ejemplo', icon:'chat', note:'Simulación local. No hay un chat real conectado.', first:'He visto vuestra web. Me gustaría reservar una revisión para Luna.'}
};

function bubble(text, author) {
  const node = document.createElement('div');
  node.className = `bubble ${author}`;
  node.textContent = text;
  return node;
}

function render() {
  const current = channels[channel];
  $('#channel-label').textContent = current.label;
  $('#channel-icon').setAttribute('href', `#${current.icon}`);
  $('#step-counter').textContent = `0${step + 1} / 04`;
  $$('.channel-switch button').forEach((button) => {
    const active = button.dataset.channel === channel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $$('.step-nav button').forEach((button) => {
    const active = Number(button.dataset.step) === step;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const time = changed ? '12:00' : '11:00';
  const messages = [
    [current.first, 'Claro. Te pediría los datos del tutor, la mascota y el motivo de la cita para ayudarte con la reserva.'],
    ['Soy Marta. Luna es una perra y necesita su revisión anual. ¿El miércoles por la mañana?', 'En este ejemplo, Google Calendar muestra libre el miércoles a las 11:00. ¿Te viene bien?'],
    cancelled ? ['Necesito cancelar la cita de ejemplo.', 'En este recorrido, la cita de Luna queda cancelada. No se pediría una reseña de una visita cancelada.'] : changed ? ['¿Podemos cambiar la cita de ejemplo a las 12:00?', 'En este recorrido, el nuevo horario se comprueba y la cita pasa a las 12:00, tras tu confirmación.'] : ['Sí, confirmo el miércoles a las 11:00.', 'En este recorrido, la reserva se reflejaría en vuestra agenda y se prepararía la confirmación por el canal acordado.'],
    cancelled ? ['La cita de ejemplo está cancelada.', 'Una cancelación no activa una solicitud de reseña. Primero tendría que existir una visita realizada y confirmada.'] : attended ? ['El equipo ha marcado la visita como realizada en OMNIA CRM.', 'Gracias por venir con Luna. Si te apetece, puedes compartir tu experiencia en Google. Tu opinión nos ayuda.'] : ['La hora de la cita ya ha pasado. ¿Se pide una reseña?', 'Todavía no. El equipo debe confirmar en OMNIA CRM que la visita se ha realizado.']
  ];
  const conversation = $('#conversation');
  const date = document.createElement('span');
  date.className = 'chat-date'; date.textContent = 'CONVERSACIÓN FICTICIA';
  const note = document.createElement('p'); note.className='phone-footnote'; note.textContent=current.note;
  conversation.replaceChildren(date, bubble(messages[step][0], 'customer'), bubble(messages[step][1], 'assistant'), note);

  const results = [
    '<h3>Una consulta<br>bien recibida.</h3><p>El asistente recoge los datos necesarios y responde con la información aprobada por el centro.</p><div class="data-preview"><span>Datos del tutor</span><span>Mascota y especie</span><span>Motivo de la cita</span></div>',
    '<h3>Disponibilidad real.<br>Reglas del centro.</h3><p>Se consultaría la agenda conectada antes de proponer un horario. Duración, bloqueos y profesionales se definen con vosotros.</p><div class="data-preview"><span>Consulta de huecos</span><span>Confirmación del tutor</span></div>',
    cancelled ? '<h3>La agenda,<br>actualizada.</h3><p>Ejemplo de cancelación: el hueco vuelve a quedar libre. Los cambios y cancelaciones reales solo se confirman tras una operación válida.</p><div class="example-actions"><button type="button" data-appointment="reset">Restaurar ejemplo</button></div>' : `<h3>${changed ? 'Un cambio.' : 'Una cita.'}<br>En vuestra agenda.</h3><p>Ejemplo: Luna · perra · revisión anual. Tutor: Marta. ${changed ? 'La cita cambia a las 12:00.' : 'Miércoles a las 11:00.'} Datos de cada mascota y avisos se validan antes de activar.</p><div class="example-actions"><button type="button" data-appointment="change">${changed ? 'Volver a las 11:00' : 'Probar cambio a las 12:00'}</button><button type="button" data-appointment="cancel">Probar cancelación</button></div>`,
    cancelled ? '<h3>Visita cancelada.<br>Sin petición de reseña.</h3><p>Las citas canceladas, las ausencias y las bajas quedan fuera. Puedes restaurar el ejemplo para explorar la asistencia.</p><div class="example-actions"><button type="button" data-appointment="reset">Restaurar ejemplo</button></div>' : attended ? '<h3>Ahora sí.<br>Escuchar su experiencia.</h3><p>Asistencia confirmada por el equipo en OMNIA CRM. La petición es neutral y se dirige a clientes elegibles, sin filtrar por satisfacción.</p><p class="review-message">«Gracias por venir con Luna. Si te apetece, puedes compartir tu experiencia en Google.»</p><div class="example-actions"><button type="button" data-appointment="unattend">Deshacer confirmación del ejemplo</button></div>' : '<h3>Primero, la visita.<br>Después, la reseña.</h3><p>Que termine un evento en Calendar no prueba asistencia. El equipo marca la visita como realizada en OMNIA CRM para activar la petición.</p><button type="button" class="attendance-button" id="confirm-attendance">Simular asistencia confirmada</button>'
  ];
  $('#result-content').innerHTML = results[step];
  const event = $('#calendar-event');
  event.classList.toggle('booked', step >= 2 && !cancelled);
  event.classList.toggle('cancelled', step >= 2 && cancelled);
  const eventTitle = step < 2 ? 'Hueco disponible' : cancelled ? 'Luna · Cita cancelada' : 'Luna · Revisión anual';
  const eventSubtitle = step < 2 ? '30 minutos · Ejemplo' : cancelled ? 'Ejemplo · Hueco liberado' : `${time} — ${changed ? '12:30' : '11:30'} · Marta, tutora ficticia`;
  event.replaceChildren(Object.assign(document.createElement('b'), {textContent:eventTitle}), Object.assign(document.createElement('small'), {textContent:eventSubtitle}));
  $('.event-slot > span').textContent = step >= 2 && changed && !cancelled ? '12:00' : '11:00';
  const nextLabels = ['Ver horarios', 'Ver la cita', 'Después de la visita', 'Reiniciar recorrido'];
  $('#next-step').replaceChildren(document.createTextNode(nextLabels[step] + ' '));
  const icon = document.createElementNS('http://www.w3.org/2000/svg','svg'); icon.setAttribute('class','icon'); icon.setAttribute('aria-hidden','true');
  const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#arrow');icon.append(use);$('#next-step').append(icon);
}

$$('[data-channel]').forEach(button => button.addEventListener('click', () => {channel=button.dataset.channel;render();}));
$$('[data-step]').forEach(button => button.addEventListener('click', () => {step=Number(button.dataset.step);render();}));
$('#next-step').addEventListener('click', () => {if(step===3){step=0;changed=false;cancelled=false;attended=false;}else{step++;}render();});
$('#result-content').addEventListener('click', event => {
  const target=event.target.closest('button');if(!target)return;
  if(target.id==='confirm-attendance'){attended=true;render();$('#result-content [data-appointment="unattend"]').focus({preventScroll:true});return;}
  const action=target.dataset.appointment;
  if(action==='change'){changed=!changed;attended=false;}
  if(action==='cancel'){cancelled=true;attended=false;}
  if(action==='reset'){cancelled=false;changed=false;attended=false;}
  if(action==='unattend'){attended=false;}
  render();
  const focusTarget=$(`#result-content [data-appointment="${action}"]`) || $('#confirm-attendance') || $('#result-content button');
  focusTarget?.focus({preventScroll:true});
});

$$('[data-route]').forEach(button => button.addEventListener('click', () => {
  const unanswered=button.dataset.route==='unanswered';
  $$('[data-route]').forEach(item => {const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
  $('#route-condition').textContent=unanswered?'Si el equipo no contesta · Espera por acordar':'Desvío total';
  $('#routing-explanation').textContent=unanswered?'Primero suena vuestro móvil. Si el equipo no contesta, interviene el asistente tras el tiempo de espera acordado y validado.':'El asistente recibe directamente las llamadas desviadas. La activación y desactivación se hacen desde vuestro móvil.';
}));

const bundles = Object.freeze({0:{minutes:0,price:0},100:{minutes:100,price:49},250:{minutes:250,price:99},500:{minutes:500,price:179},750:{minutes:750,price:249}});
const currency=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0});
let billingPeriod='paid';
function updateBilling(){
 const initial=billingPeriod==='initial';
 const selected=bundles[$('#call-bundle').value];
 const base=initial?0:100;
 const fee=initial?0:197;
 const missing=initial&&selected.minutes===0;
 $$('[data-period]').forEach(button=>{const active=button.dataset.period===billingPeriod;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 $('#call-bundle').options[0].textContent=initial?'Elige un bono para empezar':'Solo los 100 min incluidos';
 $('#billing-label').textContent=initial?'SOLO BONO · SIN IVA':'CUOTA + BONO · SIN IVA';
 $('#billing-total').textContent=missing?'—':currency.format(fee+selected.price);
 $('#billing-minutes').textContent=missing?'Elige un bono':`${base+selected.minutes} min`;
 $('#billing-detail').textContent=initial?'Primeros 30 días · sin 100 min base':`${base} incluidos + ${selected.minutes} adicionales`;
 $('#billing-explanation').textContent=missing?'Mantenimiento 0 €. Seleccionad el bono de inicio; los 100 min incluidos comienzan con la primera cuota, desde el día 31.':initial?`Mantenimiento 0 €. ${currency.format(selected.price)} por el bono elegido: ${selected.minutes} minutos. Sin cuota ni otros 100 min de base.`:`${currency.format(fee)} de cuota + ${currency.format(selected.price)} de bono adicional = ${currency.format(fee+selected.price)} para ${base+selected.minutes} minutos. Los 100 de base ya están incluidos en la cuota.`;
 $('#call-equivalent').textContent=missing?'La elección se ajusta al volumen atendido por el agente.':`Equivale aproximadamente a ${Math.floor((base+selected.minutes)/3)} llamadas de 3 minutos. Ejemplo, no garantía.`;
}
$$('[data-period]').forEach(button=>button.addEventListener('click',()=>{billingPeriod=button.dataset.period;updateBilling();}));
$('#call-bundle').addEventListener('change',updateBilling);

function applyMotion(){
  document.body.classList.toggle('motion-paused',motionPaused);
  $('#motion-toggle').setAttribute('aria-pressed',String(motionPaused));
  $('#motion-toggle').textContent=motionPaused?'Activar movimiento':'Pausar movimiento';
}
$('#motion-toggle').addEventListener('click',()=>{motionPaused=!motionPaused;applyMotion();});
motionPreference.addEventListener('change',event=>{motionPaused=event.matches;applyMotion();});
applyMotion();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:0.08});$$('.reveal').forEach(node=>observer.observe(node));}else{$$('.reveal').forEach(node=>node.classList.add('visible'));}
let scrollQueued=false;
function updateScroll(){const max=document.documentElement.scrollHeight-window.innerHeight;$('#scroll-progress').style.transform=`scaleX(${max>0?Math.min(1,window.scrollY/max):0})`;scrollQueued=false;}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}},{passive:true});
window.addEventListener('resize',updateScroll);
let printState=[];
window.addEventListener('beforeprint',()=>{printState=$$('.conditions details,.demo-disclosure').map(node=>node.open);$$('.conditions details,.demo-disclosure').forEach(node=>{node.open=true;});});
window.addEventListener('afterprint',()=>{$$('.conditions details,.demo-disclosure').forEach((node,index)=>{node.open=printState[index]||false;});});
$('#print-proposal').addEventListener('click',()=>window.print());
render();updateBilling();updateScroll();
