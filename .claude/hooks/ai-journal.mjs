#!/usr/bin/env node
// Nhat ky su dung AI — 3 tang (doc/AI-JOURNAL.md):
//   tang 1  hook tu ghi dong thoi gian (file + ten ham/class, lenh, MCP, web, subagent) -> .ai-journal/activity/
//   tang 2  agent khai bao: `add` (6 cot) va `ops` (viec yeu cau nguoi lam tay)
//   tang 3  so tay thao tac doc/runbook/ — `report` gan ma the vao tung lenh
// Hook:  session-start | capture <claude|codex> | stop [claude|codex]
// Lenh:  add <6 o> | ops <hang muc> <viec> [RB-xx] | skip "<ly do>" | snapshot <tool> | report [YYYY-MM|all] [--merge <repo>] [--out <thu muc>]
// Fail-open: moi loi noi bo cua hook deu thoat 0, khong bao gio chan nham.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { baseEvent, eventsFromHook } from "./lib/capture.mjs";
import { loadRunbook, renderReport } from "./lib/report.mjs";
import { appendEvents, git, isoLocal, readEvents, repoContext, shortHash } from "./lib/store.mjs";
import { checkDocs, genEvent, snapshotEvents, unrecordedChanges } from "./lib/worktree.mjs";

const COLS = [
  "Mảng kỹ thuật",
  "AI sử dụng",
  "Mục đích",
  "Phần AI sinh",
  "Phần SV chỉnh",
  "Nhận xét",
];
const HEADER = `| ${COLS.join(" | ")} |`;
const SEPARATOR = "| --- | --- | --- | --- | --- | --- |";
/** Tran do dai moi o — chan viec dan ca block ma nguon vao nhat ky. */
const MAX_CELL = 300;
const HOOK_MODES = new Set(["session-start", "stop", "capture"]);

const mode = process.argv[2];
const input = HOOK_MODES.has(mode) ? readStdinJson() : {};
// Uu tien cwd cua hook (dung worktree cua subagent); repoContext tu leo len goc repo.
const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const ctx = repoContext(cwd);
const dir = ctx.dir;
const stateDir = join(dir, ".state");
// Moi worktree 1 moc rieng; checkout chinh giu ten file cu de khong mat moc da co.
const baselineFile = join(
  stateDir,
  ctx.top.toLowerCase() === ctx.main.toLowerCase() ? "baseline.json" : `baseline-${shortHash(ctx.top.toLowerCase())}.json`,
);

try {
  if (mode === "session-start") sessionStart();
  else if (mode === "capture") capture(process.argv[3] || "claude");
  else if (mode === "stop") stop(process.argv[3] || "claude");
  else if (mode === "skip") skip();
  else if (mode === "add") add();
  else if (mode === "ops") ops();
  else if (mode === "snapshot") snapshot(process.argv[3]);
  else if (mode === "report") report(process.argv.slice(3));
} catch (err) {
  // Lenh do agent/nguoi goi truc tiep -> phai bao loi; hook thi fail-open.
  if (!HOOK_MODES.has(mode)) fail(`Lỗi nhật ký: ${err.message}`);
}
process.exit(0);

// ---------------------------------------------------------------- hook

function sessionStart() {
  try {
    appendEvents(dir, eventsFromHook(input, "claude", ctx));
  } catch {
    // fail-open
  }
  ensureTodaySection();
  if (!existsSync(baselineFile)) writeBaseline(gitState(), countRows());
  emit({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext:
        `NHẬT KÝ AI 3 tầng (bắt buộc, KHÔNG commit) — quy tắc: doc/AI-JOURNAL.md. KHÔNG đọc/mở/sửa tay .ai-journal/.\n` +
        `1) Hook tự ghi mọi file/lệnh/subagent. Sửa code bằng Write/Edit (không sed/heredoc) để lấy được tên hàm.\n` +
        `2) Mỗi class / hàm export / method public MỚI: 1 dòng doc comment tiếng Việt nói nó dùng để làm gì (/** … */ cho TS, /// cho Dart). Hook Stop chặn nếu thiếu.\n` +
        `3) Mỗi lần sinh/sửa code đáng kể, ghi 1 dòng:\n` +
        `  node .claude/hooks/ai-journal.mjs add "<${COLS.join('>" "<')}>"\n` +
        `   Mỗi ô ≤ ${MAX_CELL} ký tự, một dòng. "Phần AI sinh" = đường dẫn + phạm vi, KHÔNG dán mã nguồn. "Phần SV chỉnh" truyền "" (Khanh tự điền).\n` +
        `4) Khi yêu cầu Khanh tự làm việc ngoài repo (tạo tài khoản, env dashboard, DNS, store…):\n` +
        `  node .claude/hooks/ai-journal.mjs ops "<Hạng mục>" "<Việc cần làm>" "<RB-xx hoặc "">"`,
    },
  });
}

