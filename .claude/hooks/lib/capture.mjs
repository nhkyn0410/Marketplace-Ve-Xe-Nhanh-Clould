// Chuyển dữ liệu hook (Claude Code hoặc Codex) thành sự kiện nhật ký tầng 1. Không lưu code, không lưu output.
import { resolve } from "node:path";
import { blankLongQuotes, classifyCommand, MAX_INPUT, redact, stripBodies } from "./commands.mjs";
import { excerpt, git, isoLocal, relPath, safeRead, shortId, slash } from "./store.mjs";
import { symbolChanges } from "./symbols.mjs";

const SHELL_TOOLS = new Set(["bash", "powershell", "shell", "exec_command", "local_shell", "unified_exec"]);
const CLAUDE_FILE_TOOLS = new Set(["write", "edit", "multiedit", "notebookedit"]);

/** Trường chung của mọi sự kiện: thời gian, tool, phiên, lượt, agent/subagent, model. */
export function baseEvent(input, tool, now = new Date()) {
  const ev = { ts: isoLocal(now), tool };
  const sid = shortId(input.session_id);
  const turn = shortId(input.prompt_id || input.turn_id);
  if (sid) ev.sid = sid;
  if (turn) ev.turn = turn;
  ev.agent = input.agent_type || "main";
  if (input.agent_id) ev.aid = shortId(input.agent_id);
  if (input.model) ev.model = String(input.model);
  return ev;
}

/** Bỏ file ngoài repo và chính thư mục nhật ký / .git. */
function trackable(rel) {
  return rel != null && rel !== "" && !/^(\.ai-journal|\.git)(\/|$)/.test(rel);
}

function countPatch(structuredPatch) {
  let add = 0;
  let del = 0;
  for (const h of Array.isArray(structuredPatch) ? structuredPatch : []) {
    for (const l of h.lines ?? []) {
      if (l.startsWith("+")) add += 1;
      else if (l.startsWith("-")) del += 1;
    }
  }
  return { add, del };
}

function lineCount(text) {
  return text ? String(text).split(/\r?\n/).length : 0;
}

/** Dựng lại nội dung trước khi sửa từ nội dung sau + các cặp (old, new). */
function reverseEdits(after, edits) {
  if (after == null) return null;
  let text = after;
  for (const e of [...edits].reverse()) {
    if (typeof e.new_string !== "string" || typeof e.old_string !== "string") return null;
    if (!e.new_string) return null;
    if (!text.includes(e.new_string)) return null;
    text = e.replace_all ? text.split(e.new_string).join(e.old_string) : text.replace(e.new_string, () => e.old_string);
  }
  return text;
}

function fileEvent(base, rel, op, before, after, counts) {
  const { sym, need, docs } = symbolChanges(rel, before, after);
  const ev = { ...base, ev: "file", op, path: rel, add: counts.add, del: counts.del };
  if (sym.length) ev.sym = sym;
  // Khong biet noi dung cu (ghi de) -> khong du can cu bat buoc mo ta
  if (need.length && (before != null || op === "create")) ev.need = need;
  if (Object.keys(docs).length) ev.docs = docs;
  return ev;
}

/** Write / Edit / MultiEdit / NotebookEdit của Claude Code. */
function claudeFile(input, base, ctx) {
  const ti = input.tool_input ?? {};
  const tr = input.tool_response && typeof input.tool_response === "object" ? input.tool_response : {};
  const abs = ti.file_path || ti.notebook_path;
  if (!abs) return [];
  const rel = relPath(resolve(ctx.cwd, abs), ctx.top);
  if (!trackable(rel)) return [];
  const name = String(input.tool_name).toLowerCase();
  const after = safeRead(resolve(ctx.cwd, abs));
  let before = typeof tr.originalFile === "string" ? tr.originalFile : null;
  let op = "edit";
  if (name === "write") {
    op = tr.type === "create" ? "create" : "write";
    if (op === "create") before = "";
  } else if (before == null && name === "edit") {
    before = reverseEdits(after, [ti]);
  } else if (before == null && name === "multiedit") {
    before = reverseEdits(after, ti.edits ?? []);
  }
  let counts = countPatch(tr.structuredPatch);
  if (!counts.add && !counts.del) {
    if (op === "create" || op === "write") counts = { add: lineCount(after), del: lineCount(before) };
    else if (name === "edit") counts = { add: lineCount(ti.new_string), del: lineCount(ti.old_string) };
  }
  if (name === "notebookedit") return [{ ...base, ev: "file", op: "edit", path: rel, add: 0, del: 0 }];
  return [fileEvent(base, rel, op, before, after, counts)];
}

