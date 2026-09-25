---
id: RB-01
title: Cài / gỡ dependency (pnpm workspace, Flutter qua FVM)
match:
  - /(^|[;&|]\s*)(pnpm|npm|yarn)\s+(.*\s)?(add|remove|rm|uninstall|install|i|update|up|dedupe)(\s|$)/
  - /\bpub\s+(add|remove|get|upgrade|downgrade)\b/
  - /(^|[;&|]\s*)fvm\s+(install|use)\b/
---

# RB-01 — Cài / gỡ dependency

**Mục đích:** thêm, bỏ hoặc nâng thư viện cho đúng app/package mà không phá lockfile của monorepo.
**Điều kiện:** Node 24 + pnpm 10 (`package.json` → `engines`); với mobile cần FVM và Flutter đúng bản trong `.fvmrc`.

## Các bước

1. Chỉ thêm thư viện đã có trong thiết kế (ADR, file 10). Thư viện/vendor mới → hỏi trước (CLAUDE.md §4).
2. JS/TS: cài vào **đúng package**, không cài ở root:
   `pnpm --filter @vexenhanh/api add <tên>` (thêm `-D` nếu chỉ dùng lúc dev/test).
3. Gỡ: `pnpm --filter @vexenhanh/api remove <tên>`.
4. Sau khi pull code mới: `pnpm install` (CI dùng `pnpm install --frozen-lockfile`).
5. Flutter (trong thư mục app): `fvm flutter pub add <tên>` → `fvm flutter pub get`.
6. Commit **cả** `package.json` và `pnpm-lock.yaml` (hoặc `pubspec.yaml` + `pubspec.lock` của app).

## Kiểm tra

- `git diff pnpm-lock.yaml` chỉ đổi phần liên quan tới package vừa thêm.
- `pnpm typecheck` và `pnpm test` vẫn xanh ([RB-03](RB-03-quality-check.md)).

## Lỗi hay gặp

- Cài nhầm vào root: package xuất hiện trong `package.json` gốc. Gỡ ở root rồi cài lại với `--filter`.
- `ERR_PNPM_OUTDATED_LOCKFILE` trên CI: quên commit lockfile.
- Package có script cài đặt bị chặn: pnpm chỉ cho chạy những package có trong `pnpm.onlyBuiltDependencies`.

**Liên quan:** ADR-013 (monorepo Turborepo + pnpm) · ADR-028 (Flutter/FVM)
