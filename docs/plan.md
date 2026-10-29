# Plan de BewerbungsTracker

## Objetivo

Crear un gestor de candidaturas para un portfolio de prácticas FIAE, aprendiendo paso a paso y trabajando por hitos. La interfaz estará en alemán y el código en inglés. Solo se utilizarán datos ficticios.

## Stack previsto

- Frontend: Angular y TypeScript.
- Backend: Python, Django y Django REST Framework.
- Base de datos: SQLite.
- Control de versiones: Git.

El MVP local está implementado y comprobado. El backend usa Django 5.2.18 y Django REST Framework 3.18.3 en `.venv`; el frontend usa Angular CLI 21. El usuario confirmó la instalación, el build, las doce pruebas Angular y el flujo en navegador, con revisión de escritorio y móvil. El agente ejecutó las verificaciones del backend y de la lógica TypeScript. Véanse `docs/development.md` y `docs/test-checklist.md`.

La Product Inventory API está en otro ordenador y no se ha revisado. Se creó un backend independiente para BewerbungsTracker, sin asumir ni reutilizar su estructura.

## MVP

- Crear, consultar, editar y eliminar candidaturas.
- Buscar por empresa.
- Filtrar por estado.
- Mostrar un resumen de candidaturas y seguimientos pendientes.

Cada candidatura tendrá estos campos:

| Campo en la interfaz | Nombre previsto en el código |
| --- | --- |
| Unternehmen | company |
| Position | position |
| Standort | location |
| Status | status |
| Bewerbungsdatum | applied_on |
| Link | job_url |
| Notizen | notes |
| Nachfassdatum | next_action_on |

Estados visibles: **Beworben**, **Vorstellungsgespräch**, **Absage** y **Zusage**. Valores internos: `applied`, `interview`, `rejected` y `accepted`.

Las reglas del resumen y los seguimientos están definidas en `docs/development.md`: solo las candidaturas abiertas con fecha de seguimiento de hoy o anterior cuentan como pendientes.

## Fases e hitos

1. **Inspección y planificación (completado).** Revisar la carpeta, detectar las herramientas y documentar el alcance y el entorno.
2. **Preparación del proyecto (completado).** Estructura, Git, configuración y dependencias preparados.
3. **Backend y datos (completado).** Modelo, validación, API REST, SQLite, migraciones y demo repetible implementados y probados.
4. **Frontend (completado).** Interfaz alemana conectada a la API, CRUD, búsqueda y filtro, estados de carga y errores; build y doce pruebas confirmados por el usuario.
5. **Resumen y seguimientos (completado para el MVP local).** Reglas implementadas, lógica probada y vistas incluidas en la revisión del frontend.
6. **Revisión del MVP local (completado).** Flujo principal y diseño de escritorio y móvil confirmados por el usuario; documentación actualizada. Historial, despliegue y rediseño del portfolio quedan para bloques posteriores.

En cada hito se explicará en español sencillo qué se hace, por qué y cómo se comprueba. El trabajo avanzará por hitos según las instrucciones del usuario.

## Límites del hito actual

- Entregar el MVP local con frontend, API y demo; historial, despliegue y rediseño del portfolio quedan para otros bloques.
- Mantener las dependencias del backend en `.venv` y las del frontend en `frontend/node_modules`, sin actualizar las herramientas globales.
- Usar solo datos ficticios en la demo local, sin autenticación; restringir la escritura y preparar producción antes de publicar.
- El usuario hará el commit desde su terminal PowerShell.
- No revisar ni asumir la estructura de la Product Inventory API ubicada en otro ordenador.
