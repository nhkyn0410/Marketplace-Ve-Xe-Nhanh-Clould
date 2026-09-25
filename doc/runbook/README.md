# Sổ tay thao tác (runbook) — tầng 3 của nhật ký AI

Mỗi **loại** thao tác lặp lại trong dự án (cài package, migration, deploy…) có **một thẻ ngắn**, để bạn tự làm lại được mà không cần AI. Thẻ **không giải thích code**. Nó chỉ trả lời 5 câu: làm để làm gì, cần gì trước, các bước, kiểm tra thế nào, hay lỗi ở đâu.

Guide theo task (`doc/task-propreties/<TASK>-guide.md`) vẫn giữ để nghiệm thu từng task. Khi guide cần một thao tác chung thì trỏ tới thẻ ở đây, không chép lại lệnh.

## Thẻ hiện có

| Mã | Thao tác |
| --- | --- |
| [RB-01](RB-01-dependency.md) | Cài / gỡ dependency (pnpm workspace, Flutter qua FVM) |
| [RB-02](RB-02-prisma-migration.md) | Tạo & áp migration Prisma + cấp quyền role app |
| [RB-03](RB-03-quality-check.md) | Kiểm tra trước khi commit (lint · typecheck · test · build) |
| [RB-04](RB-04-api-client.md) | Sinh lại API client (TS + Dart) sau khi đổi API |
| [RB-05](RB-05-local-infra.md) | Chạy hạ tầng local bằng Docker Compose |
| [RB-06](RB-06-git-pr.md) | Nhánh → commit → PR → merge |
| [RB-07](RB-07-render-deploy.md) | Deploy API lên Render |
| [RB-08](RB-08-catalog-seed.md) | Seed catalog chuẩn (tỉnh/xã, loại xe, tiện ích) |

## Báo cáo dùng thẻ thế nào

`node .claude/hooks/ai-journal.mjs report` so từng lệnh trong nhật ký với danh sách `match:` của các thẻ, theo thứ tự tên file, và lấy thẻ khớp **đầu tiên**:

- Lệnh khớp thẻ nào thì cột **HD** của báo cáo ghi mã thẻ đó.
- Lệnh thuộc nhóm cần hướng dẫn (cài package, DB, deploy, git…) mà chưa khớp thẻ nào sẽ vào mục **"Thao tác chưa có hướng dẫn"**. Đó là danh sách thẻ cần viết thêm. Chỉ viết thẻ khi thao tác đã thực sự xảy ra, không viết phòng xa.
- Khi AI yêu cầu bạn làm tay (lệnh `ops`), nó ghi luôn mã thẻ liên quan.

## Cách viết một thẻ mới

Tên file là `RB-xx-<ten-ngan>.md`. Thẻ dài **tối đa khoảng 40 dòng**, gồm frontmatter và 5 mục như dưới:

```markdown
---
id: RB-08
title: Build APK Flutter
match:
  - /^(fvm\s+)?flutter\s+build\s+(apk|appbundle)\b/
---

# RB-08 — Build APK Flutter

**Mục đích:** … · **Điều kiện:** …

## Các bước
## Kiểm tra
## Lỗi hay gặp

**Liên quan:** ADR-… · doc SDLC …
```

`match:` là danh sách mẫu lệnh mà thẻ bao phủ:
- Chuỗi thường: khớp nếu lệnh **chứa** chuỗi đó, không phân biệt hoa thường.
- Chuỗi dạng `/.../`: là regex.
- Nên dùng regex khi lệnh có tham số chen giữa, ví dụ `pnpm --filter x add y`.

Thẻ thuộc tài liệu dự án nên **được commit**, khác với dữ liệu nhật ký trong `.ai-journal/`.
