# 12. Release Notes & Change Log - Marketplace-Ve-Xe-Nhanh

## 1. Thông tin tài liệu

### 1.1. Metadata

| Thuộc tính    | Giá trị                          |
| ------------- | -------------------------------- |
| Tên tài liệu  | Release Notes & Change Log       |
| Mã tài liệu   | 12-release-notes-change-log      |
| Dự án         | Marketplace-Ve-Xe-Nhanh          |
| Trạng thái    | Draft                            |
| Người viết    | Nguyễn Hồng Khanh, AI Agent      |
| Người duyệt   | Nguyễn Hồng Khanh                |
| Ngày tạo      | 01/06/2026                       |
| Ngày cập nhật | 01/06/2026                       |
| Loại (15289)  | Release information / Change log |

### 1.2. Lịch sử thay đổi

| Phiên bản | Ngày       | Người cập nhật | Nội dung thay đổi                                                                                                                                                                                                                           |
| --------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1      | 01/06/2026 | AI Agent       | Tạo **skeleton** Release Notes & Change Log theo ISO/IEC/IEEE 15289 + quy ước Keep a Changelog. Định nghĩa SemVer, quy trình release, phân loại thay đổi, template release log (chưa có release — pre-code). Chưa có nội dung release thật. |

---

## 2. Mục lục

1. Thông tin tài liệu
2. Mục lục
3. Giới thiệu
4. Quy ước đánh version (SemVer)
5. Quy trình release
6. Phân loại thay đổi
7. Release log
8. Migration & breaking change notes
9. Mapping ADR ↔ release
10. Open Questions / TBD

---

## 3. Giới thiệu

### 3.1. Mục đích

Tài liệu này ghi nhận **release của sản phẩm/code** (v1.0.0 trở đi) và change log theo từng release: tính năng thêm/sửa/bỏ, breaking change, migration, bảo mật. Đây là nguồn tra cứu cho người vận hành, người duyệt và (sau này) khách hàng Operator.

### 3.2. Phân biệt với các change log khác

| Loại thay đổi                         | Theo dõi tại                                                         |
| ------------------------------------- | -------------------------------------------------------------------- |
| Thay đổi **tài liệu SDLC** (pre-code) | `context/PROJECT-STATE.md §7` + Lịch sử thay đổi (§1.2) của từng doc |
| Quyết định kiến trúc                  | `10-architecture-decision-record.md`                                 |
| Thay đổi **code/sản phẩm** (release)  | **Tài liệu này (12)** — bắt đầu từ release v1.0.0                    |

Hiện dự án ở giai đoạn **SDLC documentation, chưa code v1** → release log (§7) còn trống; release đầu tiên dự kiến **v1.0.0** khi code v1 lên production.

### 3.3. Tài liệu tham chiếu

| Tài liệu                                     | Vai trò                                    |
| -------------------------------------------- | ------------------------------------------ |
| `09-deployment-operation-standard.md` | Quy trình release (§5), rollback (§10)     |
| `10-architecture-decision-record.md` | Quyết định kỹ thuật phản ánh trong release |
| `context/PROJECT-STATE.md`                   | Trạng thái doc, OQ, change log SDLC        |
| `08-test-plan-acceptance-criteria.md` | Exit criteria gate cho release             |

---

## 4. Quy ước đánh version (SemVer)

Dùng **Semantic Versioning** `MAJOR.MINOR.PATCH` cho release code (v1.0.0+).

| Thành phần | Tăng khi                                                             | Ví dụ           |
| ---------- | -------------------------------------------------------------------- | --------------- |
| MAJOR      | Breaking change API/DB/contract (cần migration phía client/Operator) | `1.0.0 → 2.0.0` |
| MINOR      | Thêm tính năng tương thích ngược                                     | `1.0.0 → 1.1.0` |
| PATCH      | Sửa lỗi/bảo mật tương thích ngược                                    | `1.0.0 → 1.0.1` |

- API URL version (`/v1`, `/v2`) đổi theo MAJOR breaking (ADR-012).
- Mobile (Expo): EAS Update OTA = PATCH/MINOR không qua store; EAS Build mới = thay đổi native/MAJOR (ADR-014).
- Pre-release: hậu tố `-alpha.N` / `-beta.N` / `-rc.N` khi cần (vd `1.0.0-beta.1`).

---

## 5. Quy trình release

