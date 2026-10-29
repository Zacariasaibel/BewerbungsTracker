# Entorno detectado

Fecha de revisión: 29 de octubre de 2026.

## Carpeta revisada

Ruta: `C:\Users\UserS2025\Desktop\BewerbungsTracker`.

La carpeta estaba vacía al comenzar, incluidos los elementos ocultos. No se encontraron archivos existentes, instrucciones locales `AGENTS.md`, aplicaciones ni configuración del proyecto. No se ha sobrescrito ningún archivo.

La comprobación con `git rev-parse --is-inside-work-tree` confirmó que la carpeta no pertenece a un repositorio Git. No se ha inicializado uno.

## Herramientas

| Herramienta | Versión detectada | Comprobación |
| --- | --- | --- |
| Python | 3.13.3 | `python --version` |
| Lanzador de Python (`py`) | Ejecuta Python 3.13.3 | `py --version` |
| Node.js | v24.11.1 | `node --version` |
| npm | 11.6.2 | `npm.cmd --version` |
| Git | 2.52.0.windows.1 | `git --version` |

Rutas detectadas:

- Python: `C:\Users\UserS2025\AppData\Local\Programs\Python\python.exe`.
- Lanzador de Python: `C:\Users\UserS2025\AppData\Local\Programs\Python\Launcher\py.exe`.
- Node.js: `C:\Users\UserS2025\Documents\node-v24.11.1-win-x64\node.exe`.
- npm resuelto por PowerShell: `C:\Users\UserS2025\Documents\node-v24.11.1-win-x64\npm.ps1`.
- Git: `C:\Users\UserS2025\AppData\Local\Programs\Git\cmd\git.exe`.

## Problemas encontrados

1. **PowerShell bloquea `npm --version`.** El comando resuelve a `npm.ps1`, pero la política de ejecución impide ejecutar ese script. La alternativa `npm.cmd --version` funciona y permite consultar la versión sin cambiar políticas ni permisos. En este entorno se puede utilizar `npm.cmd` en los siguientes hitos.
2. **Git aún no está inicializado.** Es el estado inicial de la carpeta, no un fallo de la instalación de Git. Su preparación queda para el siguiente hito.

## Alcance de la comprobación

Se consultaron las versiones de las herramientas solicitadas. No se instalaron ni actualizaron herramientas; tampoco se modificaron políticas de PowerShell ni se generó la aplicación.

No se comprobó la instalación de Angular, TypeScript, Django o Django REST Framework, ni la compatibilidad entre sus futuras versiones. Esto se revisará antes de preparar el proyecto. SQLite se mantiene como base de datos prevista; no se verificó su versión en este hito.

La otra API Django de productos no se ha inspeccionado y no se asume ninguna estructura ni configuración suya.
