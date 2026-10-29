# Entorno del proyecto

## Estado actual

El MVP local está implementado y comprobado. El usuario confirmó desde PowerShell la instalación npm, el build Angular y las doce pruebas Angular. También confirmó en navegador crear → recargar → buscar y filtrar → editar → eliminar, además de la revisión de escritorio y móvil.

El agente ejecutó anteriormente las 19 pruebas del backend, cinco pruebas de lógica TypeScript y un recorrido HTTP real con filtrado TypeScript. La atribución y los resultados están en [test-checklist.md](test-checklist.md). En este paso se actualizó únicamente documentación y se comprobó la preparación de Git, sin repetir las pruebas ni modificar código.

## Herramientas detectadas

| Herramienta | Versión registrada | Comprobación original |
| --- | --- | --- |
| Python | 3.13.3 | `python --version` y Python de `.venv` |
| Lanzador de Python | Ejecuta Python 3.13.3 | `py --version` |
| Node.js | 24.11.1 | `node --version` |
| npm | 11.6.2 | `npm.cmd --version` |
| Git | 2.52.0.windows.1 | `git --version` |
| Angular CLI global | 21.0.1 | `ng.cmd version` |
| SQLite incluido en Python | 3.49.1 | `sqlite3.sqlite_version` |

Son las versiones registradas durante la preparación, no una nueva comprobación de versiones en este paso. Las herramientas globales no se actualizaron. Las versiones resueltas del frontend están en `frontend/package-lock.json`.

Dependencias exactas registradas del backend en `backend/requirements.txt`:

- Django 5.2.18.
- Django REST Framework 3.18.3.
- asgiref 3.13.0.
- sqlparse 0.6.0.
- tzdata 2026.6.

Se consultaron las fuentes oficiales de [Django 5.2](https://docs.djangoproject.com/en/5.2/releases/5.2/), [DRF](https://www.django-rest-framework.org/) y [Angular](https://angular.dev/reference/versions) para la compatibilidad. Django y DRF recomiendan el último parche de la serie de Python; se conservó Python 3.13.3 y se verificó localmente la combinación instalada.

## Estructura y configuración

- Raíz del proyecto: `C:\Users\UserS2025\Desktop\BewerbungsTracker`; Git está inicializado.
- `.venv/`: entorno Python aislado, excluido de Git. Usar directamente su intérprete evita activar scripts de PowerShell.
- `backend/manage.py`: comandos administrativos de Django.
- `backend/config/`: configuración y rutas principales; mantiene Django Admin e incluye `/api/`.
- `backend/applications/`: modelo, serializer, ViewSet, rutas, pruebas y comando `seed_demo`.
- `backend/applications/migrations/0001_initial.py`: migración del modelo Application, aplicada y versionable.
- `backend/db.sqlite3`: base local excluida de Git, con diez candidaturas ficticias de demo cargadas por el agente. Repetir la demo no creó duplicados.
- `frontend/`: aplicación Angular standalone, TypeScript estricto, routing, CSS y proxy de desarrollo a Django; sin SSR ni otro repositorio Git.
- `frontend/package-lock.json`: resolución real de dependencias generada tras la instalación del usuario; debe versionarse.

Django registra `rest_framework` y `applications.apps.ApplicationsConfig`, usa SQLite, `LANGUAGE_CODE = "de"`, `TIME_ZONE = "Europe/Berlin"` y `USE_TZ = True`.

La Product Inventory API está en otro ordenador y no se ha revisado. El backend de BewerbungsTracker es independiente.

## Secretos y configuración de desarrollo

`SECRET_KEY` se lee de `DJANGO_SECRET_KEY`, sin clave de reserva en el código. La variable se prepara en cada sesión de PowerShell; no se cargan `.env` automáticamente:

```powershell
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

La clave aleatoria queda en el entorno de esa sesión, sin escribirse en archivos. Cambiarla invalida sesiones firmadas anteriores. Sin la variable, Django falla al cargar la configuración de forma intencionada.

Las reglas de `.gitignore` excluyen dependencias, entornos virtuales, cachés, SQLite y `.env`/`.env.*`; permiten un futuro `.env.example` sin secretos. La comprobación del lockfile no encontró URLs de paquetes con usuario o contraseña incrustados. No había archivos versionados que coincidieran con las exclusiones actuales.

## Incidencias anteriores resueltas y uso de PowerShell

- PowerShell bloqueó `npm.ps1`; se usa `npm.cmd`/`npx.cmd` sin cambiar la política de ejecución.
- La preparación inicial de pip encontró errores de permisos temporales; se dejó pip disponible en `.venv`. Posteriormente, el usuario instaló correctamente Django y DRF desde PowerShell.
- La instalación npm del agente encontró `ENOTCACHED` y un proxy inaccesible (`ECONNREFUSED 127.0.0.1:9`). El usuario completó la instalación y confirmó el build y las pruebas. No es un bloqueo actual del MVP.
- Se generó una referencia de Angular CLI 21 sin instalar dependencias ni crear Git en `.venv/angular-reference/`, excluida de Git. No es parte de la aplicación.

Los comandos de instalación reproducible, arranque, demo y comprobaciones están en [development.md](development.md).

## Límites actuales

Demo local con datos ficticios. La API de candidaturas usa `AllowAny` y no requiere autenticación; Django Admin conserva su propio inicio de sesión. Antes de publicar hay que restringir la escritura, definir autenticación y autorización y preparar configuración de producción. `DEBUG = True` es solo para desarrollo. Historial, despliegue y rediseño del portfolio quedan fuera del MVP local.

Los commits los realiza el usuario desde PowerShell. No se creó ningún commit en este paso.
