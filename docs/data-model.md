# Modelo Application

El modelo forma parte del MVP local implementado y comprobado. La verificación específica de este documento corresponde al hito del modelo; las comprobaciones posteriores de API y frontend, con su atribución al usuario o al agente, están en [test-checklist.md](test-checklist.md).

`backend/applications/models.py` define una candidatura. Se registra en Django Admin con el nombre alemán «Bewerbung» y se representa como «empresa – puesto». Los datos utilizados en las pruebas son ficticios.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| id | BigAutoField | Identificador automático generado por Django. |
| company | CharField | Obligatorio, máximo 200 caracteres. |
| position | CharField | Obligatorio, máximo 200 caracteres. |
| location | CharField | Opcional, máximo 200 caracteres. |
| status | CharField con TextChoices | Máximo 20 caracteres; valor inicial `applied`. |
| applied_on | DateField | Obligatorio; por defecto `timezone.localdate`, evaluado al crear cada instancia según la zona horaria activa (configurada como Europe/Berlin). |
| job_url | URLField | Opcional, máximo 2000 caracteres; valida el formato de URL. |
| notes | TextField | Texto largo opcional, máximo 10000 caracteres mediante validación del modelo. |
| next_action_on | DateField | Opcional; admite NULL en la base de datos. |
| created_at | DateTimeField | Fecha y hora de creación con `auto_now_add=True`; no cambia con posteriores guardados. |

Los textos opcionales usan `blank=True` y se guardan vacíos como `""`, sin NULL. La fecha opcional usa `blank=True, null=True`: no existe una cadena vacía equivalente para una fecha. `USE_TZ=True` permite trabajar con horas conscientes de zona horaria; Django almacena las horas en UTC.

## Estados

| Valor interno | Etiqueta alemana |
| --- | --- |
| applied | Beworben |
| interview | Vorstellungsgespräch |
| rejected | Absage |
| accepted | Zusage |

## Validación y almacenamiento

`application.full_clean()` valida los campos obligatorios, límites, formato de URL y opciones de estado. `save()` no llama automáticamente a `full_clean()`; antes de guardar desde código que necesite esta validación hay que invocarla explícitamente. No se ha sobrescrito `save()`.

Las opciones `choices`, `blank` y el límite de TextField se comprueban mediante la validación de Django; no son restricciones SQL añadidas por este hito. No se implementan todavía reglas adicionales entre fechas, endpoints ni historial.

`backend/applications/migrations/0001_initial.py` describe la creación de la tabla `applications_application`, con su clave primaria y los campos del modelo. `makemigrations` genera esta descripción versionable; `migrate` la aplica a SQLite y registra que ya está ejecutada. La base local `backend/db.sqlite3` sigue excluida de Git.

## Verificación del hito

Se ejecutaron usando el Python de `.venv` y una `DJANGO_SECRET_KEY` temporal:

- Migración `applications.0001_initial`: aplicada con resultado OK.
- Cinco pruebas: guardar y recuperar todos los campos; opcionales vacíos y estado inicial; empresa y puesto vacíos rechazados mediante `full_clean()`; estado desconocido rechazado mediante `full_clean()`; fecha por defecto correcta en Berlín cuando aún es el día anterior en UTC.
- Las pruebas de almacenamiento utilizan una base SQLite temporal de pruebas, sin añadir candidaturas a la base local de desarrollo.
- `manage.py check`: sin problemas.
- `makemigrations --check --dry-run`: sin cambios de modelo pendientes de generar.
- `migrate --check`: sin migraciones pendientes de aplicar.

No se creó ningún commit; el usuario lo hará desde PowerShell.
