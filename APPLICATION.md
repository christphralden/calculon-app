# Calculon — Repositories

**English** | [Bahasa Indonesia](APPLICATION.id.md)

Calculon is split across two repositories. This document covers only how to get each one onto your machine — for environment setup, running the app, and deployment, see [`README.md`](README.md) / [`README.id.md`](README.id.md).

| Repository      | Role                                                                                           | Link                                              |
| --------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| **calculon-app** | Web app — Express backend, React frontend shell, PostgreSQL database, and deployment infra     | <https://github.com/christphralden/calculon-app> |
| **Calculon**     | Unity WebGL game — built and maintained independently, consumed by `calculon-app` as a prebuilt artifact | <https://github.com/KRook0110/Calculon>          |

---

## calculon-app (web app)

```bash
git clone https://github.com/christphralden/calculon-app.git
cd calculon-app
```

No special tooling required beyond Git.

---

## Calculon (game)

This repository uses **Git LFS** for its large Unity binary assets (builds, textures, audio, etc.). Plain `git clone` will fetch LFS files as small pointer files instead of their real content unless Git LFS is installed first.

```bash
# 1. Install Git LFS (once per machine)
#    macOS:   brew install git-lfs
#    Debian/Ubuntu: sudo apt install git-lfs
#    Windows: winget install GitHub.GitLFS   (or the Git LFS installer)
git lfs install

# 2. Clone the repo — LFS files are fetched automatically during clone
git clone https://github.com/KRook0110/Calculon.git
cd Calculon
```

If you cloned before installing Git LFS, or files show up as small text pointers (e.g. `version https://git-lfs.github.com/spec/v1 ...`) instead of real binaries, pull the LFS content explicitly:

```bash
git lfs pull
```
