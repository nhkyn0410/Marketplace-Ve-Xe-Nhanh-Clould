// Đối chiếu working tree: tìm file đổi mà không qua tool sửa file (do lệnh sinh ra / người sửa tay),
// chụp lại thay đổi cho tool không có hook (`snapshot`), kiểm tra mô tả hàm/class cuối lượt.
import { statSync } from "node:fs";
import { join } from "node:path";
import { git, isoLocal, readEvents, readState, safeRead, shortHash, writeState } from "./store.mjs";
import { docsInFile, symbolChanges } from "./symbols.mjs";

function signature(top, path, xy) {
  try {
    const st = statSync(join(top, path));
    return `${xy}|${Math.round(st.mtimeMs)}|${st.size}`;
  } catch {
    return `${xy}|deleted`;
  }
}

function mtimeOf(sig) {
  return sig ? sig.split("|")[1] : undefined;
}

/** Phần so sánh của chữ ký (mtime|size) — bỏ mã trạng thái git để `git add` không bị tính là đổi file. */
function core(sig) {
  return sig ? sig.slice(sig.indexOf("|") + 1) : undefined;
}

/** Khoá so sánh đường dẫn: Windows không phân biệt hoa thường. */
function pathKey(p) {
  return process.platform === "win32" ? p.toLowerCase() : p;
}

/** Ảnh chụp working tree: { head, files: { path: "XY|mtime|size" } } (chỉ file khác HEAD). */
export function treeSnapshot(top) {
  let head = null;
  try {
    head = git(["rev-parse", "HEAD"], top).trim();
  } catch {
    // repo chua co commit
  }
  const parts = git(["status", "--porcelain=v1", "-z", "-uall"], top).split("\0");
  const files = {};
  for (let i = 0; i < parts.length; i += 1) {
    const entry = parts[i];
    if (!entry) continue;
    const xy = entry.slice(0, 2);
    const path = entry.slice(3);
    if (xy[0] === "R" || xy[0] === "C") i += 1; // phan tu tiep theo la ten cu
    files[path] = signature(top, path, xy);
  }
  return { head, files };
}

function opFromXY(xy) {
  if (xy.includes("D")) return "delete";
  if (xy === "??" || xy.includes("A")) return "create";
  return "edit";
}

/** Các file đổi giữa 2 ảnh chụp (kể cả file đã commit trong khoảng đó) → Map(path → op). */
export function changedSince(prev, cur, top) {
  const out = new Map();
  for (const [path, sig] of Object.entries(cur.files)) {
    if (core(prev.files?.[path]) !== core(sig)) out.set(path, opFromXY(sig.slice(0, 2)));
  }
  if (prev.head && cur.head && prev.head !== cur.head) {
    let diff = "";
    try {
      diff = git(["diff", "--name-status", "-z", prev.head, cur.head], top);
    } catch {
      // head cu khong con (rebase/xoa nhanh)
    }
    const parts = diff.split("\0").filter(Boolean);
    for (let i = 0; i < parts.length; ) {
      const status = parts[i];
      const rename = status.startsWith("R") || status.startsWith("C");
      const path = rename ? parts[i + 2] : parts[i + 1];
      i += rename ? 3 : 2;
      if (!path || cur.files[path] || out.has(path)) continue;
      const now = signature(top, path, "  ");
      if (mtimeOf(prev.files?.[path]) === mtimeOf(now)) continue; // da thay o lan truoc
      out.set(path, status[0] === "A" || rename ? "create" : status[0] === "D" ? "delete" : "edit");
    }
  }
  return out;
}

