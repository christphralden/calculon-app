# Calculon App

[English](README.md) | **Bahasa Indonesia**

## Game tower defense edukatif untuk usia 6–12 tahun. Selesaikan soal matematika untuk mempertahankan diri dari musuh.

## Repositori

Calculon terbagi ke dalam dua repositori:

| Repositori                   | Peran                                                                                                                   | Tautan                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| **calculon-app** (repo ini) | Web app — backend Express, shell frontend React, database PostgreSQL, dan seluruh infrastruktur deployment (Docker, Nginx, CI/CD) | <https://github.com/christphralden/calculon-app> |
| **Calculon**                 | Game Unity WebGL — dibangun dan dikelola secara independen, hanya dikonsumsi di sini sebagai artefak hasil build        | <https://github.com/KRook0110/Calculon>          |

`calculon-app` tidak berisi source code game. Repo ini hanya pernah menyematkan hasil build WebGL dari game tersebut — secara manual, di `web-app/public/Calculon/`, untuk pengembangan lokal (lihat [Menambahkan build game Unity](#menambahkan-build-game-unity)), atau secara otomatis melalui release yang dipublikasikan, saat deployment (lihat [Deploy ke Production](#deploy-ke-production)).

## Catatan Rilis

Build Unity WebGL dipublikasikan sebagai **GitHub Release di `calculon-app`** (bukan di repo `Calculon`) — pipeline deploy (`UNITY_RELEASE_TAG` / action `download-unity`) menarik aset release dari `calculon-app` berdasarkan tag. Jadi setelah build Unity baru siap (dari repo `Calculon`), publikasikan build tersebut di sini:

```bash
git tag -d <tag>
git push origin --delete <tag>
gh release create <tag> <src> --title "<title>" --notes "<notes>"
```

`<src>` adalah file `calculon.tar.gz` hasil build Unity. `<tag>` harus sesuai dengan variabel GitHub `UNITY_RELEASE_TAG` yang digunakan oleh workflow deploy (default `latest`).

---

## Prasyarat

- **Node.js 20+** dan npm
- **Docker** + Docker Compose v2 (untuk Opsi A di bawah, dan untuk semua penggunaan database)
- **Git**
- PostgreSQL 16 secara lokal — hanya diperlukan untuk Opsi B (tanpa Docker)
- Untuk deployment: akun AWS, domain terdaftar, repo GitHub dengan Actions aktif, dan [`gh` CLI](https://cli.github.com/) (untuk mempublikasikan release Unity)

---

## Clone

```bash
git clone https://github.com/christphralden/calculon-app.git
cd calculon-app
```

---

## Quick Start

### Opsi A: Docker untuk DB, server + web app lokal (disarankan)

Jalankan Postgres di Docker, jalankan server dan web app secara lokal untuk hot reload.

```bash
# 1. Environment
cp .env.local.example .env.local
# Isi: POSTGRES_USER, POSTGRES_PASSWORD, APP_USER, APP_USER_PASSWORD,
#      APP_RO_USER, APP_RO_PASSWORD, PARTMAN_PASSWORD, SESSION_SECRET,
#      GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 2. Install dependencies
npm install

# 3. Jalankan Postgres + cron
docker compose --env-file=.env.local -f docker-compose.dev.yml up -d magic-nugger-postgres magic-nugger-cron

# 4. Jalankan migrasi
npm run db:migrate

# 5. Jalankan web server (terminal 1)
cd web-server && npm run dev

# 6. Jalankan web app (terminal 2)
cd web-app && npm run dev
```

- web-app di `http://localhost:5173`
- web-server di `http://localhost:3000`
- db di `localhost:5432`

Untuk menghentikan:

```bash
docker compose --env-file=.env.local -f docker-compose.dev.yml down
```

---

### Opsi B: Tanpa Docker (semua lokal)

Membutuhkan instance PostgreSQL 16 lokal.

```bash
# 1. Environment
cp .env.local.example .env.local
# Set POSTGRES_HOST=localhost dan isi kredensial yang sama seperti Opsi A

# 2. Install & migrasi
npm install
npm run db:migrate

# 3. Jalankan services
cd web-server && npm run dev
cd web-app && npm run dev
```

---

### Menambahkan build game Unity

Layar game tidak akan termuat tanpa langkah ini — file ini tidak diambil secara otomatis pada pengembangan lokal.

1. Build hasil ekspor WebGL dari repo terpisah [Calculon](https://github.com/KRook0110/Calculon).
2. Letakkan hasil build di `web-app/public/Calculon/`, sehingga berikut ini ada langsung di dalamnya:

```
web-app/public/Calculon/
├── index.html
├── Build/
├── TemplateData/
└── StreamingAssets/
```

Path dan nama folder ini (`public/Calculon/`) di-gitignore dan inilah yang diharapkan oleh Unity bridge pada frontend.

Di production, penempatan ini dilakukan secara otomatis oleh pipeline deploy — lihat [Deploy ke Production](#deploy-ke-production).

---

## Environment Variables

Copy `.env.local.example` ke `.env.local` untuk pengembangan lokal. `.env.production.example` menunjukkan bentuk production (`.env.production` yang sebenarnya di server ditulis oleh CI dari GitHub Secrets/Variables — tidak pernah di-commit).

| Variabel                          | Lokal (`.env.local`)                                     | Production                                                     | Catatan                                                              |
| ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `POSTGRES_USER`                   | nama superuser                                              | sama                                                             | Digunakan oleh migration runner dan skrip init DB                  |
| `POSTGRES_PASSWORD`               | password superuser                                          | sama                                                             |                                                                     |
| `POSTGRES_DB`                     | `magic_nugger`                                              | sama                                                             |                                                                     |
| `POSTGRES_HOST`                   | `localhost`                                                 | `magic-nugger-postgres`                                         | Alias network Docker di production, bukan `localhost`               |
| `APP_USER` / `APP_USER_PASSWORD`  | role DB aplikasi (SELECT/INSERT/UPDATE/DELETE)              | sama                                                             | Dibuat oleh `db/init/001_users.sh` saat Postgres pertama kali boot  |
| `APP_RO_USER` / `APP_RO_PASSWORD` | role DB read-only (hanya SELECT)                            | sama                                                             | Dibuat oleh `db/init/001_users.sh`                                  |
| `PARTMAN_PASSWORD`                | password untuk `partman_user`                               | sama                                                             | Dibuat oleh `db/init/002_extensions.sh`; menjalankan `pg_partman_bgw` |
| `DATABASE_URL`                    | diset manual, misal `postgresql://<APP_USER>:<APP_USER_PASSWORD>@localhost:5432/magic_nugger` | tidak diset — dibentuk oleh docker-compose saat runtime dari `APP_USER`/`APP_USER_PASSWORD`/`POSTGRES_DB` | |
| `SESSION_SECRET`                  | `openssl rand -base64 32`                                   | metode generate yang sama                                        | Secret signing session Express                                    |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Kredensial aplikasi Google OAuth                 | sama                                                             |                                                                     |
| `GOOGLE_CALLBACK_URL`             | `http://localhost:3000/api/v1/auth/oauth/google/callback`   | `https://yourdomain.com/api/v1/auth/oauth/google/callback`       |                                                                     |
| `FRONTEND_URL`                    | `http://localhost:5173`                                     | hanya diperlukan jika frontend/API berada di origin berbeda      |                                                                     |
| `CORS_ORIGIN`                     | `http://localhost:5173`                                     | `https://yourdomain.com` (opsional — tidak diperlukan di belakang satu nginx) |                                                                     |
| `PORT`                            | `3000`                                                       | `3000`                                                           |                                                                     |
| `NODE_ENV`                        | `development`                                                | `production`                                                     |                                                                     |
| `RPM_LIMIT`                       | `3000`                                                       | `3000`                                                           | Rate limit level Express (sekunder dari rate limit nginx)          |
| `GAME_SESSION_STALE_THRESHOLD_MS` | `1800000`                                                    | sama                                                             | Digunakan oleh job cron pembersihan session setiap jam              |
| `INTERNAL_SECRET`                 | secret diagnostik internal                                   | sama                                                             |                                                                     |
| `DB_POOL_MAX`                     | `20`                                                         | `20`                                                             |                                                                     |
| `DB_POOL_IDLE_TIMEOUT_MS`         | `30000`                                                      | `30000`                                                          |                                                                     |
| `DB_POOL_CONNECTION_TIMEOUT_MS`   | `5000`                                                       | `5000`                                                           |                                                                     |
| `DB_QUERY_TIMEOUT_MS`             | `30000`                                                      | `30000`                                                          |                                                                     |
| `DB_SSL_MODE`                     | `prefer`                                                     | `prefer`                                                         |                                                                     |

---

## Struktur Proyek

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

## Utilitas Database

```bash
# Terapkan semua migrasi yang pending
npm run db:migrate

# Rollback migrasi terbaru
npm run db:rollback

# Backup manual → db/backups/backup_YYYYMMDD_HHMMSS.sql (membutuhkan postgres dev yang berjalan)
npm run db:backup

# Restore dari file dump
npm run db:restore -- db/backups/backup_20260507_020000.sql
```

Backup mingguan otomatis berjalan lewat container `magic-nugger-cron` (setiap Minggu pukul 02:00) di **dev maupun production**. Lihat [`docs/007-cron-jobs.md`](docs/007-cron-jobs.md) untuk detail job cron.

### Membuat migrasi

Migrasi berada di `db/migrations/apply/` dan `db/migrations/rollback/`, berpasangan berdasarkan prefix timestamp yang sama (`yyyymmddHHmm_description.sql`). File apply mendaftarkan dirinya sendiri lewat `_v.try_register_patch(name, deps[], description)`; file rollback memanggil `_v.unregister_patch(name)` lalu membatalkan DDL di dalam `BEGIN; ... COMMIT;`. Jangan pernah mengedit patch yang sudah di-apply — selalu tambahkan patch baru. Lihat [`docs/005-infra.md`](docs/005-infra.md) untuk referensi lengkap sistem migrasi.

---

## Menjalankan Test

```bash
# Test backend
npm run test --workspace=web-server

# Test frontend
npm run test --workspace=web-app

# Semua test
npm test
```

---

## Deploy ke Production

### Arsitektur

```
Internet
    │
    ▼
┌─────────────┐
│   Nginx     │  Terminasi SSL, static files, rate limiting
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
│ postgres cont.  │◄────│  cron container │  pembersihan session/room + backup mingguan
│ PostgreSQL 16   │     │  (node:alpine)  │
└─────────────────┘     └─────────────────┘
```

Satu instance EC2. Nginx berjalan di host (bukan di Docker) dan menangani terminasi TLS, static file serving, dan reverse proxy. Web server, Postgres, dan cron semuanya berjalan sebagai container Docker. Semua secret dan deploy dikelola oleh CI/CD — tidak ada konfigurasi server manual setelah setup awal.

### Prasyarat

- Akun AWS
- Domain terdaftar yang mengarah ke IP publik instance EC2
- Repositori GitHub dengan branch `master` dan Actions aktif

### 1. Provisioning EC2

Jalankan Ubuntu 22.04 LTS `t3.micro` (atau lebih besar) dengan volume EBS 20GB untuk data Postgres, dan aturan security group ini:

| Port | Source    | Tujuan |
| ---- | --------- | ------- |
| 22   | IP Anda   | SSH     |
| 80   | 0.0.0.0/0 | HTTP    |
| 443  | 0.0.0.0/0 | HTTPS   |

### 2. Publikasikan build game Unity

Deployment mengharapkan adanya GitHub Release pada **`calculon-app`** yang berisi aset `calculon.tar.gz`, pada tag yang ditentukan oleh variabel `UNITY_RELEASE_TAG` (default `latest`). Build game di repo [Calculon](https://github.com/KRook0110/Calculon), lalu publikasikan di `calculon-app` dengan perintah pada [Catatan Rilis](#catatan-rilis) di atas. Pipeline deploy akan mengunduh release ini, mengekstraknya, dan menempatkannya di server secara otomatis — berbeda dengan pengembangan lokal, Anda tidak perlu menyalin apa pun secara manual ke instance EC2.

### 3. GitHub Secrets dan Variables

Buka **GitHub → Settings → Secrets and variables → Actions**.

#### Secrets

| Secret                     | Deskripsi                                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EC2_HOST`                 | IP publik EC2 Anda                                                                                                                               |
| `EC2_USERNAME`             | Username SSH (`ubuntu` untuk AMI Ubuntu)                                                                                                             |
| `EC2_SSH_KEY`              | Private SSH key untuk user EC2                                                                                                                    |
| `POSTGRES_USER`            | Nama superuser database                                                                                                                             |
| `POSTGRES_PASSWORD`        | Password superuser database                                                                                                                         |
| `POSTGRES_DB`              | Nama database                                                                                                                                       |
| `APP_USER`                 | User DB aplikasi (SELECT/INSERT/UPDATE/DELETE)                                                                                                     |
| `APP_USER_PASSWORD`        | Password user DB aplikasi                                                                                                                          |
| `APP_RO_USER`              | User DB read-only (hanya SELECT)                                                                                                                   |
| `APP_RO_PASSWORD`          | Password user DB read-only                                                                                                                         |
| `PARTMAN_PASSWORD`         | Password untuk `partman_user` — role maintenance pg_partman                                                                                           |
| `SESSION_SECRET`           | Secret session — `openssl rand -base64 32`                                                                                                          |
| `GOOGLE_CLIENT_ID`         | Client ID Google OAuth                                                                                                                              |
| `GOOGLE_CLIENT_SECRET`     | Client secret Google OAuth                                                                                                                          |
| `CORS_ORIGIN`              | Origin frontend yang diizinkan — hanya diperlukan jika frontend dan API berada di domain berbeda                                                   |
| `INTERNAL_SECRET`          | Secret diagnostik internal                                                                                                                         |
| `ENABLE_REMOTE_DEPLOYMENT` | Set ke `true` untuk mengaktifkan deploy — kill switch; biarkan unset untuk menonaktifkan                                                             |

#### Variables

| Variable                        | Contoh nilai                  |
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

Buat juga environment `production` di **GitHub → Settings → Environments** untuk mengatur gate pada workflow deploy dengan required reviewers.

### 4. SSL (Certbot)

Composite action `configure-server` secara otomatis menjalankan ulang Certbot setiap kali variabel `DOMAIN` berubah. Alternatif manual:

```bash
sudo certbot --nginx -d youractualdomain.com
sudo certbot renew --dry-run   # verifikasi auto-renewal
```

### 5. Deploy

Push ke `master` (atau jalankan workflow `Deploy` secara manual). Pipeline menjalankan langkah-langkah ini secara berurutan:

1. **Validasi secrets** — gagal cepat jika `SESSION_SECRET` atau `POSTGRES_PASSWORD` kosong
2. **Konfigurasi SSH** — menyiapkan runner agar dapat menjangkau GitHub melalui `ssh.github.com:443`
3. **Bootstrap** — setup EC2 sekali saja (idempotent): install Docker, nginx, Certbot, Node 20; dilewati pada run berikutnya
4. **Pull code** — clone ke `/magic-nugger` pada run pertama, selanjutnya `git fetch && git reset --hard origin/master`
5. **Tulis env** — menulis `/magic-nugger/.env` dari GitHub Secrets/Variables, `chmod 600`
6. **Konfigurasi server** — konfigurasi nginx + Certbot, diterapkan ulang jika `DOMAIN` berubah
7. **Download build Unity** — mengunduh release `calculon.tar.gz` dari repo ini, mengekstraknya, menghitung checksum, dan SCP langsung direktori game yang sudah diekstrak ke `/var/www/magic-nugger/web-app/`
8. **Deploy frontend** — `npm ci && npm run build` di server, melakukan patch placeholder `dist/config.js` (`__WEB_SERVER_URL__`, `__API_URL__`, `__UNITY_CHECKSUM__`) via `sed`, lalu `rsync` `dist/` ke static root nginx (mengecualikan direktori Unity agar tidak terhapus), dan reload nginx
9. **Deploy server** — `docker compose build` + `up -d` untuk `magic-nugger-web-server` dan `magic-nugger-cron`; migrasi database berjalan otomatis saat server boot
10. **Health check** — melakukan polling `http://127.0.0.1:3000/health` hingga 30 kali (~60s); pipeline gagal dan mencetak log jika server tidak pernah aktif
11. **Cleanup** — `docker image prune -f`

### 6. Migrasi Database

Migrasi berjalan otomatis saat container server start. Untuk menjalankan secara manual:

```bash
ssh ubuntu@<EC2_IP>
cd /magic-nugger && npm run db:migrate
```

Jika migrasi gagal, container akan exit — perbaiki patch-nya dan restart:

```bash
docker compose restart magic-nugger-web-server
```

### 7. Rollback

**Kode aplikasi:**

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

Restore dari dump jika diperlukan:

```bash
docker exec -i magic-nugger-postgres psql -U postgres magic_nugger < backup.sql
```

### 8. Backup

Container `magic-nugger-cron` berjalan di **dev maupun production** (merupakan bagian dari `docker-compose.yml` dan dijalankan oleh pipeline deploy bersama web server). Container ini menjalankan `pg_dump` mingguan setiap Minggu pukul 02:00, menulis dump ke `db/backups/` di host, dan dicatat di `audit.log_events` (`event = 'cron:backup'`).

Untuk snapshot on-demand:

```bash
npm run db:backup                                         # → db/backups/backup_YYYYMMDD_HHMMSS.sql
npm run db:restore -- db/backups/backup_20260507_020000.sql
```

Jika Anda ingin mengirim dump ke luar instance, tambahkan entri host crontab sebagai tambahan (atau pengganti) job container:

```bash
0 3 * * 0 docker exec magic-nugger-postgres pg_dump -U postgres magic_nugger | aws s3 cp - s3://your-bucket/magic-nugger-$(date +\%Y\%m\%d).sql
```

Lihat [`docs/007-cron-jobs.md`](docs/007-cron-jobs.md) untuk dokumentasi lengkap job cron.

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
| Auth     | Cookie sessions (tanpa JWT), Google OAuth + password lokal |
| Tests    | Jest (backend + frontend), jsdom                        |
| Deploy   | Docker Compose di EC2, Nginx reverse proxy              |

---

## Lisensi

Skripsi — Jonathan, Alden, Shawn