/** Hook PostToolUse / UserPromptSubmit / Subagent* / SessionStart (Codex) — chi ghi, khong in gi. */
function capture(tool) {
  appendEvents(dir, eventsFromHook(input, tool, ctx));
}

function stop(tool) {
  const base = baseEvent(input, tool);
  const extra = [];
  let missingDocs = [];
  let turnEvents = null;
  try {
    const found = unrecordedChanges(ctx, base.ts);
    if (found) extra.push(genEvent(base, found.changed));
  } catch {
    // fail-open
  }
  try {
    if (base.sid && base.turn) {
      turnEvents = [
        ...readEvents(dir, base.ts.slice(0, 7)).filter((e) => e.sid === base.sid && e.turn === base.turn),
        ...extra,
      ];
      const { found, missing } = checkDocs(ctx, turnEvents);
      if (found.length) extra.push({ ...base, ev: "desc", items: found });
      missingDocs = missing;
    }
  } catch {
    // fail-open
  }
  try {
    appendEvents(dir, extra);
  } catch {
    // fail-open
  }

  const needJournal = journalMissing(turnEvents);
  if (!needJournal && !missingDocs.length) return;

  // Chi chan 1 lan / luot: dua vao stop_hook_active, va moc rieng phong khi tool khong gui truong nay.
  const turnKey = `${base.sid ?? ""}:${base.turn ?? ""}`;
  const blockedBefore = base.turn && readJson(join(stateDir, "blocked.json"))?.key === turnKey;
  if (input.stop_hook_active || blockedBefore) {
    // Da chan 1 lan roi — canh bao thay vi lap vo han. Giu nguyen baseline de luot sau van chan.
    const what = [
      needJournal ? "dòng nhật ký tầng 2" : "",
      missingDocs.length ? `mô tả cho ${missingDocs.length} hàm/class` : "",
    ].filter(Boolean);
    return emit({ systemMessage: `⚠ Nhật ký AI còn thiếu: ${what.join(", ")}. Ghi bù trước khi tiếp tục.` });
  }

  const parts = [];
  if (needJournal) {
    parts.push(
      `Code trong repo đã thay đổi nhưng chưa có dòng nhật ký AI mới.\n` +
        `Chạy lệnh này — KHÔNG đọc, KHÔNG mở, KHÔNG sửa tay file nhật ký:\n` +
        `  node .claude/hooks/ai-journal.mjs add "<${COLS.join('>" "<')}>"\n` +
        `- Mảng kỹ thuật: vd "Backend / IAM", "DB / Prisma", "CI".\n` +
        `- AI sử dụng: tên tool + model cụ thể (vd "Claude Code (Opus 5.5)", "Codex (gpt-5.6-sol)").\n` +
        `- Mục đích: 1 câu, vì sao dùng AI cho phần này.\n` +
        `- Phần AI sinh: ĐƯỜNG DẪN + phạm vi vừa sinh/sửa. TUYỆT ĐỐI không dán mã nguồn.\n` +
        `- Phần SV chỉnh: truyền chuỗi rỗng "" — Khanh tự điền, KHÔNG bịa.\n` +
        `- Nhận xét: chất lượng output, lỗi phải sửa, bài học.\n` +
        `Mỗi ô một dòng, ≤ ${MAX_CELL} ký tự.\n` +
        `Nếu thay đổi KHÔNG phải code do AI sinh (sửa doc, sửa chính nhật ký), chạy:\n` +
        `  node .claude/hooks/ai-journal.mjs skip "lý do cụ thể"`,
    );
  }
  if (missingDocs.length) {
    const shown = missingDocs.slice(0, 15).map((m) => `  - ${m}`);
    if (missingDocs.length > 15) shown.push(`  - … và ${missingDocs.length - 15} tên khác`);
    parts.push(
      `Các hàm/class mới sau chưa có mô tả công dụng:\n${shown.join("\n")}\n` +
        `Thêm NGAY TRÊN khai báo 1 dòng doc comment tiếng Việt nói nó dùng để làm gì ` +
        `(/** … */ cho TS/JS, /// cho Dart) — không giải thích cách code chạy. Sửa bằng Edit.`,
    );
  }
  if (base.turn) {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, "blocked.json"), JSON.stringify({ key: turnKey, ts: Date.now() }), "utf8");
  }
  emit({ decision: "block", reason: parts.join("\n\n") });
}

// ---------------------------------------------------------------- lenh

