---
type: spec
id: NNN
title: <título corto y concreto>
aliases: []
status: draft
risk: R1
created: YYYY-MM-DD
owner:
approved_by:
approved_at:
---

<!-- Cómo usar: R1 → «spec-lite» (Contexto, Requisitos, Criterios de aceptación, Fuera de alcance). R2/R3 → todas las secciones. Describe QUÉ y POR QUÉ, no el cómo. Lo que no sepas: [NEEDS CLARIFICATION: pregunta]. No se aprueba con marcadores abiertos (lo comprueba el gate). Propiedades: una clave por línea. En Obsidian, rellena `aliases` con «NNN · título» para encontrarla en el buscador. -->

## 1. Contexto y problema
<!-- ¿Qué duele hoy? ¿Para quién? ¿Qué pasa si no se hace? Enlaza contrato/ticket/incidente. -->

## 2. Objetivos y no-objetivos
**Objetivos**
-

**Fuera de alcance (explícito)**
-

## 3. Requisitos
<!-- Formato EARS: «CUANDO <disparador> EL SISTEMA DEBERÁ <respuesta medible>». Un requisito = una sola cosa verificable. IDs REQ-n (el gate los traza hasta una tarea). -->
- **REQ-1.** CUANDO … EL SISTEMA DEBERÁ …
- **REQ-2.** MIENTRAS … EL SISTEMA DEBERÁ …
- **REQ-3.** SI <condición no deseada> ENTONCES EL SISTEMA DEBERÁ …

**No funcionales** (rendimiento, latencia, disponibilidad, retención de datos, cumplimiento):
-

## 4. Criterios de aceptación
<!-- Cada criterio enlaza a ≥1 requisito (columna 2) y dice CÓMO se verificará. Cada criterio debe aparecer en la línea «Cubre:» de alguna tarea del plan. -->
| ID | Requisito | Dado / Cuando / Entonces | Verificación |
|---|---|---|---|
| AC-1 | REQ-1 | Dado … cuando … entonces … | test unitario / integración / simulación FAT / manual |

## 5. Modos de falla y estado seguro  *(obligatorio en R2/R3: el gate exige al menos una fila rellena)*
| Falla (comunicación, sensor, dato inválido, timeout, reinicio, energía) | Efecto | Detección | Estado seguro / respuesta | Criterio |
|---|---|---|---|---|
| | | | | AC-? |

## 6. Interfaces y datos
<!-- APIs, tags/señales, tópicos MQTT, registros Modbus, nodos OPC UA, esquemas, unidades, rangos, frecuencias, sincronización horaria. -->

## 7. Supuestos, dependencias y riesgos
-

## 8. Preguntas abiertas
<!-- Cada una: pregunta · quién decide · fecha límite. Debe quedar vacío para aprobar. -->
-

## 9. Decisiones relacionadas
<!-- Enlaces a ADR, p. ej. [[adr/0003-broker-mqtt]] -->
