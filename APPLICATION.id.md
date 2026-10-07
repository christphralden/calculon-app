# Calculon — Repositori

[English](APPLICATION.md) | **Bahasa Indonesia**

Calculon terbagi ke dalam dua repositori. Dokumen ini hanya membahas cara mendapatkan masing-masing repo ke komputer Anda — untuk setup environment, menjalankan aplikasi, dan deployment, lihat [`README.md`](README.md) / [`README.id.md`](README.id.md).

| Repositori      | Peran                                                                                           | Tautan                                              |
| --------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **calculon-app** | Web app — backend Express, shell frontend React, database PostgreSQL, dan infrastruktur deployment | <https://github.com/christphralden/calculon-app> |
| **Calculon**     | Game Unity WebGL — dibangun dan dikelola secara independen, dikonsumsi oleh `calculon-app` sebagai artefak hasil build | <https://github.com/KRook0110/Calculon>          |

---

## calculon-app (web app)

```bash
git clone https://github.com/christphralden/calculon-app.git
cd calculon-app
```

Tidak memerlukan tooling khusus selain Git.

---

## Calculon (game)

Repositori ini menggunakan **Git LFS** untuk aset binary Unity yang berukuran besar (build, texture, audio, dll). `git clone` biasa akan mengambil file LFS sebagai pointer file kecil, bukan isi file yang sebenarnya, kecuali Git LFS sudah terpasang terlebih dahulu.

```bash
# 1. Install Git LFS (sekali per komputer)
#    macOS:   brew install git-lfs
#    Debian/Ubuntu: sudo apt install git-lfs
#    Windows: winget install GitHub.GitLFS   (atau installer Git LFS)
git lfs install

# 2. Clone repo — file LFS otomatis diambil saat proses clone
git clone https://github.com/KRook0110/Calculon.git
cd Calculon
```

Jika Anda meng-clone sebelum menginstall Git LFS, atau file muncul sebagai pointer teks kecil (misalnya `version https://git-lfs.github.com/spec/v1 ...`) alih-alih file binary yang sebenarnya, tarik konten LFS secara eksplisit:

```bash
git lfs pull
```
