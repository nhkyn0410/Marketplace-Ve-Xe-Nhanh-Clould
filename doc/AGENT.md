# AGENT.md — `doc/` guide

`doc/` chứa thiết kế + trạng thái dự án `Marketplace-Ve-Xe-Nhanh` (managed marketplace vé xe khách). Dùng làm **reference khi code** — KHÔNG load cả thư mục vào context; đọc đúng phần liên quan task, hoặc dùng subagent **`sdlc-doc-reader`** để rút design summary.

## Cấu trúc

```text
doc/
├── AGENT.md             ← file này
├── SDLC/                ← thiết kế (00–12)
│   ├── 00 chuẩn LTV · 01 SRS · 02 HLD · 03 LLD · 04 DB · 05 API
│   └── 06 UI · 07 Security · 08 Test · 09 Deploy · 10 ADR · 11 Task · 12 Release Notes
└── context/
    ├── DOMAIN-MAP.md     ← tên module/folder target (singular) + entity↔module + state enum
    ├── GLOSSARY.md       ← entity / state / error code song ngữ Vi-En
    ├── PROJECT-STATE.md  ← live state: doc status, OQ, blockers
    └── archive/          ← CHANGELOG · SPRINT-LOG · agent-authoring-standard (KHÔNG auto-load)
```

## Dùng khi code

- **Yêu cầu** → `SDLC/01-srs` (FR/BR/NFR/UC, state enum §17). **Thiết kế** → `SDLC/02-hld` (kiến trúc/module) + `SDLC/03-lld` (service/use-case) + `SDLC/04-database-design` (schema/index/RLS) + `SDLC/05-api-specification` (endpoint) + `SDLC/07-security` (auth/RBAC).
- **Đặt tên**: module/folder → `context/DOMAIN-MAP §1, §2` (singular); entity/state/error → `context/GLOSSARY`.
- **Quyết định công nghệ**: `SDLC/10-architecture-decision-record.md` (26 ADR — nguồn chân lý stack).
- Quy ước code đầy đủ ở root `AGENTS.md`; vai trò/workflow ở root `CLAUDE.md`.

## Sửa một SDLC doc (nếu phát sinh)

- Bump revision history (§1.2) trong file + cập nhật `PROJECT-STATE §1` (version).
- KHÔNG tự promote `status` → `Approved` (chỉ Khanh quyết).
- Lịch sử thay đổi → git commit; `PROJECT-STATE §7` chỉ giữ ~5 entry milestone.
- Chuẩn soạn thảo SDLC chi tiết (ISO/IEC/IEEE 15289 + 29148, quy trình B3): `context/archive/agent-authoring-standard.md`.
