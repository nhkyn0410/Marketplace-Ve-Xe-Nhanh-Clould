import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { events, put, run, tempRepo } from "./helpers.mjs";

const TURN = { session_id: "sess-0001aaaa", prompt_id: "turn-0001bbbb" };
const NO_DOC = "export function listTrips() {\n  return [];\n}\n";

function execGit(root, ...args) {
  execFileSync("git", args, { cwd: root, stdio: "ignore" });
}

function write(root, rel, text) {
  put(root, rel, text);
  return run(root, ["capture", "claude"], {
    ...TURN,
    hook_event_name: "PostToolUse",
    tool_name: "Write",
    tool_input: { file_path: join(root, rel), content: text },
    tool_response: { type: "create", originalFile: null },
  });
}

test("hook: input hỏng hoặc rỗng → thoát 0, không ghi gì", () => {
  const root = tempRepo();
  for (const bad of ["{not json", "", "null", "[1]", JSON.stringify({ hook_event_name: "PostToolUse" })]) {
    const r = run(root, ["capture", "claude"], bad);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, "");
  }
  assert.deepEqual(events(root), []);
  assert.equal(run(root, ["stop", "claude"], "{oops").status, 0);
});

test("Stop: đối chiếu file do lệnh sinh ra, chặn khi thiếu mô tả + thiếu nhật ký, chỉ chặn 1 lần", () => {
  const root = tempRepo();
  // Moc dau tien
  assert.equal(run(root, ["session-start"], { hook_event_name: "SessionStart", source: "startup", ...TURN }).status, 0);
  assert.equal(run(root, ["stop", "claude"], { hook_event_name: "Stop", ...TURN }).stdout, "");

  run(root, ["capture", "claude"], { ...TURN, hook_event_name: "UserPromptSubmit", prompt: "Thêm API chuyến xe" });
  write(root, "src/trip.ts", NO_DOC);
  put(root, "generated/client.ts", "// sinh boi lenh\n"); // file do lenh sinh ra

  const blocked = run(root, ["stop", "claude"], { hook_event_name: "Stop", ...TURN });
  const out = JSON.parse(blocked.stdout);
  assert.equal(out.decision, "block");
  assert.match(out.reason, /src\/trip\.ts → listTrips/);
  assert.match(out.reason, /ai-journal\.mjs add/);

  const gen = events(root).filter((e) => e.ev === "gen");
  assert.equal(gen.length, 1);
  assert.deepEqual(gen[0].paths, ["generated/client.ts"], "file đã ghi qua Write không bị tính là do lệnh");

  const again = JSON.parse(run(root, ["stop", "claude"], { hook_event_name: "Stop", stop_hook_active: true, ...TURN }).stdout);
  assert.equal(again.decision, undefined);
  assert.match(again.systemMessage, /thiếu/);

  // Bo sung mo ta + dong nhat ky -> het chan, ghi su kien desc
  put(root, "src/trip.ts", `/** Liệt kê chuyến xe đang mở bán. */\n${NO_DOC}`);
  const added = run(root, ["add", "Backend / Trip", "Claude Code (Opus 5.5)", "Test", "src/trip.ts — listTrips", "", "ok"]);
  assert.equal(added.status, 0, added.stderr);
  assert.equal(run(root, ["stop", "claude"], { hook_event_name: "Stop", ...TURN }).stdout, "");
  const desc = events(root).find((e) => e.ev === "desc");
  assert.deepEqual(desc.items, [{ path: "src/trip.ts", name: "listTrips", text: "Liệt kê chuyến xe đang mở bán." }]);
  assert.ok(events(root).some((e) => e.ev === "note" && e.cells[4] === "⟨chờ SV điền⟩"));
});

test("Lượt chỉ `git add` / commit: không chặn, không báo lại file đã ghi; sửa lần 2 vẫn được ghi", () => {
  const root = tempRepo();
  const turn2 = { session_id: "sess-0001aaaa", prompt_id: "turn-0002cccc" };
  run(root, ["stop", "claude"], { hook_event_name: "Stop", ...TURN }); // moc
  write(root, "src/a.ts", "/** Hàm a. */\nexport function a() {}\n");
  run(root, ["add", "Backend", "Claude Code (Opus 5.5)", "Test", "src/a.ts", "", "ok"]);
  assert.equal(run(root, ["stop", "claude"], { hook_event_name: "Stop", ...TURN }).stdout, "");

  // Luot sau chi stage file -> khong chan, khong co gen
  execGit(root, "add", "-A");
  assert.equal(run(root, ["stop", "claude"], { hook_event_name: "Stop", ...turn2 }).stdout, "");
  assert.equal(events(root).filter((e) => e.ev === "gen").length, 0);

  // snapshot 2 lan, moi lan mot thay doi -> ca 2 deu duoc ghi
  put(root, "src/b.ts", "export const b = 1;\n");
  run(root, ["snapshot", "codex"]);
  put(root, "src/b.ts", "export const b = 2;\nexport const c = 3;\n");
  run(root, ["snapshot", "codex"]);
  assert.equal(events(root).filter((e) => e.tool === "codex" && e.path === "src/b.ts").length, 2);
});

