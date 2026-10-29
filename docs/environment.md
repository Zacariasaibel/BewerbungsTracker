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

La Product Inventory API está en otro ordenador, no se ha revisado y no se asume ninguna estructura ni configuración suya. El backend de BewerbungsTracker será nuevo.

## Hito de preparación del backend: avance y bloqueo

Esta sección actualiza el estado histórico descrito arriba.

- Se revisaron `.gitignore`, `docs/plan.md` y este documento. Git ya está inicializado. No se creó ningún commit durante este hito.
- Se creó `.venv/` en la raíz con Python 3.13.3; su intérprete funciona y está aislado del Python global.
- `python -m venv .venv` falló en `ensurepip` por permisos al escribir en carpetas temporales. Se repitió usando temporales dentro de `.venv`, con el mismo resultado.
- Se dejó disponible pip 25.0.1 extrayendo en `.venv/Lib/site-packages` el wheel de pip incluido en la instalación local de Python. Se verificó con `.venv/Scripts/python.exe -m pip list`. Usar `python -m pip`: no se generó el ejecutable `pip.exe` mediante ensurepip.
- SQLite incluido en Python: 3.49.1, comprobado mediante `sqlite3.sqlite_version`.
- Django y Django REST Framework **no están instalados**. El intento de descarga desde PyPI falló por un proxy inaccesible (`ProxyError`, WinError 10061). No se modificaron las políticas ni la configuración de red del equipo.

### Compatibilidad verificada en fuentes oficiales

- [Notas de Django 5.2](https://docs.djangoproject.com/en/5.2/releases/5.2/): Django 5.2 LTS admite Python 3.13.
- [Versiones mantenidas de Django](https://www.djangoproject.com/download/): la serie 5.2 LTS recibe soporte extendido hasta abril de 2028. Se elige esta serie por su soporte prolongado.
- [Requisitos de Django REST Framework](https://www.django-rest-framework.org/): incluye Django 5.2 y Python 3.13 entre las versiones compatibles.
- Ambos proyectos recomiendan y solo dan soporte oficial al último parche de cada serie de Python. Python 3.13.3 pertenece a una serie compatible, pero no es el último parche; no se ha actualizado. La comprobación práctica de esta combinación queda pendiente hasta instalar las dependencias.

### Pendiente por el bloqueo de descarga

No se creó `backend/`, ni el proyecto `config`, ni la app `applications`. Tampoco se creó `backend/requirements.txt`: aún no hay versiones instaladas que fijar. No se ejecutaron migraciones ni `manage.py check`, ya que requieren Django.

Cuando haya acceso a PyPI, desde la raíz en PowerShell, sin necesidad de activar el entorno:

```powershell
.\.venv\Scripts\python.exe -m pip install "Django>=5.2,<5.3" djangorestframework
```

Después se podrá generar el proyecto, registrar las apps, guardar las versiones exactas de todas las dependencias, aplicar las migraciones y ejecutar las comprobaciones. El modelo de candidatura y los endpoints quedan fuera de este hito.
## Hito de preparaci?n del backend: completado

La instalaci?n desde la terminal PowerShell del usuario funcion?. El bloqueo del proxy afectaba a los intentos anteriores del agente; las dependencias ya est?n instaladas y se han utilizado sin reinstalarlas.

### Versiones verificadas en .venv

- Python: 3.13.3.
- Django: 5.2.18.
- Django REST Framework: 3.18.3.
- asgiref: 3.13.0.
- sqlparse: 0.6.0.
- tzdata: 2026.6.
- SQLite incluido en Python: 3.49.1.

`backend/requirements.txt` se gener? con `pip freeze` usando el Python de `.venv` e incluye las versiones exactas de las dependencias directas y transitivas.

### Compatibilidad consultada

- [Django 5.2 LTS](https://docs.djangoproject.com/en/5.2/releases/5.2/) admite Python 3.13.
- [Django REST Framework](https://www.django-rest-framework.org/) admite Django 5.2 y Python 3.13.
- Ambos proyectos recomiendan el ?ltimo parche de cada serie de Python. Se conserva Python 3.13.3 y se han verificado los imports, las migraciones y la configuraci?n localmente.

### Estructura y configuraci?n

- `.venv/`: entorno virtual aislado, excluido de Git.
- `backend/manage.py`: ejecuta comandos de administraci?n del proyecto.
- `backend/config/`: configuraci?n general del proyecto Django.
- `backend/config/settings.py`: apps registradas, base de datos, idioma, zona horaria y dem?s ajustes.
- `backend/config/urls.py`: rutas principales; conserva ?nicamente la ruta administrativa generada por Django. No se a?adieron endpoints de candidaturas.
- `backend/applications/`: app preparada para la futura l?gica de candidaturas. No se cre? ning?n modelo de candidatura ni endpoints.
- `backend/applications/migrations/`: guardar? los cambios del esquema de esa app; por ahora contiene ?nicamente `__init__.py`.
- `backend/db.sqlite3`: base local creada por las migraciones, excluida de Git.

Se registraron `rest_framework` y `applications.apps.ApplicationsConfig` en `INSTALLED_APPS`. Se usa SQLite, `TIME_ZONE = "Europe/Berlin"`, `USE_TZ = True` y `LANGUAGE_CODE = "de"`.

### Clave y desarrollo local en PowerShell

La clave generada por `startproject` se retir? del archivo antes de finalizar. `SECRET_KEY` se obtiene obligatoriamente de la variable de entorno `DJANGO_SECRET_KEY`, sin valor secreto ni clave de reserva en el c?digo.

Desde la ra?z, ejecutar en cada nueva sesi?n de PowerShell antes de los comandos de Django:

```powershell
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
.\.venv\Scripts\python.exe backend/manage.py check
.\.venv\Scripts\python.exe backend/manage.py runserver
```

La asignaci?n guarda una clave aleatoria solo en el entorno de esa sesi?n; no se imprime ni se escribe en archivos. Cambiarla entre sesiones invalida las sesiones firmadas anteriores. Si falta la variable, Django falla al cargar la configuraci?n, de forma intencionada.

No se necesita activar `.venv` ni cambiar la pol?tica de ejecuci?n de PowerShell. No se cargan archivos `.env` autom?ticamente. `DEBUG = True` y la configuraci?n actual son exclusivamente para desarrollo local, no para desplegar en producci?n.

### Comprobaciones ejecutadas

Con el Python de `.venv` y una clave temporal en el entorno:

```text
python backend/manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  18 migraciones aplicadas; todas con resultado OK.

python backend/manage.py check
System check identified no issues (0 silenced).

python -m pip check
No broken requirements found.
```

Git ya est? inicializado. No se a?adi? nada al staging ni se cre? ning?n commit: el usuario lo har? desde PowerShell. El modelo de candidatura y los endpoints quedan para el pr?ximo hito.
