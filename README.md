# Calculon App

## Educational tower defense game for ages 6–12. Solve math equations to defend against enemies.

## Repositories

Calculon is split across two repositories:

| Repository                   | Role                                                                                                                   | Link                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **calculon-app** (this repo) | Web app — Express backend, React frontend shell, PostgreSQL database, and all deployment infra (Docker, Nginx, CI/CD) | <https://github.com/christphralden/calculon-app> |
| **Calculon**                 | Unity WebGL game — built and maintained independently, consumed here only as a prebuilt artifact                     | <https://github.com/KRook0110/Calculon>          |

`calculon-app` does not contain the game's source. It only ever embeds a built WebGL export of it — manually, at `web-app/public/Calculon/`, for local development (see [Add the Unity game build](#add-the-unity-game-build)), or automatically via a published release, during deployment (see [Deploying to Production](#deploying-to-production)).

## Release Notes

The Unity WebGL build is published as a **GitHub Release on `calculon-app`** (not on the `Calculon` repo) — the deploy pipeline (`UNITY_RELEASE_TAG` / `download-unity` action) pulls release assets from `calculon-app` by tag. So after a new Unity build is ready (from the `Calculon` repo), publish it here:

```bash
git tag -d <tag>
git push origin --delete <tag>
gh release create <tag> <src> --title "<title>" --notes "<notes>"
```

`<src>` is the `calculon.tar.gz` produced by the Unity build. `<tag>` should match the `UNITY_RELEASE_TAG` GitHub variable used by the deploy workflow (default `latest`).

---

## Prerequisites

