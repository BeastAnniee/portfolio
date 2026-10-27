# Constitución de portafolio

Principios no negociables. Cualquier spec, plan o cambio que los contradiga debe rechazarse o justificarse en un ADR aprobado por un humano. Este archivo está protegido por `askPaths`: modificarlo requiere confirmación.

## Principios universales

**P1. Evidencia antes que afirmaciones.** Un cambio está «hecho» cuando hay un comando ejecutado y su salida vista; nunca por confianza.

**P2. Especificar antes de construir.** Sin spec aprobada y plan aprobado no hay código de producto (excepto R0).

**P3. Tests primero donde hay lógica.** Reglas de negocio, control, transformaciones de datos y parsers se prueban antes de implementarse. Un test que no puede fallar no cuenta.

**P4. Cambios pequeños, reversibles y trazables.** Un cambio = una intención. Todo commit enlaza a una spec; todo despliegue tiene vuelta atrás.

**P5. Falla de forma segura y visible.** Errores explícitos, sin excepciones tragadas, sin valores por defecto que oculten un fallo. Timeouts, límites y reintentos acotados en todo I/O.

**P6. Validar en el borde.** Toda entrada externa (red, archivos, PLC, sensores, usuarios) se valida en rango, tipo, unidad y frescura antes de usarse.

**P7. Cero secretos en el repo.** Credenciales solo en gestor de secretos / variables de entorno; nunca en código, logs ni commits.

**P8. Simplicidad.** Sin abstracciones, dependencias ni flexibilidad especulativas. Toda dependencia nueva requiere ADR.

**P9. Los humanos aprueban los extremos.** Spec, plan y merge los aprueba una persona. El agente no se auto-aprueba ni salta puertas.

**P10. Aprender de cada defecto.** Todo defecto escapado produce un test de regresión y, si procede, una mejora del proceso (`/tc-retro`).

## Reglas específicas del proyecto

<!-- TC:FILL — Reglas propias: estándares del cliente, normativas aplicables (IEC 62443, ISA-18.2, ISO 13849…), convenciones de naming de tags, ventanas de despliegue, límites de latencia, etc. -->

## Gobernanza

- Se modifica mediante PR con aprobación humana y, si cambia un principio, un ADR.
- Última revisión: 2026-10-27
