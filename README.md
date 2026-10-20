# Bienestar Animal Almerimar · demostración

Landing independiente preparada por OMNIA, sin precios ni citas reales. Verde del centro, tipografía editorial, fondos cálidos, fotografías publicadas de sus instalaciones e interacciones adaptadas a móvil.

## Uso

Abrir mediante un servidor web. Desarrollo: `python -m http.server 5197 --bind 127.0.0.1`.

Sin compilación, claves privadas o backend propio. Chat y voz se cargan exclusivamente tras solicitar la prueba y aceptar su aviso. Son dos widgets nativos separados. Desactivar y recargar retira los asistentes del navegador, no borra conversaciones ya enviadas.

## Límites

- Agenda aislada de demostración. La reserva se crea realmente en el CRM de prueba; ninguna cita llega a la clínica. Usa datos de ejemplo y tu propio correo si deseas recibir la confirmación.
- El asistente recoge motivo, mascota/especie, propietario, teléfono y correo para la confirmación, pide validar el resumen y consulta el calendario antes de reservar. El responsable recibe un aviso independiente.
- Sin conexión a teléfono, WhatsApp, calendarios o pacientes reales.
- Asistente administrativo: no diagnostica, prescribe ni presta atención urgente.
- Recorrido de cinco pasos: simulación local separada, sin envíos ni reservas.
- Cancelaciones y cambios solo realizados tras confirmación de la herramienta.
- Correos administrativos activados: confirmación, cambio y cancelación al cliente y al responsable; recordatorio al cliente 24 horas antes. SMS y WhatsApp desactivados. Las demás automatizaciones de captación o fidelización son propuestas, no funciones conectadas.
- Horarios publicados discrepantes: confirmar con el centro.
- Sin reseñas inventadas, nombres de equipo, precios o cifras sin verificar.

Fuentes: [web del centro](https://www.cvbienestaranimalalmerimar.es/), [servicios](https://www.cvbienestaranimalalmerimar.es/servicios), [contacto](https://www.cvbienestaranimalalmerimar.es/contacto), [galería](https://www.cvbienestaranimalalmerimar.es/galeria). Derechos de las imágenes de sus titulares. El uso en la preview no implica autorización para la web definitiva.

## Propuesta comercial

La propuesta del 20 de octubre de 2026 está en [/propuesta/](https://jmcabeo-ai.github.io/bienestar-animal-almerimar-demo/propuesta/?v=20261020-recordatorios). Implantación 997 € (600 € + 397 €). Tras los primeros 30 días con cuota 0 € y consumo aparte: plan flexible 147 € web/CRM + 50 € recepción IA = 197 €/mes, con 100 min y 500 respuestas de texto compartidas entre WhatsApp y chat; excesos de 0,29 €/min y 0,04 €/respuesta. Alternativa de recepción IA ilimitada por 397 €/mes, bajo uso razonable para una sede. Conexión WhatsApp, receptor español y red entrante ordinaria incluidos en ambos; Meta aparte a coste real. Todos los precios + IVA. Se detallan dominio, Vodafone y ampliaciones con autorización previa.

Las 6 automatizaciones básicas de la base de147€ quedan definidas por activador y resultado: registro de consulta, confirmación de reserva con aviso al responsable, dos recordatorios (24h y, a elección del centro, 2h o1h antes; solo horarios futuros al reservar), cambio/cancelación con revisión de avisos, pendiente al equipo y reseña tras asistencia confirmada. Sus correos administrativos están incluidos; enviar avisos por WhatsApp puede generar Meta. Se configuran y prueban durante la implantación. Preventivos, recuperación, campañas y nuevas integraciones requieren presupuesto previo.

El monedero prepago con Stripe se describe como servicio a preparar durante la implantación; no existe pago ni monedero funcional en esta página. La calculadora local compara los dos planes y separa cuota, consumo, Meta e IVA, incluidos el periodo inicial y las franquicias. La información esencial permanece sin JavaScript y en impresión. Sus interacciones usan datos ficticios y no realizan llamadas, envíos ni reservas. No carga los asistentes de la demo raíz.

Pruebas: `node --test tests/*.test.cjs`. No requiere compilación ni dependencias. La impresión incluye el alcance y las condiciones; el movimiento respeta las preferencias del dispositivo y puede pausarse desde el pie.
