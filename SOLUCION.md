# Solución — Reto 01

> Documento de trabajo. Se completará a medida que se inspeccionen el PRD y los fixtures reales.

## Objetivo
Construir un agente conversacional en TypeScript que lea solicitudes, cruce información con el repositorio maestro, valide datos, complete formularios y arme el paquete para firma.

## Principios de diseño
- El LLM interpreta y orquesta; no es fuente de verdad.
- Las herramientas tienen contratos Zod.
- Las reglas críticas se ejecutan en backend.
- El repositorio maestro es la fuente autoritativa.
- Las acciones de impacto requieren confirmación humana.
- El flujo crítico debe ser reproducible sin LLM mediante `demo.ts`.

## Seguridad
Pendiente de completar con threat model, prompt injection, mínimo privilegio, auditoría, gestión de secretos y protección de datos.

## Costos
Pendiente de seleccionar modelo y estimar tokens por caso.

## Producción
Pendiente de documentar despliegue, observabilidad, rate limiting, timeouts, retries y gestión de archivos.
