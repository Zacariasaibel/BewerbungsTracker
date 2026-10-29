# Checklist de comprobaciones del MVP local

Estado: **MVP local implementado y comprobado**. Esta checklist distingue las comprobaciones confirmadas por el usuario de las ejecutadas por el agente. No se repitieron las pruebas en el paso de documentación porque no se modificó código.

## Confirmadas por el usuario desde PowerShell y el navegador

| Comprobación | Resultado confirmado | Procedencia |
| --- | --- | --- |
| Instalación con npm | Completada; `frontend/package-lock.json` existe. | Usuario, PowerShell. |
| Build de Angular | Correcto. | Usuario, PowerShell. |
| Pruebas Angular de servicio y componentes | Las 12 pasan. | Usuario, PowerShell. |
| Crear → recargar → buscar y filtrar → editar → eliminar | Funciona; incluye persistencia tras recarga. | Usuario, navegador. |
| Interfaz de escritorio | Revisada. | Usuario, navegador. |
| Interfaz móvil | Revisada. | Usuario, navegador. |

Estas verificaciones se registran a partir de la confirmación del usuario; el agente no las vuelve a presentar como ejecuciones o inspecciones propias. No se han especificado navegadores, dispositivos ni resoluciones exactas.

## Ejecutadas por el agente durante la implementación

| Comprobación | Resultado |
| --- | --- |
| Todas las pruebas Django del backend | 19 pruebas correctas: modelo, API, demo y recorrido CRUD secuencial. |
| `manage.py check` | Sin problemas: `System check identified no issues (0 silenced).` |
| `makemigrations --check --dry-run` | `No changes detected`. |
| `migrate --check` | Sin migraciones pendientes de aplicar. |
| `npm.cmd run test:domain` | 5 pruebas TypeScript correctas: búsqueda y filtro, seguimientos, fechas y contadores. |
| `npm.cmd run test:api` contra Django real | Crear 201 → consultar 200 → editar 200 → filtro combinado TypeScript correcto → eliminar 204 → consultar eliminado 404. |
| `seed_demo` dos veces | Primera: 10 creadas. Segunda: 0 creadas. Sin modificar ni borrar registros existentes. |
| Sintaxis TypeScript y configuración JSON | Sin errores de sintaxis detectados; comprobación complementaria, no sustituto del build Angular. |

Los intentos iniciales de instalación y build del agente encontraron un bloqueo de red. La posterior instalación, build y pruebas confirmados por el usuario resuelven ese punto: no queda una instalación pendiente para considerar comprobado el MVP local.

## Preparación de Git comprobada por el agente en este paso

- `frontend/package-lock.json` existe, se puede leer como JSON y no está ignorado: debe incluirse en el commit.
- `node_modules/`, `.venv/`, SQLite y sus archivos auxiliares y `.env`/`.env.*` están excluidos por `.gitignore`.
- `.env.example` está permitido y debe contener únicamente ejemplos sin secretos reales.
- No se encontraron archivos ya versionados que coincidieran con las reglas de exclusión actuales.
- El lockfile no contiene URLs de paquetes con usuario o contraseña incrustados. `SECRET_KEY` se obtiene de una variable de entorno.
- `git diff --check` completado sin errores de espacios en blanco.
- No se añadieron archivos al staging ni se creó un commit en este paso.

## Alcance y límites

Demo local con datos ficticios. Sin autenticación en la API de candidaturas: `AllowAny` permite también escribir. **Antes de publicar hay que restringir la escritura** y definir autenticación, autorización y configuración de producción. Django Admin mantiene su propio inicio de sesión.

La revisión de escritorio y móvil no se presenta como auditoría exhaustiva de accesibilidad o compatibilidad. Historial, despliegue y rediseño del portfolio quedan para los siguientes bloques. Los comandos para repetir las comprobaciones cuando haya cambios relevantes están en [development.md](development.md).
