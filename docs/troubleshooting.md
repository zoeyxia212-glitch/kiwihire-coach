# Troubleshooting

Run these from the repository root. `docker compose ps` is the first thing to
check: it shows which container is unhealthy or restarting.

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 db
docker compose logs --tail=100 frontend
```

## `docker compose up` stops with "Set POSTGRES_PASSWORD" or "Set JWT_SECRET"

`.env` is missing or a value is blank. Copy `.env.example` to `.env`, then set
real values (`openssl rand -base64 48` makes a good `JWT_SECRET`). `.env` is
ignored by Git and must stay that way.

## Backend cannot connect to the database

Symptoms: the backend log shows `Connection refused`, `password authentication
failed` or `Unable to obtain connection`.

- `docker compose ps`: is `db` healthy? If not, read its log.
- The password changed after the first start. PostgreSQL only reads
  `POSTGRES_PASSWORD` when it first creates the volume. Either put the old
  password back, or, if the data is disposable, reset the volume:
  `docker compose down -v` (this deletes the database).
- Running the backend outside Docker: `DB_URL`, `DB_USERNAME` and
  `DB_PASSWORD` must point at a reachable database.

## Backend exits at start with a Flyway or schema error

- `Schema-validation: missing column` means an entity changed without a
  migration. Add a new `V<number>__description.sql` file; never edit a
  migration that has already run.
- `Validate failed: Migration checksum mismatch` means an applied migration
  file was edited. Restore the original file and add a new migration.

## Backend restarts in a loop

`docker compose logs backend` shows why. Common causes: the database is not
ready yet, `JWT_SECRET` is still the placeholder under the `prod` profile (the
backend refuses to start on purpose), or a migration failed.

## Port already in use

`Bind for 0.0.0.0:8080 failed: port is already allocated`. Another program uses
the port. Set `WEB_PORT=8081` in `.env` and open `http://localhost:8081`.
`CORS_ALLOWED_ORIGINS` follows `WEB_PORT` automatically.

## Nginx shows 502 Bad Gateway

Nginx is up but cannot reach the backend. Check `docker compose ps` and the
backend log. The backend may still be starting, or it crashed. Wait for it to
become healthy, then reload.

## Registering or logging in fails with "403" or "could not create your account"

- In the browser, open DevTools, Network, and look at the failing `/api/...`
  request. A 403 on a POST usually means the request was treated as cross
  origin. Nginx must pass `Host $http_host` (it does in `frontend/nginx.conf`),
  and the page address must match `CORS_ALLOWED_ORIGINS`. If you open the app
  at another address, set `CORS_ALLOWED_ORIGINS` to match.
- Passwords must meet the rules shown on the form.

## An API call returns 500

1. `docker compose logs --tail=200 backend` and find the stack trace nearest
   the request time.
2. Note the request path and the user action that caused it.
3. If it started after a deploy, compare with the last working version.
4. With monitoring on, the error rate panel shows when it began.

## Monitoring

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build
```

Set `GRAFANA_ADMIN_PASSWORD` in `.env` first. Grafana opens at
`http://localhost:3000` (localhost only), with a "KiwiHire backend" dashboard:
requests, errors, p95 latency, JVM heap, CPU and database connections. In
Prometheus's own UI, Status, Targets shows whether the backend is being
scraped. Only turn the metrics endpoint on where the backend port is not
reachable from the internet.

## Starting clean

`docker compose down` stops everything and keeps the database.
`docker compose down -v` also deletes the database volume.
