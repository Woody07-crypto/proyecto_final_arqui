# Backend API

## Secretos (`SECRET_KEY`, `JWT_SECRET_KEY`)

- Si **no** están en el entorno, se generan al importar la config con `secrets.token_hex(32)` (32 bytes de entropía en hex).
- Así puedes arrancar en local **sin** `.env`.
- En **producción** conviene definir ambas en variables de entorno para que no cambien al reiniciar (tokens y cookies coherentes).

Plantilla opcional: `.env.example`.

## Base de datos

`DATABASE_URL` sigue siendo opcional con valor por defecto en `config.py` (ajusta en `.env` si aplica).

## Tests

`pytest` usa `TestingConfig` y sus propias claves; no depende de tu `.env`.
