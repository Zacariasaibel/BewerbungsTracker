# API REST de candidaturas

Base local: `http://127.0.0.1:8000/api/`. Enviar `Content-Type: application/json` y, para pedir JSON, `Accept: application/json`. Las rutas llevan barra final.

## Rutas

| Método | Ruta | Resultado correcto |
| --- | --- | --- |
| GET | `/api/applications/` | 200, array de candidaturas; `[]` si no hay ninguna. |
| POST | `/api/applications/` | 201, candidatura creada. |
| GET | `/api/applications/<id>/` | 200, candidatura solicitada. |
| PUT | `/api/applications/<id>/` | 200, candidatura actualizada; requiere empresa y puesto. |
| PATCH | `/api/applications/<id>/` | 200, actualización de los campos enviados. |
| DELETE | `/api/applications/<id>/` | 204, sin cuerpo de respuesta. |

La lista se ordena por `applied_on` descendente y, para fechas iguales, por `id` descendente. No hay paginación, búsqueda ni filtros en este hito. Django Admin sigue disponible en `/admin/` con su propio inicio de sesión.

## Crear una candidatura

POST `/api/applications/`:

```json
{
  "company": "Beispiel GmbH",
  "position": "Praktikum FIAE",
  "location": "Berlin",
  "status": "applied",
  "applied_on": "2026-10-29",
  "job_url": "https://example.com/jobs/1",
  "notes": "Fiktive Bewerbung",
  "next_action_on": "2026-11-05"
}
```

Ejemplo de respuesta 201 (identificador y hora ilustrativos):

```json
{
  "id": 1,
  "company": "Beispiel GmbH",
  "position": "Praktikum FIAE",
  "location": "Berlin",
  "status": "applied",
  "applied_on": "2026-10-29",
  "job_url": "https://example.com/jobs/1",
  "notes": "Fiktive Bewerbung",
  "next_action_on": "2026-11-05",
  "created_at": "2026-10-29T12:00:00+01:00"
}
```

GET de lista devuelve un array de objetos con esta misma estructura, sin envoltorio `results`.

## Campos y validación

| Campo | Reglas de entrada |
| --- | --- |
| id | Solo lectura, generado por la base de datos. |
| company | Obligatorio, máximo 200 caracteres; no admite vacío, null ni solo espacios. |
| position | Obligatorio, máximo 200 caracteres; no admite vacío, null ni solo espacios. |
| location | Opcional, máximo 200 caracteres; admite `""`, no null. |
| status | Opcional al crear; valor inicial `applied`. Valores: `applied`, `interview`, `rejected`, `accepted`. |
| applied_on | Opcional al crear; por defecto el día local según Europe/Berlin. Fecha válida `YYYY-MM-DD`, no null. |
| job_url | Opcional, URL válida de hasta 2000 caracteres; admite `""`, no null. |
| notes | Opcional, máximo 10000 caracteres; admite `""`, no null. |
| next_action_on | Opcional, fecha `YYYY-MM-DD` o null. Para borrar una fecha existente, enviar null. |
| created_at | Solo lectura, asignado al crear. |

Al crear se pueden enviar únicamente `company` y `position`: los textos opcionales quedan vacíos y el seguimiento queda en null. DRF recorta los espacios iniciales y finales de sus campos de texto. Los estados se envían en inglés; las etiquetas alemanas del modelo son Beworben, Vorstellungsgespräch, Absage y Zusage.

Los campos de solo lectura enviados por el cliente se ignoran; no sobrescriben los valores del servidor. Las validaciones del serializer se ejecutan antes de guardar. No se llama automáticamente a `model.full_clean()` ni se ha cambiado el comportamiento del modelo.

PATCH `/api/applications/1/` para cambiar solo el estado y eliminar el seguimiento:

```json
{
  "status": "accepted",
  "next_action_on": null
}
```

PUT usa la misma estructura que POST y requiere los campos obligatorios. Para controlar todos los valores, enviar todos los campos editables. Los campos opcionales omitidos durante una actualización conservan su valor; para vaciarlos, enviar explícitamente `""` o null según corresponda.

## Errores

Una entrada inválida devuelve **400** con un objeto que relaciona campos y listas de mensajes; no se guarda la creación ni parte de la actualización. Ejemplo con `company` formado solo por espacios:

```json
{
  "company": ["Dieses Feld darf nicht leer sein."]
}
```

El texto concreto depende del idioma activo de Django/DRF; los nombres de campo permanecen en inglés. También se devuelve 400 por longitudes excesivas, estados desconocidos, enlaces mal formados o fechas imposibles.

Un identificador inexistente devuelve **404**, con un objeto que contiene `detail`. Un método no permitido devuelve **405**. Un DELETE correcto devuelve 204 sin JSON.

## Permisos y alcance local

`ApplicationViewSet` configura explícitamente `permission_classes = [AllowAny]` y `authentication_classes = []`. No requiere inicio de sesión: cualquier cliente con acceso al servidor puede leer, crear, editar y borrar candidaturas. Esto no cambia la autenticación de Django Admin.

Esta configuración es exclusivamente para desarrollo local con datos ficticios. **Antes de publicar hay que restringir la escritura**, definir autenticación y autorización y revisar la configuración de despliegue. No publicar este servidor con acceso anónimo de escritura.

El hito inicial de API no añadió dependencias, frontend ni historial. El frontend del bloque posterior usa esta API; la búsqueda y el filtro se realizan en el cliente sin cambiar estas rutas. Véase `docs/development.md`.

## Recorrido de una petición

1. `config/urls.py` dirige `/api/` a `applications/urls.py`; el router elige una acción del ViewSet según la ruta y el método HTTP.
2. `ApplicationViewSet` busca el registro o prepara la operación CRUD. En las escrituras utiliza `ApplicationSerializer` para validar la entrada.
3. El serializer transforma los valores JSON en datos de Python, valida campos y crea o actualiza `Application` mediante el ORM.
4. El ORM lee o escribe en SQLite. El serializer transforma el resultado en datos de respuesta y DRF produce JSON con el código HTTP correspondiente.

## Verificación

Desde la raíz, generar la clave temporal y entrar en backend para que Django descubra todas las pruebas:

```powershell
$env:DJANGO_SECRET_KEY = & .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
Set-Location backend
..\.venv\Scripts\python.exe manage.py test
..\.venv\Scripts\python.exe manage.py check
..\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
..\.venv\Scripts\python.exe manage.py migrate --check
```

Resultado del hito inicial de API: 16 pruebas correctas (5 del modelo y 11 de API), comprobación de Django sin problemas, sin cambios de modelo pendientes de generar y sin migraciones pendientes de aplicar. Las pruebas usan una base temporal y no añaden datos a SQLite de desarrollo. No se creó ningún commit en ese hito.

El MVP local completo ya está implementado y comprobado: el agente ejecutó posteriormente 19 pruebas del backend y el usuario confirmó el build, las doce pruebas Angular y el recorrido en navegador de escritorio y móvil. Véase [test-checklist.md](test-checklist.md) para distinguir resultados y responsables.
