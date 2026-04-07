# Testing del Backend

Esta carpeta contiene la suite `pytest` del backend Flask.

## Cómo ejecutar

Desde `backend/`:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

### Por tipo de prueba

Las funciones siguen prefijos fijos; `pytest -k` filtra por nombre:

| Tipo | Comando |
|------|---------|
| Toda la suite | `python -m pytest -q` |
| Solo smoke (`test_smoke_*`) | `python -m pytest -q -k "test_smoke_"` |
| Solo unitarias (`test_unit_*`) | `python -m pytest -q -k "test_unit_"` |
| Solo feature (`test_feature_*`) | `python -m pytest -q -k "test_feature_"` |
| Solo integración (`test_integration_*`) | `python -m pytest -q -k "test_integration_"` |

Ejemplo combinando smoke e integración:

```powershell
python -m pytest -q -k "test_smoke_ or test_integration_"
```

Los prefijos `test_smoke_`, `test_unit_`, `test_feature_` y `test_integration_` cubren todos los tests de la carpeta.

## Estructura

- `conftest.py`: configuración compartida y helpers.
- `test_users.py`: pruebas de auth/admin/usuarios.
- `test_events.py`: pruebas de eventos y flujos de estado.
- `test_attendees.py`: pruebas de asistentes e inscripciones.

## Fixtures y configuración

- `TestingConfig` usa SQLite en memoria (`sqlite:///:memory:`).
- Los secretos de test se generan en runtime:
  - `TEST_JWT_SECRET_KEY` del entorno (si existe), o
  - valor aleatorio con `secrets.token_hex(32)`.
- Los tests no dependen de `backend/.env`.

## Cobertura funcional (alto nivel)

- Smoke: disponibilidad y respuestas básicas.
- Unit: validaciones, permisos y errores esperados.
- Integración: flujos entre módulos (auth, events, attendees, admin).

## Convenciones

- Nombres: `test_*.py` y funciones `test_*`.
- Respuestas JSON:
  - Validar presencia de campos y valores clave.
  - Evitar depender del orden exacto de keys serializadas.
- IDs/emails de prueba:
  - Preferir valores únicos por test para evitar acoplamientos.

## Troubleshooting

- Si falla import de dependencias: instalar/activar `.venv` y ejecutar `pip install -r requirements.txt`.
- Si un test falla por permisos:
  - revisa si el endpoint requiere JWT o rol `ADMIN`.
- Si falla por tokens:
  - volver a autenticar dentro del flujo del test.

