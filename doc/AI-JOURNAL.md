# AI-JOURNAL.md — nhật ký sử dụng AI (bắt buộc, dữ liệu KHÔNG commit)

Nhật ký ghi lại minh bạch **mọi hoạt động tự động hoá**: AI tạo/sửa file nào trước, hàm/class nào sinh trước, đã chạy lệnh gì, dùng phần mềm bên thứ 3 nào, đã yêu cầu Khanh làm tay việc gì. Mục đích là **học thuật và rèn kỹ năng**: nhật ký **không giải thích code**, chỉ trỏ tới code (tên hàm/class kèm một dòng công dụng) và tới hướng dẫn thao tác. **Mọi agent** (Claude Code / Codex / Copilot / Cursor) đọc file này và tuân thủ.

## 1. Ba tầng

| Tầng | Ai ghi | Ghi gì | Nơi lưu |
| --- | --- | --- | --- |
| **1. Dòng thời gian tự động** | Hook (Claude Code, Codex). Agent **không bỏ qua được** | Theo đúng thứ tự: tạo/sửa/xoá file kèm **tên** hàm/class và dòng mô tả; lệnh shell đã che secret; package; MCP; nguồn web; subagent nào làm; file do lệnh sinh ra | `.ai-journal/activity/YYYY-MM.jsonl` |
| **2. Nhật ký khai báo** | Agent chạy lệnh | `add`: 1 dòng 6 cột cho mỗi lượt sinh code. `ops`: việc AI yêu cầu Khanh làm tay ngoài repo | `.ai-journal/YYYY-MM.md` + JSONL |
| **3. Sổ tay thao tác** | Agent viết, Khanh duyệt | Mỗi loại thao tác một thẻ ngắn: cài package, migration, deploy… | [`doc/runbook/`](runbook/README.md) (**commit**) |

Lệnh `report` ghép cả ba tầng thành một file Markdown để đọc hoặc nộp (xem mục 5).

`.ai-journal/` đã gitignore: **KHÔNG commit, KHÔNG push**. Thư mục này luôn nằm ở **checkout chính** của repo, kể cả khi phiên chạy trong git worktree, nên xoá worktree không làm mất nhật ký. Mỗi repo trên máy có `.ai-journal/` riêng.

> ⚠ Thư mục này nằm ngoài git nên **không có backup**, và `git clean -fdx` sẽ xoá sạch nó. Hãy sao lưu định kỳ, ví dụ `report all --out <thư mục OneDrive>` hoặc chép cả `.ai-journal/`.

## 2. Tầng 1: hook tự ghi những gì

| Sự kiện | Ghi |
| --- | --- |
| Bạn gửi yêu cầu | Trích ≤ 200 ký tự (đã che secret) và nhánh git. Mỗi yêu cầu mở một "lượt" trong báo cáo |
| Write / Edit (Claude), `apply_patch` (Codex) | Tạo / sửa / xoá, đường dẫn, số dòng ±, **tên** hàm/class: `+` thêm, `~` sửa bên trong, `-` xoá. Kèm **dòng mô tả** lấy từ doc comment. Với `package.json` / `pubspec.yaml` thì ghi tên dependency |
| Lệnh Bash / PowerShell | Lệnh (≤ 300 ký tự, **đã che secret, bỏ phần code nhúng** như heredoc / `node -e`), nhóm lệnh, chạy được hay lỗi. **Không lưu output** |
| MCP, WebFetch / WebSearch | Server + tool + domain; URL tài liệu đã tra (bỏ query string). Không ghi dữ liệu nhập form |
| Subagent | Subagent nào chạy. Thao tác bên trong tự gắn tên subagent (`agent_type`) |
| Cuối lượt (`Stop`) | File đổi mà **không** qua tool sửa file (do lệnh sinh ra như migration, `flutter create`, gen client, hoặc bạn sửa tay), gộp theo thư mục |