/**
 * Append 1 dong nhat ky tu dong lenh — agent KHONG can doc/mo file nhat ky.
 * node .claude/hooks/ai-journal.mjs add "<mang>" "<ai>" "<muc dich>" "<AI sinh>" "<SV chinh>" "<nhan xet>"
 */
function add() {
  const cells = process.argv.slice(3);
  if (cells.length !== 6) {
    return fail(
      `Cần đúng 6 tham số theo thứ tự: ${COLS.join(" | ")}\n` +
        `Ví dụ: node .claude/hooks/ai-journal.mjs add "Backend / IAM" "Claude Code (Opus 5.5)" ` +
        `"Sinh service đăng nhập theo LLD §4.2" "apps/api/src/modules/iam/auth/*.ts — service, guard, Zod DTO" "" ` +
        `"Bịa field ngoài schema, phải sửa tay"`,
    );
  }
  const clean = cleanCells(cells);
  if (!clean[4]) clean[4] = "⟨chờ SV điền⟩";
  checkCells(clean, COLS);

  const file = ensureTodaySection();
  appendFileSync(file, `| ${clean.join(" | ")} |\n`, "utf8");
  appendEvents(dir, [{ ts: isoLocal(), ev: "note", cells: clean }]);
  process.stdout.write(`Đã ghi 1 dòng nhật ký vào ${rel(file)} (mục ${today()}).\n`);
}

/** Ghi 1 viec AI yeu cau nguoi lam tay ngoai repo (tai khoan, env dashboard, DNS, store...). */
function ops() {
  const [area, task, guide = ""] = process.argv.slice(3);
  const cols = ["Hạng mục", "Việc cần làm", "Mã thẻ hướng dẫn"];
  if (!area?.trim() || !task?.trim()) {
    return fail(
      `Cần ít nhất 2 tham số: "<Hạng mục>" "<Việc cần làm>" ["<RB-xx>"]\n` +
        `Ví dụ: node .claude/hooks/ai-journal.mjs ops "Deploy / Render" "Thêm env RESEND_API_KEY cho service api" "RB-07"`,
    );
  }
  const clean = cleanCells([area, task, guide]);
  checkCells(clean, cols);
  appendEvents(dir, [{ ts: isoLocal(), ev: "ops", area: clean[0], task: clean[1], guide: clean[2] || undefined }]);
  process.stdout.write(`Đã ghi yêu cầu làm tay: ${clean[0]} — ${clean[1]}\n`);
}

/** Tool khong co hook (Codex khi hook khong chay, Copilot, Cursor...): chup file doi tu lan truoc. */
function snapshot(tool) {
  if (!tool) return fail(`Cần tên tool. Ví dụ: node .claude/hooks/ai-journal.mjs snapshot codex`);
  if (!ctx.isGit) return fail("Chỉ chạy được trong git repo.");
  const ts = isoLocal();
  const found = unrecordedChanges(ctx, ts);
  if (!found) {
    process.stdout.write("Không có file đổi mới (hoặc đây là lần chụp đầu — đã lưu mốc, lần sau mới ghi).\n");
    return;
  }
  const events = snapshotEvents(ctx, { ts, tool, agent: "main" }, found.changed);
  appendEvents(dir, events);
  process.stdout.write(`Đã ghi ${events.length} file đổi (tool: ${tool}) vào nhật ký hoạt động.\n`);
}

/** Dung bao cao Markdown tu nhat ky tang 1 + 2, gan ma the so tay tang 3. */
function report(args) {
  let month = null;
  let outDir = null;
  const merges = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--merge") merges.push(args[(i += 1)]);
    else if (args[i] === "--out") outDir = args[(i += 1)];
    else if (/^(\d{4}-\d{2}|all)$/.test(args[i])) month = args[i];
    else return fail(`Tham số không hiểu: ${args[i]}\nDùng: report [YYYY-MM|all] [--merge <repo khác>] [--out <thư mục>]`);
  }
  month ??= isoLocal().slice(0, 7);
  const label = (c) => basename(c.main);
  const sources = [ctx, ...merges.filter(Boolean).map((p) => repoContext(resolve(p)))];
  const events = sources.flatMap((c) =>
    readEvents(c.dir, month).map((e) => (sources.length > 1 ? { ...e, repo: label(c) } : e)),
  );
  const md = renderReport({
    events,
    cards: loadRunbook(ctx.top),
    title: `Báo cáo hoạt động AI — ${month === "all" ? "toàn bộ" : month}`,
    command: ["node .claude/hooks/ai-journal.mjs report", ...args].join(" "),
    repos: sources.map(label),
  });
  const target = resolve(outDir ?? join(dir, "report"));
  mkdirSync(target, { recursive: true });
  const file = join(target, `ai-report-${month}.md`);
  writeFileSync(file, md, "utf8");
  process.stdout.write(`Đã dựng báo cáo (${events.length} sự kiện) → ${file}\n`);
}

