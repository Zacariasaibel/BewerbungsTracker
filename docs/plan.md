# Plan de BewerbungsTracker

## Objetivo

Crear un gestor de candidaturas para un portfolio de prácticas FIAE, aprendiendo paso a paso y trabajando por hitos. La interfaz estará en alemán y el código en inglés. Solo se utilizarán datos ficticios.

## Stack previsto

- Frontend: Angular y TypeScript.
- Backend: Python, Django y Django REST Framework.
- Base de datos: SQLite.
- Control de versiones: Git.

Angular queda pendiente. Para el backend se ha elegido Django 5.2 LTS y una versión estable de Django REST Framework compatible con Python 3.13. Las versiones exactas se fijarán después de completar su instalación; la descarga está bloqueada por el proxy del entorno del agente.

La Product Inventory API está en otro ordenador y no se ha revisado. Prepararemos un backend nuevo para BewerbungsTracker, sin asumir ni reutilizar su estructura.

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
| Bewerbungsdatum | application_date |
| Link | link |
| Notizen | notes |
| Nachfassdatum | follow_up_date |

Estados visibles: **Beworben**, **Vorstellungsgespräch**, **Absage** y **Zusage**. Los identificadores internos se definirán en inglés al diseñar el modelo.

Antes de implementar el resumen y los seguimientos, se concretarán sus reglas: qué cifras mostrar, cómo tratar candidaturas cerradas y qué fechas se consideran pendientes.

## Fases e hitos

1. **Inspección y planificación (completado).** Revisar la carpeta, detectar las herramientas y documentar el alcance y el entorno.
2. **Preparación del proyecto.** Acordar estructura y versiones compatibles, preparar Git y los archivos de configuración e instalar las dependencias necesarias.
3. **Backend y datos.** Primero preparar un backend nuevo con `backend/config`, la app `applications`, SQLite y las migraciones iniciales. Después, en otro hito, diseñar el modelo, las validaciones y la API REST; preparar datos ficticios y verificar CRUD, búsqueda y filtro.
4. **Frontend.** Crear la interfaz en alemán con listado, formulario, edición, eliminación, búsqueda y filtro. Conectarla con la API y mostrar estados de carga y errores.
5. **Resumen y seguimientos.** Implementar las reglas acordadas y comprobarlas con datos ficticios.
6. **Revisión y portfolio.** Verificar los flujos principales, mejorar accesibilidad y presentación, y documentar instalación, uso y decisiones técnicas.

En cada hito se explicará en español sencillo qué se hace, por qué y cómo se comprueba. El trabajo avanzará por hitos según las instrucciones del usuario.

## Límites del hito actual

- Preparar únicamente la base del backend; el modelo de candidatura y los endpoints vendrán después.
- Instalar dependencias únicamente en `.venv`, sin actualizar Python ni las herramientas globales.
- El usuario hará el commit desde su terminal PowerShell.
- No revisar ni asumir la estructura de la Product Inventory API ubicada en otro ordenador.
