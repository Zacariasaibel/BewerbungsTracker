# Desarrollo local del MVP

El frontend usa Angular CLI 21, componentes standalone, TypeScript estricto, routing y CSS, sin SSR ni librerías de interfaz. Consume exclusivamente la API real de Django mediante `ApplicationService` y `HttpClient`. No hay datos ficticios incrustados en la aplicación cliente: la demo se guarda en SQLite con un comando de Django.

## Estado actual e instalación del frontend

El MVP local está implementado y comprobado. El usuario confirmó desde PowerShell que la instalación, el build y las doce pruebas Angular funcionan. También confirmó el flujo de navegador y la revisión en escritorio y móvil. La atribución de cada comprobación está en [test-checklist.md](test-checklist.md).

Para instalar las dependencias en una copia nueva con `package-lock.json`:

```powershell
Set-Location C:\Users\UserS2025\Desktop\BewerbungsTracker\frontend
npm.cmd ci
```

La instalación con `npm.cmd install` ya fue completada por el usuario y generó `frontend/package-lock.json`, que debe conservarse en Git. No ejecutar `ng new` sobre `frontend/`: la implementación ya está creada. El agente encontró inicialmente errores de caché y proxy al instalar; quedan como antecedente resuelto por la instalación del usuario, no como trabajo pendiente. No se cambiaron las herramientas globales.