Nhóm lệnh gồm: cài/gỡ package · sinh khung/code bằng công cụ · CSDL · kiểm tra/build · chạy dịch vụ · git · deploy/phát hành · công cụ/dịch vụ ngoài · thao tác file · khác · chỉ-đọc. Lệnh **chỉ-đọc** (ls, grep, git status…) chỉ được đếm số lượng, không liệt kê trong báo cáo.

Tên hàm/class được lấy bằng heuristic theo dòng và thụt lề cho TS/JS, Dart, Prisma, SQL, nên **có thể sót hoặc sai** ở cú pháp lạ. Đây không phải trình phân tích cú pháp đầy đủ.

## 3. Luật cho agent

1. **KHÔNG đọc, mở, hay sửa tay** bất kỳ file nào trong `.ai-journal/`. Chỉ ghi thêm bằng các lệnh ở mục 4. Ghi sai thì ghi dòng mới đính chính, để Khanh tự dọn. Luật deny `Edit(/.ai-journal/**)` trong `.claude/settings.json` chặn tool sửa file của Claude.
2. **Sửa code bằng Write / Edit** (hoặc `apply_patch` với Codex). Không dùng sed, heredoc, `Set-Content` để sửa code, vì như thế hook không lấy được tên hàm. Báo cáo sẽ liệt kê riêng những lần sửa bằng shell.
3. **Mỗi class / hàm export / method public MỚI** phải có **1 dòng doc comment tiếng Việt nói nó dùng để làm gì**, đặt ngay trên khai báo: `/** … */` cho TS/JS, `///` cho Dart. Chỉ nêu công dụng, không giải thích cách code chạy. Đây là quy ước sẵn có của repo; hook lấy dòng này làm mô tả trong nhật ký.
   - Không bắt buộc với: helper private, method override / vòng đời (`build`, `initState`, `dispose`, `onModuleInit`…), file test, code sinh tự động (`generated/`, `api_client_dart/`, `*.g.dart`). Code cũ cũng không phải bổ sung.
4. **KHÔNG dán mã nguồn** vào nhật ký. Mọi ô ≤ 300 ký tự.
5. **KHÔNG bịa** cột "Phần SV chỉnh" và "Nhận xét": Khanh tự chịu trách nhiệm học thuật hai cột này (xem mục 4).
6. **Ghi đúng tool + model** đang chạy, ví dụ `Claude Code (Opus 5.5)`, `Codex (gpt-5.6-sol)`, không ghi chung chung "AI".
7. Tầng 2 chỉ do **agent chính** ghi; agent chính nêu tên subagent đã dùng. Tầng 1 tự tách subagent.
8. **KHÔNG commit `.ai-journal/`**, kể cả khi Khanh yêu cầu commit phần còn lại.

## 4. Lệnh

```bash
# Tầng 2 — mỗi lượt sinh/sửa code đáng kể (module, service, schema, migration, test, config CI…)
node .claude/hooks/ai-journal.mjs add "<Mảng kỹ thuật>" "<AI sử dụng>" "<Mục đích>" "<Phần AI sinh>" "" "<Nhận xét>"

# Tầng 2 — khi yêu cầu Khanh tự làm việc ngoài repo (tạo tài khoản, env trên dashboard, DNS, store…)
node .claude/hooks/ai-journal.mjs ops "<Hạng mục>" "<Việc cần làm>" "<RB-xx hoặc bỏ trống>"

# Thay đổi không phải code do AI sinh (chỉ sửa doc…) → bỏ qua kiểm tra tầng 2 một lần
node .claude/hooks/ai-journal.mjs skip "lý do cụ thể"

# Tool KHÔNG có hook (Copilot, Cursor, hoặc Codex khi hook không chạy) → chạy sau mỗi phiên
node .claude/hooks/ai-journal.mjs snapshot <tên-tool>

# Báo cáo (mặc định tháng hiện tại → .ai-journal/report/ai-report-YYYY-MM.md)
node .claude/hooks/ai-journal.mjs report [YYYY-MM|all] [--merge <đường dẫn repo khác>] [--out <thư mục>]
```