function skip() {
  const reason = process.argv.slice(3).join(" ").trim() || "(không nêu lý do)";
  mkdirSync(stateDir, { recursive: true });
  appendFileSync(join(stateDir, "skips.log"), `${new Date().toISOString()}\t${reason}\n`, "utf8");
  writeBaseline(gitState(), countRows());
  emit({ systemMessage: `Nhật ký AI: bỏ qua 1 lần — ${reason}` });
}

// ----------------------------------------------------------------- helpers

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function cleanCells(cells) {
  return cells.map((c) =>
    String(c ?? "")
      .replace(/\r?\n/g, " · ")
      .split("|")
      .join("\\|") // escape Markdown — giu nguyen nghia, khong vo bang
      .trim(),
  );
}

function checkCells(clean, names) {
  const over = clean.findIndex((c) => c.length > MAX_CELL);
  if (over >= 0) {
    fail(
      `Cột "${names[over]}" dài ${clean[over].length} ký tự (tối đa ${MAX_CELL}).\n` +
        `Nhật ký chỉ ghi ĐƯỜNG DẪN + PHẠM VI, KHÔNG dán mã nguồn. Tóm tắt ngắn lại rồi chạy lại.`,
    );
  }
}

/**
 * Code doi ma so dong tang 2 khong tang -> can chan. Cap nhat moc khi da ghi.
 * Co su kien cua luot (tang 1) thi "code doi" = co su kien file/gen SAU moc (git add/commit khong tinh);
 * khong co thi quay ve so hash HEAD + git status nhu cu.
 */
function journalMissing(turnEvents) {
  const cur = gitState();
  const base = readBaseline();
  const rows = countRows();
  if (cur === null) return false; // khong phai git repo -> bo qua
  if (!base) {
    writeBaseline(cur, rows);
    return false;
  }
  const changed = turnEvents
    ? turnEvents.some((e) => (e.ev === "file" || e.ev === "gen") && Date.parse(e.ts) > base.ts)
    : cur !== base.state;
  if (!changed) return false; // khong co thay doi code moi
  if (rows > base.rows) {
    writeBaseline(cur, rows); // da ghi nhat ky
    return false;
  }
  return true;
}

function readStdinJson() {
  try {
    if (process.stdin.isTTY) return {};
    const value = JSON.parse(readFileSync(0, "utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function today() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function monthFile() {
  const d = new Date();
  return join(dir, `${d.getFullYear()}-${pad(d.getMonth() + 1)}.md`);
}

function rel(p) {
  return relative(ctx.main, p).replaceAll("\\", "/");
}

/** Tao file thang + muc ngay hom nay neu chua co. Tra ve duong dan file. */
function ensureTodaySection() {
  const file = monthFile();
  mkdirSync(dir, { recursive: true });
  const d = new Date();
  if (!existsSync(file)) {
    writeFileSync(
      file,
      `# Nhật ký sử dụng AI — ${d.getFullYear()}-${pad(d.getMonth() + 1)}\n\n` +
        `> KHÔNG commit (đã gitignore). Quy tắc + template: \`doc/AI-JOURNAL.md\`.\n`,
      "utf8",
    );
  }
  const text = readFileSync(file, "utf8");
  if (!text.includes(`## ${today()}`)) {
    appendFileSync(file, `\n## ${today()}\n\n${HEADER}\n${SEPARATOR}\n`, "utf8");
  }
  return file;
}

/** Dem so dong du lieu trong moi bang nhat ky (bo header + dong ke). */
function countRows() {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    for (const line of readFileSync(join(dir, name), "utf8").split("\n")) {
      const t = line.trim();
      if (!t.startsWith("|")) continue;
      if (/^\|[\s|:-]*$/.test(t)) continue;
      if (t === HEADER) continue; // khop chinh xac — dong du lieu co the chua ten cot
      n += 1;
    }
  }
  return n;
}

/** Hash trang thai working tree + HEAD. null neu khong phai git repo. */
function gitState() {
  try {
    return createHash("sha1")
      .update(git(["rev-parse", "HEAD"], ctx.top).trim() + "\n" + git(["status", "--porcelain"], ctx.top))
      .digest("hex");
  } catch {
    return null;
  }
}

function readBaseline() {
  try {
    return JSON.parse(readFileSync(baselineFile, "utf8"));
  } catch {
    return null;
  }
}

function writeBaseline(state, rows) {
  mkdirSync(stateDir, { recursive: true });
  writeFileSync(baselineFile, JSON.stringify({ state, rows, ts: Date.now() }), "utf8");
}

function emit(obj) {
  process.stdout.write(JSON.stringify(obj));
}
