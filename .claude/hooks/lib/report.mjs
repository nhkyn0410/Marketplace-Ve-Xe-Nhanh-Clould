// Dựng báo cáo Markdown từ nhật ký tầng 1 (+ dòng khai báo tầng 2, thẻ sổ tay tầng 3).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATEGORY_LABEL, mainSegment } from "./commands.mjs";

const TOOL_LABEL = { claude: "Claude Code", codex: "Codex" };
const FILE_OP = { create: "Tạo file", edit: "Sửa file", write: "Ghi đè file", delete: "Xoá file" };
/** Nhóm lệnh nên có thẻ hướng dẫn trong sổ tay. */
const GUIDE_CATS = new Set(["install", "scaffold", "db", "check", "run", "git", "deploy", "external"]);
const NOTE_COLS = ["Mảng kỹ thuật", "AI sử dụng", "Mục đích", "Phần AI sinh", "Phần SV chỉnh", "Nhận xét"];

function parseList(value) {
  const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|([^,]+)/g;
  let m;
  while ((m = re.exec(inner))) {
    const v = (m[1] ?? m[2] ?? m[3]).trim();
    if (v) out.push(v);
  }
  return out;
}

/** Đọc frontmatter của 1 thẻ sổ tay → { id, title, match[] } (null nếu không có id). */
export function parseCard(text) {
  const lines = String(text).split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return null;
  const card = { match: [] };
  let listKey = null;
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") break;
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && listKey === "match") {
      card.match.push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const kv = /^([A-Za-z_]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    listKey = kv[1];
    if (kv[1] === "match") card.match.push(...(kv[2] ? parseList(kv[2]) : []));
    else card[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return card.id ? card : null;
}

/** Nạp các thẻ `doc/runbook/*.md` của repo. */
export function loadRunbook(top) {
  const dir = join(top, "doc", "runbook");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort()
    .map((f) => ({ ...parseCard(readFileSync(join(dir, f), "utf8")), file: `doc/runbook/${f}` }))
    .filter((c) => c.id);
}

/** Thẻ sổ tay đầu tiên có mẫu `match` khớp lệnh (chuỗi con, hoặc `/regex/`). */
export function matchGuide(cards, cmd) {
  const text = String(cmd).toLowerCase();
  return (
    cards.find((c) =>
      c.match.some((p) => {
        if (p.length > 2 && p.startsWith("/") && p.endsWith("/")) {
          try {
            return new RegExp(p.slice(1, -1), "i").test(cmd);
          } catch {
            return false;
          }
        }
        return text.includes(p.toLowerCase());
      }),
    ) ?? null
  );
}

function cell(text) {
  return String(text ?? "")
    .replace(/\r?\n/g, " ")
    .replaceAll("|", "\\|");
}

function code(text) {
  const t = String(text ?? "").replace(/\r?\n/g, " ");
  const fence = t.includes("`") ? "``" : "`";
  return `${fence}${t.replaceAll("|", "\\|")}${fence}`;
}

function hhmmss(ts) {
  return String(ts).slice(11, 19);
}

function ddmmyyyy(ts) {
  const d = String(ts).slice(0, 10);
  return `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
}

function secondsBetween(a, b) {
  return (Date.parse(b) - Date.parse(a)) / 1000;
}

/** Gán phiên/lượt cho sự kiện khai báo tay (note, ops) và sự kiện `snapshot` không có phiên. */
function attribute(events) {
  const withSid = events.filter((e) => e.sid);
  for (const e of events) {
    if (e.sid) continue;
    if (e.ev === "note" || e.ev === "ops") {
      const verb = e.ev === "note" ? "add" : "ops";
      const link = withSid.find(
        (c) => c.ev === "cmd" && c.verb === verb && c.repo === e.repo && secondsBetween(e.ts, c.ts) >= 0 && secondsBetween(e.ts, c.ts) <= 30,
      );
      const near =
        link ??
        [...withSid].reverse().find((c) => c.repo === e.repo && c.ts <= e.ts && secondsBetween(c.ts, e.ts) <= 7200);
      if (near) {
        for (const k of ["sid", "turn", "agent", "tool", "model"]) if (near[k] !== undefined && e[k] === undefined) e[k] = near[k];
        continue;
      }
    }
    e.group = `${e.tool ?? "?"}:${String(e.ts).slice(0, 16)}`;
  }
}

function turnKey(e) {
  return e.sid ? `${e.repo ?? ""}|${e.sid}|${e.turn ?? "-"}` : `${e.repo ?? ""}|snap|${e.group}`;
}

function formatSymbols(e, descs, key) {
  const items = (e.sym ?? []).map((s) => {
    const sign = s[0];
    const name = s.slice(1);
    const desc = e.docs?.[name] ?? descs.get(`${key}|${e.path}|${name}`);
    let text = `${sign}${name}`;
    if (desc) text += ` — ${desc}`;
    else if (sign === "+" && e.need?.includes(name)) text += " — ⟨thiếu mô tả⟩";
    return cell(text);
  });
  if (items.length > 15) return `${items.slice(0, 15).join("<br>")}<br>… (+${items.length - 15})`;
  return items.join("<br>");
}

function rowFor(e, ctx) {
  const agent = cell(e.aid ? `${e.agent} (${e.aid.slice(0, 4)})` : e.agent ?? "main");
  const time = hhmmss(e.ts);
  if (e.ev === "file") {
    const counts = e.add || e.del ? ` (+${e.add ?? 0}/−${e.del ?? 0})` : "";
    const from = e.from ? ` ← ${code(e.from)}` : "";
    return [time, agent, FILE_OP[e.op] ?? e.op, `${code(e.path)}${from}${counts}`, formatSymbols(e, ctx.descs, ctx.key), ""];
  }
  if (e.ev === "cmd") {
    if (e.cat === "read" || e.cat === "journal") return null; // chi dem / da hien o dong khai bao
    const card = matchGuide(ctx.cards, e.cmd);
    const label = `Lệnh · ${CATEGORY_LABEL[e.cat] ?? e.cat}${e.ok === false ? " ✗" : ""}`;
    const extra = e.pkgs?.length ? `Package: ${cell(e.pkgs.join(", "))}` : "";
    return [time, agent, label, code(e.cmd), extra, card ? card.id : ""];
  }
  if (e.ev === "web") return [time, agent, e.kind === "search" ? "Tìm kiếm web" : "Tra cứu web", cell(e.target), "", ""];
  if (e.ev === "mcp") {
    return [time, agent, `MCP · ${cell(e.server)}${e.ok === false ? " ✗" : ""}`, cell(e.target ? `${e.name} → ${e.target}` : e.name), "", ""];
  }
  if (e.ev === "agent" && e.phase === "start") return [time, "main", "Gọi subagent", code(e.type), "", ""];
  if (e.ev === "gen") {
    return [time, agent, "File đổi ngoài tool sửa file", e.paths.map(code).join("<br>"), `${e.n} file — do lệnh sinh ra hoặc sửa tay`, ""];
  }
  if (e.ev === "ops") return [time, agent, `Yêu cầu làm tay · ${cell(e.area)}`, cell(e.task), "", cell(e.guide ?? "")];
  return null;
}

function normalizePkg(name) {
  const m = /^(@?[^@\s]+)(@.*)?$/.exec(name);
  return m ? m[1] : name;
}

/** Tổng hợp phần mềm bên thứ 3 (package, CLI, MCP, nguồn web) → Map. */
function thirdParty(events) {
  const map = new Map();
  const add = (type, name, e, example) => {
    const key = `${type}|${name}`;
    const cur = map.get(key);
    if (cur) cur.count += 1;
    else map.set(key, { type, name, ts: e.ts, agent: e.agent ?? "main", tool: e.tool, count: 1, example });
  };
  for (const e of events) {
    if (e.ev === "cmd" && e.cat !== "read") {
      for (const p of e.pkgs ?? []) {
        if (!p.startsWith("+")) continue;
        const raw = p.slice(1);
        const inst = /^(winget|choco|scoop|pip3?|pipx|brew|apt(?:-get)?|corepack|cargo|go):(.+)$/.exec(raw);
        if (inst) add(`Phần mềm (${inst[1]})`, inst[2], e, e.cmd);
        else if (/^\s*(fvm\s+)?(flutter|dart)\b/i.test(e.cmd)) add("Package Dart (pub)", normalizePkg(raw), e, e.cmd);
        else add("Package npm", normalizePkg(raw), e, e.cmd);
      }
      for (const x of e.ext ?? []) add("Công cụ / dịch vụ ngoài", x, e, e.cmd);
    }
    if (e.ev === "file" && /(^|\/)(package\.json|pubspec\.yaml)$/.test(e.path ?? "")) {
      const type = e.path.endsWith("pubspec.yaml") ? "Package Dart (pub)" : "Package npm";
      for (const s of e.sym ?? []) if (s.startsWith("+")) add(type, normalizePkg(s.slice(1)), e, `${e.path} (${s.slice(1)})`);
    }
    if (e.ev === "mcp") add("MCP server", e.server, e, e.name);
    if (e.ev === "web" && e.kind === "fetch") add("Nguồn web", String(e.target).split("/")[0], e, e.target);
  }
  return [...map.values()].sort((a, b) => a.ts.localeCompare(b.ts));
}

function table(headers, rows) {
  if (!rows.length) return "_(không có)_\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
    "",
  ].join("\n");
}

/**
 * Dựng báo cáo Markdown.
 * opts: { events (đã gắn `repo` nếu gộp nhiều repo), cards, title, command, repos[] }.
 */
export function renderReport({ events, cards = [], title, command, repos = [] }) {
  const evs = events
    .map((e, i) => ({ ...e, _i: i }))
    .sort((a, b) => String(a.ts).localeCompare(String(b.ts)) || a._i - b._i);
  attribute(evs);

  const descs = new Map();
  for (const e of evs) {
    if (e.ev !== "desc") continue;
    for (const it of e.items ?? []) descs.set(`${turnKey(e)}|${it.path}|${it.name}`, it.text);
  }
  const sessionModel = new Map();
  for (const e of evs) if (e.sid && e.model && !sessionModel.has(e.sid)) sessionModel.set(e.sid, e.model);

  const turns = new Map();
  for (const e of evs) {
    const key = turnKey(e);
    if (!turns.has(key)) turns.set(key, { key, events: [], first: e });
    turns.get(key).events.push(e);
  }

  const multiRepo = repos.length > 1;
  const out = [];
  out.push(`# ${title}`, "");
  out.push(`> Sinh bằng ${code(command)}. **KHÔNG commit** (nhật ký nằm trong \`.ai-journal/\`, đã gitignore).`);
  if (multiRepo) out.push(`> Gộp nhật ký của: ${repos.map(code).join(", ")}.`);
  out.push(
    "> Cột \"Hàm / class\": `+` thêm mới · `~` sửa bên trong · `-` xoá; sau dấu — là mô tả công dụng (lấy từ doc comment trong code).",
    "",
  );

  const prompts = evs.filter((e) => e.ev === "prompt").length;
  const files = evs.filter((e) => e.ev === "file");
  const cmds = evs.filter((e) => e.ev === "cmd");
  const readCount = cmds.filter((e) => e.cat === "read").length;
  const byCat = new Map();
  for (const c of cmds) if (c.cat !== "read" && c.cat !== "journal") byCat.set(c.cat, (byCat.get(c.cat) ?? 0) + 1);
  const subagents = [...new Set(evs.filter((e) => e.ev === "agent" && e.phase === "start").map((e) => e.type))];
  const added = files.reduce((n, e) => n + (e.sym ?? []).filter((s) => s.startsWith("+")).length, 0);
  out.push("## Tổng quan", "");
  out.push(`- Yêu cầu (lượt): **${prompts}** · file tạo/sửa/xoá: **${files.length}** · hàm/class/package thêm mới: **${added}**`);
  out.push(
    `- Lệnh: ${[...byCat].map(([c, n]) => `${CATEGORY_LABEL[c] ?? c} ${n}`).join(" · ") || "—"} · chỉ-đọc ${readCount}`,
  );
  out.push(`- Subagent đã dùng: ${subagents.length ? subagents.map(code).join(", ") : "—"}`);
  out.push(`- Yêu cầu bạn làm tay (ops): **${evs.filter((e) => e.ev === "ops").length}**`, "");

  let lastDate = "";
  for (const turn of turns.values()) {
    const date = ddmmyyyy(turn.first.ts);
    if (date !== lastDate) {
      out.push(`## ${date}`, "");
      lastDate = date;
    }
    const prompt = turn.events.find((e) => e.ev === "prompt");
    const any = turn.events.find((e) => e.tool) ?? turn.first;
    const model = turn.events.find((e) => e.model)?.model ?? sessionModel.get(turn.first.sid);
    const head = [hhmmss(turn.first.ts).slice(0, 5), TOOL_LABEL[any.tool] ?? any.tool ?? "?"];
    if (model) head.push(model);
    if (prompt?.branch) head.push(`nhánh ${code(prompt.branch)}`);
    if (turn.first.sid) head.push(`phiên ${turn.first.sid}`);
    else head.push("chụp bằng `snapshot` (tool không có hook)");
    if (multiRepo && turn.first.repo) head.push(`repo ${code(turn.first.repo)}`);
    out.push(`### ${head.join(" · ")}`, "");
    if (prompt?.text) out.push(`> **Yêu cầu:** “${cell(prompt.text)}”`, "");

    const ctx = { cards, descs, key: turn.key };
    const rows = turn.events.map((e) => rowFor(e, ctx)).filter(Boolean);
    if (rows.length) {
      out.push(
        table(
          ["#", "Giờ", "Agent", "Thao tác", "Đối tượng", "Hàm / class — công dụng", "HD"],
          rows.map((r, i) => [String(i + 1), ...r]),
        ),
      );
    }
    const reads = turn.events.filter((e) => e.ev === "cmd" && e.cat === "read").length;
    if (reads) out.push(`_+${reads} lệnh chỉ-đọc (không liệt kê)._`, "");
    const notes = turn.events.filter((e) => e.ev === "note");
    if (notes.length) {
      out.push("**Nhật ký khai báo (tầng 2):**", "");
      out.push(table(NOTE_COLS, notes.map((n) => (n.cells ?? []).map(cell))));
    }
  }

  out.push("## Phần mềm bên thứ 3", "");
  out.push(
    table(
      ["Tên", "Loại", "Lần đầu", "Agent", "Số lần", "Ví dụ"],
      thirdParty(evs).map((t) => [
        code(t.name),
        t.type,
        `${ddmmyyyy(t.ts)} ${hhmmss(t.ts).slice(0, 5)}`,
        cell(`${TOOL_LABEL[t.tool] ?? t.tool ?? ""} · ${t.agent}`),
        String(t.count),
        code(t.example ?? ""),
      ]),
    ),
  );

  out.push("## Việc AI yêu cầu bạn làm tay", "");
  out.push(
    table(
      ["Thời điểm", "Hạng mục", "Việc cần làm", "HD"],
      evs
        .filter((e) => e.ev === "ops")
        .map((e) => [`${ddmmyyyy(e.ts)} ${hhmmss(e.ts).slice(0, 5)}`, cell(e.area), cell(e.task), cell(e.guide ?? "")]),
    ),
  );

  const missing = new Map();
  for (const c of cmds) {
    if (!GUIDE_CATS.has(c.cat) || matchGuide(cards, c.cmd)) continue;
    const main = mainSegment(c.cmd);
    const key = `${c.cat}|${main.split(/\s+/).slice(0, 2).join(" ")}`;
    const cur = missing.get(key);
    if (cur) cur.count += 1;
    else missing.set(key, { cat: c.cat, example: main, count: 1 });
  }
  out.push("## Thao tác chưa có hướng dẫn trong sổ tay (`doc/runbook/`)", "");
  out.push(
    table(
      ["Nhóm", "Lệnh ví dụ", "Số lần"],
      [...missing.values()].map((m) => [CATEGORY_LABEL[m.cat] ?? m.cat, code(m.example), String(m.count)]),
    ),
  );

  const shellEdits = cmds.filter((c) => c.edit);
  out.push("## Sửa file bằng lệnh shell (nên dùng Write/Edit để nhật ký lấy được tên hàm)", "");
  out.push(
    table(
      ["Thời điểm", "Agent", "Lệnh"],
      shellEdits.map((c) => [`${ddmmyyyy(c.ts)} ${hhmmss(c.ts).slice(0, 5)}`, cell(c.agent), code(c.cmd)]),
    ),
  );
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
