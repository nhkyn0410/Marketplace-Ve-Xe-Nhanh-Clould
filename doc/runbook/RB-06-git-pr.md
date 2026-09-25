---
id: RB-06
title: Nhánh → commit → PR → merge
match:
  - /(^|[;&|]\s*)git\s+(switch|checkout|commit|push|merge|rebase|pull|cherry-pick|tag)\b/
  - gh pr
---

# RB-06 — Nhánh → commit → PR → merge

**Mục đích:** mỗi thay đổi đi qua một nhánh riêng và PR có CI kiểm tra, không commit thẳng vào nhánh chính.
**Điều kiện:** đã đăng nhập GitHub CLI (`gh auth status`). Nhánh gốc là `develop`.

## Các bước

1. Cập nhật và tách nhánh: `git switch develop` → `git pull` → `git switch -c <loai>/<ten-ngan>` (ví dụ `feat/iam-session`, `chore/ai-journal`).
2. Mỗi thay đổi logic 1 commit. Message theo Conventional Commits: `feat(iam): them thu hoi thiet bi` (xem `.github/instructions/commit-message.instructions.md`).
3. Trước khi đẩy lên, chạy [RB-03](RB-03-quality-check.md).
4. Đẩy nhánh: `git push -u origin <nhanh>`
5. Mở PR vào `develop`: `gh pr create --base develop --fill`, rồi sửa mô tả cho rõ.
6. Chờ CI xanh, tự review diff, rồi merge trên GitHub (hoặc `gh pr merge`).

## Kiểm tra

- `gh pr checks` báo tất cả pass.
- Sau khi merge: `git switch develop` → `git pull`, rồi xoá nhánh cũ bằng `git branch -d <nhanh>`.

## Lỗi hay gặp

- Conflict khi merge: `git pull origin develop` vào nhánh của bạn, sửa conflict, commit, rồi đẩy lại.
- Lỡ commit vào `develop`: chưa push thì tạo nhánh mới từ commit đó rồi `git reset` develop về lại bản trên remote. Việc này khó quay lại, nên hỏi trước khi làm.
- Không commit thư mục `.ai-journal/` (đã gitignore).

**Liên quan:** ADR-026 (GitHub Actions) · `AGENTS.md` § Git workflow