Node.js 24.11.1 es compatible con Angular 21 según la [tabla oficial de versiones](https://angular.dev/reference/versions). Se usa TypeScript 5.9. El [proxy oficial de desarrollo](https://angular.dev/tools/cli/serve) permite enviar `/api/**` a Django sin añadir CORS ni otra dependencia.

## Terminal 1: backend y demo

Desde la raíz del proyecto:

```powershell
Set-Location C:\Users\UserS2025\Desktop\BewerbungsTracker
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
.\.venv\Scripts\python.exe backend/manage.py migrate
.\.venv\Scripts\python.exe backend/manage.py seed_demo
.\.venv\Scripts\python.exe backend/manage.py runserver 127.0.0.1:8000
```

La clave queda en la sesión de PowerShell, sin guardarse en archivos. No hace falta activar el entorno virtual. Las dependencias del backend ya están instaladas; para reproducir el entorno en otra instalación se usa `.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt` después de crear `.venv`.

`seed_demo` crea diez candidaturas con empresas ficticias que incluyen «Demo» en el nombre, estados distintos, seguimientos vencidos, de hoy, futuros y sin fecha. Reconoce las existentes por empresa y puesto: no las modifica ni borra otros registros. Repetirlo crea cero registros si esos pares siguen existiendo; tampoco desplaza las fechas de registros ya creados. Si se borra una candidatura de demo o se cambia su empresa o puesto, otra ejecución puede crear de nuevo ese ejemplo.

## Terminal 2: frontend

Con las dependencias instaladas:

```powershell
Set-Location C:\Users\UserS2025\Desktop\BewerbungsTracker\frontend
npm.cmd start
```

Abrir `http://127.0.0.1:4200`. Django debe seguir funcionando en la otra terminal. `npm.cmd start` utiliza el proxy de `proxy.conf.json` hacia `http://127.0.0.1:8000`. El frontend se sirve únicamente en loopback. El build de producción no incluye un servidor ni proxy: el despliegue queda fuera de este bloque.

## Reglas de las vistas

- **Übersicht:** total = todas las candidaturas; abiertas = `applied` + `interview`; entrevistas = solo `interview`; seguimientos pendientes = abiertas con fecha de seguimiento menor o igual a hoy en Berlín.
- **Próximos pasos:** hasta cinco seguimientos de candidaturas abiertas, incluidos vencidos, ordenados por fecha ascendente y por identificador descendente en caso de empate.
- **Bewerbungen:** búsqueda por empresa sin distinguir mayúsculas y filtro por estado combinables, aplicados en el cliente sobre los datos de la API. Se conserva el orden de la API: fecha de envío descendente, después id descendente.
- **Nachfassen:** solo seguimientos vencidos o de hoy, excluyendo `accepted` y `rejected`, ordenados por fecha ascendente. La fecha de hoy se actualiza también mientras la vista está abierta.
- **Crear/editar:** todos los campos editables, validación local y errores de la API. La fecha de seguimiento vacía se envía como null. Se conserva el formulario tras errores y se bloquean envíos duplicados.
- **Eliminar:** confirmación nativa del navegador con la empresa; si falla, se puede reintentar. Se conserva Django Admin.

Las fechas de calendario se mantienen como cadenas `YYYY-MM-DD` en formularios y peticiones; para mostrarlas se reordenan sus partes, sin convertirlas a instantes UTC. Solo el cálculo de «hoy» usa una zona horaria: Europe/Berlin.

## Verificaciones ejecutadas por el agente en el bloque de implementación

- Backend: 19 pruebas correctas, incluyendo modelo, API, demo repetible y recorrido CRUD secuencial. `manage.py check` sin problemas. Sin migraciones nuevas ni pendientes.
- Frontend, lógica real TypeScript: cinco pruebas correctas de filtros combinados, seguimientos, contadores y fechas cerca de medianoche y cambios de horario. Se ejecutan con Node 24 sin dependencias Angular usando `npm.cmd run test:domain`.
- HTTP real contra Django local: crear 201 → consultar 200 → editar 200 → filtrar con la función TypeScript usada en la interfaz → eliminar 204 → consultar eliminado 404. Comando reproducible: `npm.cmd run test:api`, con Django arrancado. Crea un registro ficticio y lo elimina al terminar.
- Demo local: primera ejecución creó diez registros; segunda creó cero, sin borrar los existentes.
- Revisión de sintaxis TypeScript con el parser incluido en el Angular CLI global y revisión de configuración frente a la referencia CLI 21. No equivale a compilar plantillas Angular ni a comprobar todos los tipos.
- Se revisaron comentarios y docstrings existentes en Python/TypeScript: no se encontraron textos en español que requirieran traducción. Los comentarios y docstrings añadidos están en inglés; etiquetas y mensajes visibles están en alemán.

## Verificaciones confirmadas por el usuario

El usuario confirmó `npm install` completado, build Angular correcto y las doce pruebas Angular superadas desde PowerShell. El bloqueo inicial del entorno del agente ya no impide considerar comprobado el MVP local.

Las doce pruebas Angular con Vitest y HttpTestingController cubren servicio, formulario, detalle y listado: recorrido CRUD y filtros, errores/reintento, conservación de datos, validación, prevención de duplicados, 404, confirmación de borrado y cancelación de una respuesta de lista obsoleta tras guardar. Sus respuestas simuladas se usan solo en pruebas.

El usuario comprobó en navegador crear → recargar → buscar y filtrar → editar → eliminar y revisó la interfaz en escritorio y móvil. Estas comprobaciones se atribuyen al usuario; el agente no hizo una inspección visual propia ni dispone de medidas de pantalla confirmadas.

Para repetir las comprobaciones cuando haya cambios relevantes:

```powershell
Set-Location C:\Users\UserS2025\Desktop\BewerbungsTracker\frontend
npm.cmd run build
npm.cmd test
npm.cmd run test:domain
# Keep Django running in the other terminal for this check.
npm.cmd run test:api
```

Para repetir todas las comprobaciones del backend, en una terminal aparte:

```powershell
Set-Location C:\Users\UserS2025\Desktop\BewerbungsTracker
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
Set-Location backend
..\.venv\Scripts\python.exe manage.py test
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
..\.venv\Scripts\python.exe manage.py migrate --check
```

Como revisión adicional recomendada para cambios futuros: teclado y foco visible, formulario inválido, error de red y reintento, URL inexistente y lista sin resultados. La confirmación general del usuario sobre escritorio y móvil no equivale a una auditoría exhaustiva de accesibilidad ni de todos los navegadores. No son bloqueos de instalación ni del build.

## Límites

API anónima (`AllowAny`, sin autenticación), solo para desarrollo local con datos ficticios. Antes de publicar hay que restringir la escritura y preparar la configuración de producción. Este bloque no incluye historial, despliegue ni rediseño del portfolio. El usuario realiza los commits desde PowerShell.