- **Node.js 20+** and npm
- **Docker** + Docker Compose v2 (for Option A below, and for all database usage)
- **Git**
- PostgreSQL 16 locally — only needed for Option B (no Docker)
- For deployment: an AWS account, a registered domain, a GitHub repo with Actions enabled, and the [`gh` CLI](https://cli.github.com/) (to publish Unity releases)

---

## Clone

```bash
git clone https://github.com/christphralden/calculon-app.git
cd calculon-app
```

---

## Quick Start

### Option A: Docker for DB, local server + web app (recommended)

Run Postgres in Docker, run the server and web app locally for hot reload.

```bash
# 1. Environment
cp .env.local.example .env.local
# Fill in: POSTGRES_USER, POSTGRES_PASSWORD, APP_USER, APP_USER_PASSWORD,
#          APP_RO_USER, APP_RO_PASSWORD, PARTMAN_PASSWORD, SESSION_SECRET,
#          GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 2. Install dependencies
npm install

# 3. Start Postgres + cron
docker compose --env-file=.env.local -f docker-compose.dev.yml up -d magic-nugger-postgres magic-nugger-cron

# 4. Run migrations
npm run db:migrate

# 5. Start web server (terminal 1)
cd web-server && npm run dev

# 6. Start web app (terminal 2)
cd web-app && npm run dev
```

- web-app on `http://localhost:5173`
- web-server on `http://localhost:3000`
- db on `localhost:5432`

To stop:

```bash
docker compose --env-file=.env.local -f docker-compose.dev.yml down
```

---

### Option B: No Docker (everything local)

Requires a local PostgreSQL 16 instance.

```bash
# 1. Environment
cp .env.local.example .env.local
# Set POSTGRES_HOST=localhost and fill in the same credentials as Option A

# 2. Install & migrate
npm install
npm run db:migrate

# 3. Start services
cd web-server && npm run dev
cd web-app && npm run dev
```

---

### Add the Unity game build

The game screen will not load without this step — it is not fetched automatically in local development.

1. Build the WebGL export from the separate [Calculon](https://github.com/KRook0110/Calculon) repo.
2. Place the build output at `web-app/public/Calculon/`, so that the following exist directly inside it:

```
web-app/public/Calculon/
├── index.html
├── Build/
├── TemplateData/
└── StreamingAssets/
```

This exact path and folder name (`public/Calculon/`) is gitignored and is what the frontend's Unity bridge expects.

In production this placement is done automatically by the deploy pipeline — see [Deploying to Production](#deploying-to-production).

---

## Environment Variables

Copy `.env.local.example` to `.env.local` for local dev. `.env.production.example` shows the production shape (the real `.env.production` on the server is written by CI from GitHub Secrets/Variables — never committed).

| Variable                          | Local (`.env.local`)                                     | Production                                                     | Notes                                                              |
| ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `POSTGRES_USER`                   | superuser name                                              | same                                                             | Used by the migration runner and DB init scripts                  |
| `POSTGRES_PASSWORD`               | superuser password                                          | same                                                             |                                                                     |
| `POSTGRES_DB`                     | `magic_nugger`                                              | same                                                             |                                                                     |
| `POSTGRES_HOST`                   | `localhost`                                                 | `magic-nugger-postgres`                                         | Docker network alias in production, not `localhost`               |
| `APP_USER` / `APP_USER_PASSWORD`  | app DB role (SELECT/INSERT/UPDATE/DELETE)                   | same                                                             | Created by `db/init/001_users.sh` on first Postgres boot           |
| `APP_RO_USER` / `APP_RO_PASSWORD` | read-only DB role (SELECT only)                             | same                                                             | Created by `db/init/001_users.sh`                                  |
| `PARTMAN_PASSWORD`                | password for `partman_user`                                 | same                                                             | Created by `db/init/002_extensions.sh`; runs `pg_partman_bgw`      |
| `DATABASE_URL`                    | set manually, e.g. `postgresql://<APP_USER>:<APP_USER_PASSWORD>@localhost:5432/magic_nugger` | not set — constructed by docker-compose at runtime from `APP_USER`/`APP_USER_PASSWORD`/`POSTGRES_DB` | |
| `SESSION_SECRET`                  | `openssl rand -base64 32`                                   | same generation method                                           | Express session signing secret                                    |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials                     | same                                                             |                                                                     |
| `GOOGLE_CALLBACK_URL`             | `http://localhost:3000/api/v1/auth/oauth/google/callback`   | `https://yourdomain.com/api/v1/auth/oauth/google/callback`       |                                                                     |
| `FRONTEND_URL`                    | `http://localhost:5173`                                     | only needed if frontend/API are on different origins             |                                                                     |
| `CORS_ORIGIN`                     | `http://localhost:5173`                                     | `https://yourdomain.com` (optional — not needed behind one nginx) |                                                                     |
| `PORT`                            | `3000`                                                       | `3000`                                                           |                                                                     |
| `NODE_ENV`                        | `development`                                                | `production`                                                     |                                                                     |
| `RPM_LIMIT`                       | `3000`                                                       | `3000`                                                           | Express-level rate limit (secondary to nginx's)                   |
| `GAME_SESSION_STALE_THRESHOLD_MS` | `1800000`                                                    | same                                                             | Used by the hourly cron session-cleanup job                       |
| `INTERNAL_SECRET`                 | diagnostics secret                                           | same                                                             |                                                                     |
| `DB_POOL_MAX`                     | `20`                                                         | `20`                                                             |                                                                     |
| `DB_POOL_IDLE_TIMEOUT_MS`         | `30000`                                                      | `30000`                                                          |                                                                     |
| `DB_POOL_CONNECTION_TIMEOUT_MS`   | `5000`                                                       | `5000`                                                           |                                                                     |
| `DB_QUERY_TIMEOUT_MS`             | `30000`                                                      | `30000`                                                          |                                                                     |
| `DB_SSL_MODE`                     | `prefer`                                                     | `prefer`                                                         |                                                                     |

---

## Project Structure

```

calculon-app/
├── db/
├── docs/
├── nginx/
├── shared/
├── web-app/
├── web-server/
└── .github/workflows/

```

---

## Database Utilities

```bash
# Apply all pending migrations
npm run db:migrate

# Rollback the most recent migration
npm run db:rollback

# Manual backup → db/backups/backup_YYYYMMDD_HHMMSS.sql (requires dev postgres running)
npm run db:backup

# Restore from a dump file
npm run db:restore -- db/backups/backup_20260507_020000.sql
```

Automated weekly backups run via the `magic-nugger-cron` container (Sundays at 02:00) in **both** dev and production. See [`docs/007-cron-jobs.md`](docs/007-cron-jobs.md) for cron job details.

### Creating a migration

Migrations live under `db/migrations/apply/` and `db/migrations/rollback/`, paired by a shared timestamp prefix (`yyyymmddHHmm_description.sql`). Apply files register themselves via `_v.try_register_patch(name, deps[], description)`; rollback files call `_v.unregister_patch(name)` then undo the DDL inside `BEGIN; ... COMMIT;`. Never edit an already-applied patch — always add a new one. See [`docs/005-infra.md`](docs/005-infra.md) for the full migration system reference.

---

## Running Tests

```bash
# Backend tests
npm run test --workspace=web-server

# Frontend tests
npm run test --workspace=web-app

# All tests
npm test
```

---

## Deploying to Production

### Architecture

```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │  SSL termination, static files, rate limiting
│  (host)     │
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
┌──────┐ ┌────────────┐
│ /api │ │ / (static) │
└──┼───┘ └────────────┘
   │
   ▼
┌─────────────────┐
│ server container│  Express 5 + Passport
│   (Node 20)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ postgres cont.  │◄────│  cron container │  session/room cleanup + weekly backup
│ PostgreSQL 16   │     │  (node:alpine)  │
└─────────────────┘     └─────────────────┘
```

Single EC2 instance. Nginx runs on the host (not in Docker) and handles TLS termination, static file serving, and reverse proxy. The web server, Postgres, and cron all run as Docker containers. All secrets and deploys are managed by CI/CD — no manual server configuration after initial setup.

### Prerequisites

- AWS account
- A registered domain pointing at the EC2 instance's public IP
- A GitHub repository with a `master` branch and Actions enabled

### 1. Provision EC2

Launch an Ubuntu 22.04 LTS `t3.micro` (or larger) with a 20GB EBS volume for Postgres data, and these security group rules:

| Port | Source    | Purpose |
| ---- | --------- | ------- |
| 22   | Your IP   | SSH     |
| 80   | 0.0.0.0/0 | HTTP    |
| 443  | 0.0.0.0/0 | HTTPS   |

### 2. Publish the Unity game build

Deployment expects a GitHub Release on **`calculon-app`** containing a `calculon.tar.gz` asset, at the tag named by the `UNITY_RELEASE_TAG` variable (default `latest`). Build the game in the [Calculon](https://github.com/KRook0110/Calculon) repo, then publish it on `calculon-app` with the commands in [Release Notes](#release-notes) above. The deploy pipeline downloads this release, extracts it, and places it on the server automatically — unlike local dev, you do not need to manually copy anything to the EC2 instance.

### 3. GitHub Secrets and Variables

Go to **GitHub → Settings → Secrets and variables → Actions**.

#### Secrets

| Secret                     | Description                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EC2_HOST`                 | Public IP of your EC2                                                                                                                               |
| `EC2_USERNAME`             | SSH username (`ubuntu` for Ubuntu AMIs)                                                                                                             |
| `EC2_SSH_KEY`              | Private SSH key for the EC2 user                                                                                                                    |
| `POSTGRES_USER`            | Database superuser name                                                                                                                             |
| `POSTGRES_PASSWORD`        | Database superuser password                                                                                                                         |
| `POSTGRES_DB`              | Database name                                                                                                                                       |
| `APP_USER`                 | Database app user (SELECT/INSERT/UPDATE/DELETE)                                                                                                     |
| `APP_USER_PASSWORD`        | Database app user password                                                                                                                          |
| `APP_RO_USER`              | Database read-only user (SELECT only)                                                                                                               |
| `APP_RO_PASSWORD`          | Database read-only user password                                                                                                                    |
| `PARTMAN_PASSWORD`         | Password for `partman_user` — pg_partman maintenance role                                                                                           |
| `SESSION_SECRET`           | Session secret — `openssl rand -base64 32`                                                                                                          |
| `GOOGLE_CLIENT_ID`         | Google OAuth client ID                                                                                                                              |
| `GOOGLE_CLIENT_SECRET`     | Google OAuth client secret                                                                                                                          |
| `CORS_ORIGIN`              | Allowed frontend origin — only required if frontend and API are on different domains                                                               |
| `INTERNAL_SECRET`          | Internal diagnostics secret                                                                                                                         |
| `ENABLE_REMOTE_DEPLOYMENT` | Set to `true` to enable deploys — kill switch; omit or leave unset to disable                                                                       |

#### Variables

| Variable                        | Example value                  |
| -------------------------------- | ------------------------------ |
| `API_URL`                        | `api/v1`                       |
| `WEB_SERVER_URL`                 | `https://youractualdomain.com` |
| `CERTBOT_EMAIL`                  | `foo@email.com`                |
| `DOMAIN`                         | `youractualdomain.com`         |
| `UNITY_RELEASE_TAG`              | `latest`                       |
| `POSTGRES_HOST`                  | `magic-nugger-postgres`        |
| `PORT`                           | `3000`                         |
| `RPM_LIMIT`                      | `3000`                         |
| `DB_POOL_MAX`                    | `20`                           |
| `DB_POOL_IDLE_TIMEOUT_MS`        | `30000`                        |
| `DB_POOL_CONNECTION_TIMEOUT_MS`  | `5000`                         |
| `DB_QUERY_TIMEOUT_MS`            | `30000`                        |
| `DB_SSL_MODE`                    | `prefer`                       |
| `GAME_SESSION_RESUME_WINDOW_MS`  | `1800000`                      |

Also create a `production` environment under **GitHub → Settings → Environments** to gate the deploy workflow with required reviewers.

### 4. SSL (Certbot)

The `configure-server` composite action re-runs Certbot automatically whenever the `DOMAIN` variable changes. Manual alternative:

```bash
sudo certbot --nginx -d youractualdomain.com
sudo certbot renew --dry-run   # verify auto-renewal
```

### 5. Deploy

Push to `master` (or run the `Deploy` workflow manually). The pipeline runs these steps in order:

1. **Validate secrets** — fails fast if `SESSION_SECRET` or `POSTGRES_PASSWORD` are empty
2. **Configure SSH** — sets up the runner to reach GitHub over `ssh.github.com:443`
3. **Bootstrap** — one-time EC2 setup (idempotent): installs Docker, nginx, Certbot, Node 20; skipped on later runs
4. **Pull code** — clones to `/magic-nugger` on first run, otherwise `git fetch && git reset --hard origin/master`
5. **Write env** — writes `/magic-nugger/.env` from GitHub Secrets/Variables, `chmod 600`
6. **Configure server** — nginx + Certbot config, re-applied if `DOMAIN` changed
7. **Download Unity build** — downloads the `calculon.tar.gz` release from this repo, extracts it, computes a checksum, and SCPs the extracted game directory straight to `/var/www/magic-nugger/web-app/`
8. **Deploy frontend** — `npm ci && npm run build` on the server, patches `dist/config.js` placeholders (`__WEB_SERVER_URL__`, `__API_URL__`, `__UNITY_CHECKSUM__`) via `sed`, then `rsync`s `dist/` into the nginx static root (excluding the Unity directory so it isn't wiped), and reloads nginx
9. **Deploy server** — `docker compose build` + `up -d` for both `magic-nugger-web-server` and `magic-nugger-cron`; database migrations run automatically on server boot
10. **Health check** — polls `http://127.0.0.1:3000/health` up to 30 times (~60s); fails the pipeline and dumps logs if the server never comes up
11. **Cleanup** — `docker image prune -f`

### 6. Database Migrations

Migrations run automatically when the server container starts. To run manually:

```bash
ssh ubuntu@<EC2_IP>
cd /magic-nugger && npm run db:migrate
```

If a migration fails, the container exits — fix the patch and restart:

```bash
docker compose restart magic-nugger-web-server
```

### 7. Rollback

**Application code:**

```bash
ssh ubuntu@<EC2_IP>
cd /magic-nugger
git log --oneline -5
git reset --hard <commit-hash>

cd web-app && npm ci && npm run build
sudo rsync -a --delete /magic-nugger/web-app/dist/ /var/www/magic-nugger/web-app/
sudo nginx -s reload

cd /magic-nugger
docker compose build magic-nugger-web-server
docker compose up -d magic-nugger-web-server
```

**Database:**

```bash
cd /magic-nugger && npm run db:rollback
docker compose restart magic-nugger-web-server
```

Restore from a dump if needed:

```bash
docker exec -i magic-nugger-postgres psql -U postgres magic_nugger < backup.sql
```

### 8. Backup

The `magic-nugger-cron` container runs in **both** dev and production (it is part of `docker-compose.yml` and is started by the deploy pipeline alongside the web server). It runs a weekly `pg_dump` every Sunday at 02:00, writing dumps to `db/backups/` on the host, logged to `audit.log_events` (`event = 'cron:backup'`).

For on-demand snapshots:

```bash
npm run db:backup                                         # → db/backups/backup_YYYYMMDD_HHMMSS.sql
npm run db:restore -- db/backups/backup_20260507_020000.sql
```

If you'd rather ship dumps off the instance, add a host crontab entry instead of (or in addition to) the container job:

```bash
0 3 * * 0 docker exec magic-nugger-postgres pg_dump -U postgres magic_nugger | aws s3 cp - s3://your-bucket/magic-nugger-$(date +\%Y\%m\%d).sql
```

See [`docs/007-cron-jobs.md`](docs/007-cron-jobs.md) for full cron job documentation.

### 9. Monitoring

```bash
docker compose ps
docker compose logs -f magic-nugger-web-server
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Tech Stack

| Layer    | Tech                                                    |
| -------- | ------------------------------------------------------- |
| Frontend | React 18, Vite, Redux Toolkit, Tailwind CSS, shadcn/ui  |
| Backend  | Express 5,                                              |
| Database | PostgreSQL 16                                           |
| Shared   | @magic-nugger-app lib                                   |
| Auth     | Cookie sessions (no JWT), Google OAuth + local password |
| Tests    | Jest (backend + frontend), jsdom                        |
| Deploy   | Docker Compose on EC2, Nginx reverse proxy              |

---

## License

Skripsi — Jonathan, Alden, Shawn