/**
 * Tách patch kiểu Codex (`*** Begin Patch` … `*** End Patch`) thành từng file:
 * { op: add|update|delete, path, moveTo?, hunks: [{ old: [], new: [] }], added: [] }.
 */
export function parsePatch(text) {
  const src = String(text ?? "");
  const start = src.indexOf("*** Begin Patch");
  if (start < 0) return [];
  const lines = src.slice(start).split(/\r?\n/);
  const files = [];
  let cur = null;
  let hunk = null;
  for (const line of lines.slice(1)) {
    if (line.startsWith("*** End Patch")) break;
    const head = /^\*\*\* (Add|Update|Delete) File: (.+)$/.exec(line);
    if (head) {
      cur = { op: head[1].toLowerCase(), path: head[2].trim(), hunks: [], added: [], plus: 0, minus: 0 };
      files.push(cur);
      hunk = null;
      continue;
    }
    if (!cur) continue;
    const move = /^\*\*\* Move to: (.+)$/.exec(line);
    if (move) {
      cur.moveTo = move[1].trim();
      continue;
    }
    if (cur.op === "add") {
      if (line.startsWith("+")) cur.added.push(line.slice(1));
      continue;
    }
    if (line.startsWith("@@")) {
      hunk = { old: [], new: [] };
      cur.hunks.push(hunk);
      continue;
    }
    if (line.startsWith("*** End of File")) continue;
    if (!hunk) {
      hunk = { old: [], new: [] };
      cur.hunks.push(hunk);
    }
    const body = line.slice(1);
    if (line.startsWith("+")) {
      hunk.new.push(body);
      cur.plus += 1;
    } else if (line.startsWith("-")) {
      hunk.old.push(body);
      cur.minus += 1;
    } else {
      hunk.old.push(body);
      hunk.new.push(body);
    }
  }
  return files;
}

/** Dựng lại nội dung file trước patch từ nội dung hiện tại + các hunk; null nếu không khớp. */
function beforeFromHunks(after, hunks) {
  if (after == null) return null;
  const eol = after.includes("\r\n") ? "\r\n" : "\n";
  let text = after;
  let cursor = 0;
  for (const h of hunks) {
    const nw = h.new.join(eol);
    const od = h.old.join(eol);
    if (!nw) return null;
    const idx = text.indexOf(nw, cursor);
    if (idx < 0) return null;
    text = text.slice(0, idx) + od + text.slice(idx + nw.length);
    cursor = idx + od.length;
  }
  return text;
}

/** apply_patch của Codex → 1 sự kiện file cho mỗi file trong patch. */
function codexPatch(input, base, ctx) {
  const ti = input.tool_input ?? {};
  const raw = Array.isArray(ti.command)
    ? ti.command.join("\n")
    : typeof ti.command === "string"
      ? ti.command
      : String(ti.patch ?? ti.input ?? "");
  const out = [];
  for (const f of parsePatch(raw)) {
    const target = f.moveTo ?? f.path;
    const rel = relPath(resolve(ctx.cwd, target), ctx.top);
    if (!trackable(rel)) continue;
    if (f.op === "delete") {
      out.push({ ...base, ev: "file", op: "delete", path: rel, add: 0, del: 0 });
      continue;
    }
    const after = safeRead(resolve(ctx.cwd, target));
    if (f.op === "add") {
      out.push(fileEvent(base, rel, "create", "", after ?? f.added.join("\n"), { add: f.added.length, del: 0 }));
      continue;
    }
    const counts = { add: f.plus, del: f.minus };
    const before = beforeFromHunks(after, f.hunks);
    let ev;
    if (before != null) ev = fileEvent(base, rel, "edit", before, after, counts);
    else {
      // Khong dung lai duoc file cu -> chi so sanh trong pham vi cac hunk, khong bat buoc mo ta
      const oldText = f.hunks.map((h) => h.old.join("\n")).join("\n");
      const newText = f.hunks.map((h) => h.new.join("\n")).join("\n");
      ev = fileEvent(base, rel, "edit", oldText, newText, counts);
      delete ev.need;
    }
    if (f.moveTo) ev.from = relPath(resolve(ctx.cwd, f.path), ctx.top);
    out.push(ev);
  }
  return out;
}

function commandOk(input) {
  if (input.hook_event_name === "PostToolUseFailure") return false;
  const tr = input.tool_response;
  if (tr && typeof tr === "object") {
    const code = tr.exit_code ?? tr.exitCode ?? tr.returnCode;
    if (typeof code === "number") return code === 0;
    if (tr.interrupted === true) return false;
  }
  return true;
}

