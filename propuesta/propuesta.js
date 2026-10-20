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

const currency=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'});
const amount=cents=>currency.format(cents/100);
let billingPeriod='paid';
function updateBilling(){
 const initial=billingPeriod==='initial';
 $$('[data-period]').forEach(button=>{const active=button.dataset.period===billingPeriod;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 $('#billing-plan').disabled=initial;
 const fields=[$('#voice-minutes'),$('#ai-replies'),$('#meta-estimate')];
 const valid=fields.every(field=>field.value.trim()!=='' && field.validity.valid && Number.isFinite(Number(field.value)) && Number(field.value)>=0);
 if(!valid){
   $('#billing-total').textContent='—';
   $$('.billing-lines dd').forEach(node=>node.textContent='—');
   $('#billing-explanation').textContent='Introducid valores válidos: minutos e importe Meta desde 0, y respuestas enteras desde 0. No se calcula un total con datos vacíos o negativos.';
   $('#plan-comparison').textContent='';
   return;
 }
 const minutes=Number(fields[0].value);
 const replies=Number(fields[1].value);
 const voiceSeconds=Math.round(minutes*60);
 if(!Number.isSafeInteger(voiceSeconds)||!Number.isSafeInteger(replies)){
   $('#billing-total').textContent='—';
   $$('.billing-lines dd').forEach(node=>node.textContent='—');
   $('#billing-explanation').textContent='El consumo introducido es demasiado grande para este ejemplo.';
   $('#plan-comparison').textContent='';
   return;
 }
 const plan=$('#billing-plan').value;
 const result=ProposalPricing.estimate({period:billingPeriod,plan,voiceSeconds,replies,metaEUR:Number(fields[2].value)});
 $('#billing-total').textContent=amount(result.totalCents);
 $('#billing-fee').textContent=currency.format(result.fee);
 $('#billing-voice').textContent=amount(result.voiceCents);
 $('#billing-replies').textContent=amount(result.replyCents);
 $('#billing-meta').textContent=amount(result.metaCents);
 $('#billing-wallet').textContent=amount(result.walletCents);
 $('#billing-net').textContent=amount(result.netCents);
 $('#billing-vat').textContent=amount(result.vatCents);
 const extraMinutes=new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(result.extraSeconds/60);
 $('#billing-explanation').textContent=initial
   ?'Primeros 30 días: cuota 0 €. Todo el uso IA se paga por consumo: sin 100 min ni 500 respuestas incluidos y sin modalidad ilimitada. Meta se suma si corresponde.'
   :plan==='unlimited'
   ?'Periodo pagado de IA ilimitada: voz y respuestas IA sin exceso. El consumo del monedero de este ejemplo corresponde solo a Meta.'
   :extraMinutes+' min y '+result.extraReplies+' respuestas IA por encima de lo incluido. Meta se suma de forma independiente.';
 const saving=result.standardNetCents-result.unlimitedNetCents;
 $('#plan-comparison').textContent=initial
   ?'El plan seleccionado se aplica desde el día 31. No incluye la implantación de 997 € + IVA.'
   :saving>0
   ?'Para este mismo uso, la ilimitada reduce el total en '+amount(saving)+' sin IVA. Meta es el mismo en ambos ejemplos.'
   :saving<0
   ?'Para este mismo uso, la flexible cuesta '+amount(-saving)+' menos, sin IVA. Meta es el mismo en ambos ejemplos.'
   :'Con este uso, ambos planes tienen el mismo coste. Meta es el mismo en ambos ejemplos.';
}
$$('[data-period]').forEach(button=>button.addEventListener('click',()=>{billingPeriod=button.dataset.period;updateBilling();}));
$('#billing-plan').addEventListener('change',updateBilling);
['#voice-minutes','#ai-replies','#meta-estimate'].forEach(selector=>$(selector).addEventListener('input',updateBilling));

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