test("add / ops: kiểm tra tham số và trần 300 ký tự", () => {
  const root = tempRepo();
  assert.equal(run(root, ["add", "a", "b"]).status, 1);
  assert.equal(run(root, ["add", "a", "b", "c", "x".repeat(301), "", "f"]).status, 1);
  assert.equal(run(root, ["ops", "chỉ một"]).status, 1);
  const ok = run(root, ["ops", "Deploy / Render", "Thêm env RESEND_API_KEY cho service api", "RB-07"]);
  assert.equal(ok.status, 0, ok.stderr);
  const ops = events(root).find((e) => e.ev === "ops");
  assert.deepEqual([ops.area, ops.guide], ["Deploy / Render", "RB-07"]);
});

test("snapshot cho tool không có hook: lần đầu lưu mốc, lần sau ghi file đổi + tên hàm", () => {
  const root = tempRepo();
  assert.match(run(root, ["snapshot", "codex"]).stdout, /lần chụp đầu/);
  put(root, "src/fare.ts", "/** Tính giá vé. */\nexport function fare() {}\n");
  const r = run(root, ["snapshot", "codex"]);
  assert.equal(r.status, 0, r.stderr);
  const [ev] = events(root).filter((e) => e.ev === "file");
  assert.deepEqual([ev.tool, ev.op, ev.path, ev.sym], ["codex", "create", "src/fare.ts", ["+fare"]]);
  assert.equal(ev.docs.fare, "Tính giá vé.");
  assert.equal(run(root, ["snapshot"]).status, 1);
});

test("report: bảng theo lượt, mã thẻ sổ tay, phần mềm bên thứ 3, thao tác thiếu hướng dẫn, gộp repo", () => {
  const root = tempRepo();
  put(
    root,
    "doc/runbook/RB-01-dependency.md",
    "---\nid: RB-01\ntitle: Cài dependency\nmatch:\n  - /^pnpm\\b.*\\badd\\b/\n  - flutter pub add\n---\nNội dung\n",
  );
  run(root, ["capture", "claude"], { ...TURN, hook_event_name: "UserPromptSubmit", prompt: "Cài zod và deploy" });
  write(root, "src/trip.ts", `/** Liệt kê chuyến xe. */\n${NO_DOC}`);
  run(root, ["capture", "claude"], {
    ...TURN,
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_input: { command: "pnpm --filter @vexenhanh/api add zod" },
  });
  run(root, ["capture", "claude"], {
    ...TURN,
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_input: { command: "gh pr create --title x" },
  });
  run(root, ["ops", "Deploy / Render", "Bấm Manual Deploy", "RB-07"]);
  for (const command of ["git status --short", 'node .claude/hooks/ai-journal.mjs ops "a" "b"']) {
    run(root, ["capture", "claude"], { ...TURN, hook_event_name: "PostToolUse", tool_name: "Bash", tool_input: { command } });
  }

  const other = tempRepo();
  run(other, ["capture", "codex"], {
    hook_event_name: "PostToolUse",
    session_id: "codex-777777",
    turn_id: "t-1",
    model: "gpt-5.6-sol",
    tool_name: "Bash",
    tool_input: { command: "pnpm test" },
  });

  const out = mkdtempSync(join(tmpdir(), "aij-out-"));
  const month = events(root)[0].ts.slice(0, 7);
  const r = run(root, ["report", month, "--merge", other, "--out", out]);
  assert.equal(r.status, 0, r.stderr);
  const md = readFileSync(join(out, `ai-report-${month}.md`), "utf8");
  assert.match(md, /# Báo cáo hoạt động AI/);
  assert.match(md, /> \*\*Yêu cầu:\*\* “Cài zod và deploy”/);
  assert.match(md, /\+listTrips — Liệt kê chuyến xe\./);
  assert.match(md, /Lệnh · Cài \/ gỡ package \| `pnpm --filter @vexenhanh\/api add zod` \| Package: \+zod \| RB-01/);
  assert.match(md, /\| `zod` \| Package npm \|/);
  assert.match(md, /\| `gh` \| Công cụ \/ dịch vụ ngoài \|/);
  assert.match(md, /Yêu cầu làm tay · Deploy \/ Render \| Bấm Manual Deploy/);
  assert.match(md, /Deploy \/ phát hành \| `gh pr create --title x`/, "gh pr create chưa có thẻ → vào danh sách thiếu");
  assert.match(md, /Codex · gpt-5\.6-sol/);
  assert.doesNotMatch(md, /git status --short/, "lệnh chỉ-đọc không liệt kê");
  assert.match(md, /_\+1 lệnh chỉ-đọc/);
  assert.doesNotMatch(md, /Lệnh · Nhật ký/, "lệnh nhật ký không thành dòng riêng");
  assert.match(md, /Gộp nhật ký của/);
  assert.equal(run(root, ["report", "bad-arg"]).status, 1);
});