/** Bỏ `cd "<gốc repo>" &&` ở đầu lệnh — chỉ là nhiễu, lệnh vốn chạy trong repo. */
function dropRootCd(command, top) {
  return command.replace(/^\s*cd\s+(?:"([^"]+)"|'([^']+)'|(\S+))\s*(?:&&|;)\s*/i, (all, a, b, c) =>
    slash(a ?? b ?? c).replace(/\/$/, "").toLowerCase() === top.toLowerCase() ? "" : all,
  );
}

function shellCommand(input, base, ctx) {
  const ti = input.tool_input ?? {};
  const full = Array.isArray(ti.command) ? ti.command.join(" ") : String(ti.command ?? ti.cmd ?? "");
  const raw = dropRootCd(full, ctx.top);
  if (!raw.trim()) return [];
  const { cat, pkgs, ext, edit } = classifyCommand(raw);
  const shown = edit ? blankLongQuotes(stripBodies(raw)) : stripBodies(raw);
  const ev = { ...base, ev: "cmd", cat, ok: commandOk(input), cmd: excerpt(redact(shown), 300) };
  if (/^\s*node\s+\S*ai-journal\.mjs\s+(\w+)/.test(raw)) ev.verb = /ai-journal\.mjs\s+(\w+)/.exec(raw)[1];
  if (pkgs.length) ev.pkgs = pkgs;
  if (ext.length) ev.ext = ext;
  if (edit) ev.edit = true;
  if (ti.description) ev.desc = excerpt(redact(ti.description), 120);
  return [ev];
}

/** host + path của URL (bỏ query), đã che token nằm trong path (vd webhook). */
function stripQuery(url) {
  let out;
  try {
    const u = new URL(String(url).slice(0, MAX_INPUT));
    out = `${u.host}${u.pathname}`;
  } catch {
    out = String(url).slice(0, MAX_INPUT).split("?")[0];
  }
  return excerpt(redact(out), 200);
}

function mcpEvent(input, base) {
  const name = String(input.tool_name);
  const body = name.slice("mcp__".length);
  const cut = body.lastIndexOf("__");
  const server = cut > 0 ? body.slice(0, cut) : body;
  const tool = cut > 0 ? body.slice(cut + 2) : "";
  const ev = { ...base, ev: "mcp", server, name: tool, ok: input.hook_event_name !== "PostToolUseFailure" };
  const url = input.tool_input?.url;
  if (typeof url === "string" && /^https?:/i.test(url)) ev.target = stripQuery(url);
  return [ev];
}

/**
 * Chuyển 1 lần gọi hook thành danh sách sự kiện (có thể rỗng).
 * `ctx` = { cwd, top } từ repoContext; `tool` = "claude" | "codex".
 */
export function eventsFromHook(input, tool, ctx, now = new Date()) {
  const base = baseEvent(input, tool, now);
  const hook = input.hook_event_name;
  if (hook === "SessionStart") {
    return [{ ...base, ev: "session", source: input.source ?? "startup", cwd: ctx.top }];
  }
  if (hook === "UserPromptSubmit") {
    const ev = { ...base, ev: "prompt", text: excerpt(redact(String(input.prompt ?? "").slice(0, 1000)), 200) };
    try {
      ev.branch = git(["rev-parse", "--abbrev-ref", "HEAD"], ctx.top).trim();
    } catch {
      // khong phai git repo
    }
    return [ev];
  }
  if (hook === "SubagentStart" || hook === "SubagentStop") {
    return [{ ...base, ev: "agent", phase: hook === "SubagentStart" ? "start" : "stop", type: input.agent_type ?? "?" }];
  }
  if (hook !== "PostToolUse" && hook !== "PostToolUseFailure") return [];

  const name = String(input.tool_name ?? "");
  const lower = name.toLowerCase();
  const ti = input.tool_input && typeof input.tool_input === "object" ? input.tool_input : {};
  const cmdText = Array.isArray(ti.command) ? ti.command.join("\n") : typeof ti.command === "string" ? ti.command : "";
  if (lower === "apply_patch" || cmdText.includes("*** Begin Patch")) return codexPatch(input, base, ctx);
  if (CLAUDE_FILE_TOOLS.has(lower)) {
    if (hook === "PostToolUseFailure") return [];
    return claudeFile(input, base, ctx);
  }
  if (SHELL_TOOLS.has(lower)) return shellCommand(input, base, ctx);
  if (lower === "webfetch" && ti.url) return [{ ...base, ev: "web", kind: "fetch", target: stripQuery(ti.url) }];
  if (lower === "websearch" && ti.query) {
    return [{ ...base, ev: "web", kind: "search", target: excerpt(redact(String(ti.query).slice(0, 1000)), 150) }];
  }
  if (lower.startsWith("mcp__")) return mcpEvent(input, base);
  return [];
}