| Cột (`add`) | Ghi gì | Ví dụ |
| --- | --- | --- |
| **Mảng kỹ thuật** | Lớp/domain đụng tới | `Backend / IAM`, `DB / Prisma`, `Mobile / Flutter`, `CI` |
| **AI sử dụng** | Tool + model cụ thể; subagent nếu có | `Claude Code (Opus 5.5) + backend-developer` |
| **Mục đích** | 1 câu: vì sao dùng AI cho phần này | `Sinh khung service + guard theo LLD §4.2` |
| **Phần AI sinh** | **Đường dẫn + phạm vi**, không hơn | `apps/api/src/modules/iam/auth/*.ts — service, guard, Zod DTO` |
| **Phần SV chỉnh** | Truyền `""`, Khanh tự điền sau khi review | `Sửa lại logic rotation refresh token` |
| **Nhận xét** | Chất lượng output, lỗi phải sửa, bài học | `Bịa field không có trong schema — phải đối chiếu DB doc` |

Script tự tạo mục ngày, chỉ ghi thêm vào cuối, và tự escape `|`. Nhờ vậy nhật ký **không bao giờ phải đọc lại** (0 token đọc) và agent không có cơ hội sửa dòng cũ. Script từ chối ô dài hơn 300 ký tự: nhật ký là **mục lục** trỏ tới code, không phải bản sao code.

## 5. Báo cáo

Lệnh `report` tạo một file Markdown gồm các phần:
- **Tổng quan.**
- **Theo ngày → theo lượt yêu cầu:** bảng các thao tác đúng thứ tự (giờ, agent/subagent, thao tác, file hoặc lệnh, hàm/class kèm công dụng, mã thẻ hướng dẫn), rồi đến dòng khai báo tầng 2.
- **Phần mềm bên thứ 3:** package, CLI, dịch vụ, MCP, nguồn web; dùng lần đầu khi nào, do agent nào.
- **Việc AI yêu cầu bạn làm tay.**
- **Thao tác chưa có hướng dẫn:** danh sách thẻ sổ tay cần viết thêm.
- **Sửa file bằng lệnh shell.**

Báo cáo có thể xoá và sinh lại bất cứ lúc nào. Nếu dùng hai repo, gộp bằng `--merge`, ví dụ từ repo này: `report 2026-09 --merge C:\Code\ve_xe_nhanh`.

## 6. Cơ chế cưỡng chế

**Claude Code** (`.claude/settings.json`):
- `SessionStart`: nhắc luật vào context.
- `UserPromptSubmit`, `PostToolUse`, `PostToolUseFailure`, `SubagentStart/Stop`: ghi tầng 1. Hook ghi file chạy đồng bộ (khoảng 0,2 giây) để thứ tự luôn đúng; các hook khác chạy nền.
- `Stop`: đối chiếu file do lệnh sinh ra, rồi **chặn kết thúc lượt** nếu (a) code đã đổi mà chưa có dòng tầng 2 mới, hoặc (b) hàm/class mới thiếu dòng mô tả. Chỉ chặn một lần mỗi lượt; lần sau chỉ cảnh báo. Hook lỗi thì bỏ qua (fail-open), không bao giờ chặn nhầm.

**Codex** (`.codex/hooks.json`): cùng script với Claude. Codex **chỉ nạp hook khi repo đã được trust**. Tài liệu Codex mô tả hook cho CLI; nếu app Codex không chạy hook thì chạy `snapshot codex` sau mỗi phiên. Codex không gọi hook cho WebSearch, nên phần này không ghi được.

**Copilot / Cursor**: không có hook. Tuân theo mục 3–4 qua `AGENTS.md` / `.github/copilot-instructions.md`, và chạy `snapshot <tool>` sau mỗi phiên.

Mỗi lần `skip` được ghi vào `.ai-journal/.state/skips.log` để đối chiếu. Hoạt động xảy ra **trước** khi có tầng 1 (trước 25/09/2026) chỉ còn trong git history và tầng 2.

Test của hệ thống nhật ký: `node --test ".claude/hooks/test/*.test.mjs"`.