| Bước | Nội dung                                                                 | Nguồn               |
| ---- | ------------------------------------------------------------------------ | ------------------- |
| 1    | Đạt Exit criteria test (critical pass: money/idempotency/tenant/seat)    | 08 Test §10.2       |
| 2    | GitHub Actions pass (lint + typecheck + Vitest + build + gen-client)     | ADR-026             |
| 3    | Tag version SemVer + viết entry release log (§7) + change log (§6)       | Tài liệu này        |
| 4    | Backup production (Postgres PITR + Mongo) trước deploy                   | 09 Deploy §5 REL-06 |
| 5    | Merge `main` → Render auto-deploy (API + worker cùng image) + EAS mobile | ADR-023/024/026     |
| 6    | Smoke test + theo dõi Sentry (không error spike)                         | 09 Deploy §5 REL-07 |
| 7    | Nếu lỗi → rollback (Render previous deploy / EAS Update OTA)             | 09 Deploy §10       |

> Người duyệt release (promote trạng thái) = **Khanh** (AI không tự duyệt).

---

## 6. Phân loại thay đổi

Mỗi release liệt kê thay đổi theo nhóm (Keep a Changelog):

| Nhóm         | Ý nghĩa                                                  |
| ------------ | -------------------------------------------------------- |
| `Added`      | Tính năng/endpoint/màn hình mới                          |
| `Changed`    | Thay đổi hành vi hiện có                                 |
| `Deprecated` | Sắp loại bỏ (kèm ngày, header `Deprecation` per ADR-012) |
| `Removed`    | Đã loại bỏ                                               |
| `Fixed`      | Sửa lỗi                                                  |
| `Security`   | Vá bảo mật (ưu tiên cao nhất)                            |

---

## 7. Release log

> **Chưa có release.** Bảng dưới là **template**; điền khi cắt release v1.0.0 đầu tiên (code v1 lên production).

| Version            | Ngày | Loại  | Tóm tắt                                            | Migration | Link |
| ------------------ | ---- | ----- | -------------------------------------------------- | --------- | ---- |
| `1.0.0` (template) | TBD  | MAJOR | MVP v1: marketplace + operator OS + platform admin | TBD       | TBD  |

<!--
Template entry cho mỗi release (copy khi release thật):

### vX.Y.Z — DD/MM/YYYY

**Loại**: MAJOR / MINOR / PATCH
**Phạm vi**: (module/actor ảnh hưởng)

#### Added
- ...
#### Changed
- ...
#### Fixed
- ...
#### Security
- ...

**Breaking change / Migration**: (xem §8) hoặc "Không"
**Rollback**: (cách rollback nếu cần)
-->

---

## 8. Migration & breaking change notes

> Trống — điền khi có release breaking (MAJOR). Mỗi mục cần: nguyên nhân, bước migration (DB Prisma / API client / mobile), thời gian downtime dự kiến, rollback plan. Tham chiếu 04 DB §10 (migration) + 09 Deploy §10 (rollback).

---

## 9. Mapping ADR ↔ release

Release v1.0.0 sẽ là hiện thực hóa toàn bộ **19-layer stack** đã chốt (ADR-002 + ADR-009..027). Bảng này ghi nhận release nào đưa quyết định ADR nào vào production (điền khi release).

| Release           | ADR hiện thực hóa                        | Ghi chú             |
| ----------------- | ---------------------------------------- | ------------------- |
| `1.0.0` (dự kiến) | ADR-002, ADR-009..027 (toàn bộ stack v1) | TBD khi cắt release |

---

## 10. Open Questions / TBD

| ID        | Câu hỏi                                                                                | Tác động     | Trạng thái                         |
| --------- | -------------------------------------------------------------------------------------- | ------------ | ---------------------------------- |
| REL-OQ-01 | Release đầu tiên gắn version `1.0.0` hay `0.x` beta trước?                             | Versioning   | Mở (quyết khi gần code production) |
| REL-OQ-02 | Cadence release v1.x (theo Sprint 1 tuần per CLAUDE.md §6.1) cố định hay theo nhu cầu? | Release plan | Mở                                 |
| REL-OQ-03 | Release notes có công khai cho Operator (customer-facing) hay chỉ nội bộ?              | Audience     | Mở                                 |

---

### Quy ước mã trong Release Notes

- `REL-OQ-NN`: Câu hỏi mở của Release Notes.
- Version release: SemVer `MAJOR.MINOR.PATCH` (§4).