/** Gộp danh sách đường dẫn theo thư mục khi quá dài (vd `packages/x/src/** (48 file)`). */
export function groupPaths(paths, max = 10) {
  if (paths.length <= max) return paths;
  const groups = new Map();
  for (const p of paths) {
    const seg = p.split("/");
    const key = seg.length > 3 ? `${seg.slice(0, 3).join("/")}/**` : seg.length > 1 ? `${seg.slice(0, -1).join("/")}/*` : p;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  return [...groups].map(([key, list]) => (list.length === 1 ? list[0] : `${key} (${list.length} file)`));
}

/** Sự kiện ghi SAU mốc `ts` (mốc được lưu cùng ts với sự kiện của lần trước → phải so `>`). */
function eventsSince(dir, ts) {
  const months = [...new Set([ts.slice(0, 7), isoLocal().slice(0, 7)])];
  return months.flatMap((m) => readEvents(dir, m)).filter((e) => e.ts > ts);
}

function stateName(top) {
  return `tree-${shortHash(top.toLowerCase())}.json`;
}

/**
 * Chụp working tree, so với lần chụp trước → các file đổi mà CHƯA có sự kiện `file` nào ghi.
 * Trả { changed: [[path, op]], since } hoặc null (lần chụp đầu / không có gì mới).
 */
export function unrecordedChanges(ctx, nowTs) {
  const cur = treeSnapshot(ctx.top);
  const name = stateName(ctx.top);
  const prev = readState(ctx.dir, name);
  writeState(ctx.dir, name, { ...cur, ts: nowTs });
  if (!prev) return null;
  const recorded = new Set();
  for (const e of eventsSince(ctx.dir, prev.ts)) {
    if (e.ev !== "file" && e.ev !== "gen") continue;
    for (const p of [e.path, e.from, ...(e.raw ?? [])]) if (p) recorded.add(pathKey(p));
  }
  const changed = [...changedSince(prev, cur, ctx.top)].filter(
    ([p]) => !recorded.has(pathKey(p)) && !/^(\.ai-journal|\.git)(\/|$)/.test(p),
  );
  return changed.length ? { changed, since: prev.ts } : null;
}

/** Sự kiện `gen`: file đổi ngoài tool sửa file trong lượt (lệnh sinh ra hoặc người sửa tay). */
export function genEvent(base, changed) {
  const paths = changed.map(([p]) => p);
  const shown = groupPaths(changed.map(([p, op]) => (op === "delete" ? `${p} (xoá)` : p)));
  const ev = { ...base, ev: "gen", n: changed.length, paths: shown };
  if (paths.length <= 200) ev.raw = paths;
  return ev;
}

/** Sự kiện `file` cho tool không có hook: so file hiện tại với bản ở HEAD, xếp theo giờ sửa. */
export function snapshotEvents(ctx, base, changed) {
  const withTime = changed.map(([path, op]) => {
    let mtime = 0;
    try {
      mtime = statSync(join(ctx.top, path)).mtimeMs;
    } catch {
      // da xoa
    }
    return { path, op, mtime };
  });
  withTime.sort((a, b) => a.mtime - b.mtime);
  return withTime.map(({ path, op }) => {
    if (op === "delete") return { ...base, ev: "file", op, path, add: 0, del: 0 };
    let before = "";
    if (op !== "create") {
      try {
        before = git(["show", `HEAD:${path}`], ctx.top);
      } catch {
        before = null;
      }
    }
    const after = safeRead(join(ctx.top, path));
    const { sym, need, docs } = symbolChanges(path, before, after);
    const ev = { ...base, ev: "file", op, path, add: 0, del: 0 };
    if (sym.length) ev.sym = sym;
    if (need.length && before != null) ev.need = need;
    if (Object.keys(docs).length) ev.docs = docs;
    return ev;
  });
}

/**
 * Kiểm tra mô tả (doc comment) của các hàm/class mới trong lượt, đọc lại file ở trạng thái cuối lượt.
 * Trả { found: [{path, name, text}] (mô tả bổ sung sau), missing: ["path → Tên"] }.
 */
export function checkDocs(ctx, events) {
  const want = new Map();
  for (const e of events) {
    if (e.ev !== "file" || !e.need?.length) continue;
    for (const n of e.need) {
      if (e.docs?.[n]) continue;
      if (!want.has(e.path)) want.set(e.path, new Set());
      want.get(e.path).add(n);
    }
  }
  const found = [];
  const missing = [];
  for (const [path, names] of want) {
    const docs = docsInFile(path, safeRead(join(ctx.top, path)), [...names]);
    for (const n of names) {
      if (!(n in docs)) continue; // da bi xoa / doi ten sau do
      if (docs[n]) found.push({ path, name: n, text: docs[n] });
      else missing.push(`${path} → ${n}`);
    }
  }
  return { found, missing };
}
