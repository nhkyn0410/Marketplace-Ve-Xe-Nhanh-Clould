// Nơi lưu nhật ký hoạt động (tầng 1) + tiện ích git/thời gian dùng chung. Quy tắc: doc/AI-JOURNAL.md
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";

/** Chạy git trong `cwd`, trả stdout (ném lỗi nếu git thất bại). */
export function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
    // Khong giu index.lock -> khong lam hong `git commit` chay cung luc tu IDE
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
}

/**
 * Xác định worktree đang làm việc và thư mục nhật ký. Nhật ký luôn nằm ở checkout chính
 * (kể cả khi phiên chạy trong git worktree) để không mất khi xoá worktree.
 */
export function repoContext(cwd) {
  let top = cwd;
  let main = cwd;
  let isGit = false;
  try {
    const [t, common] = git(
      ["rev-parse", "--show-toplevel", "--path-format=absolute", "--git-common-dir"],
      cwd,
    )
      .trim()
      .split(/\r?\n/);
    top = t;
    main = basename(common) === ".git" ? dirname(common) : t;
    isGit = true;
  } catch {
    // khong phai git repo -> dung cwd
  }
  return { cwd, top: slash(top), main: slash(main), dir: join(main, ".ai-journal"), isGit };
}

/** Đổi `\` thành `/` cho đường dẫn. */
export function slash(p) {
  return String(p).replaceAll("\\", "/");
}

/** Đường dẫn tương đối (dấu `/`) so với `top`; null nếu nằm ngoài repo. */
export function relPath(abs, top) {
  const a = slash(abs);
  const t = slash(top).replace(/\/$/, "");
  const win = process.platform === "win32";
  const [ca, ct] = win ? [a.toLowerCase(), t.toLowerCase()] : [a, t];
  if (ca === ct) return "";
  if (!ca.startsWith(`${ct}/`)) return null;
  return a.slice(t.length + 1);
}

/** Mã băm ngắn — dùng đặt tên file trạng thái theo worktree. */
export function shortHash(text) {
  return createHash("sha1").update(String(text)).digest("hex").slice(0, 10);
}

/** 8 ký tự đầu của id phiên / lượt (đủ phân biệt, đỡ dài nhật ký). */
export function shortId(id) {
  return id ? String(id).slice(0, 8) : undefined;
}

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

/** Thời điểm theo giờ máy, dạng ISO có múi giờ (vd `2026-09-25T10:03:12.345+07:00`). */
export function isoLocal(d = new Date()) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** Tên file nhật ký hoạt động của tháng chứa `ts` (vd `2026-09.jsonl`). */
export function monthKey(ts) {
  return String(ts).slice(0, 7);
}

/** Ghi thêm các sự kiện vào file JSONL của tháng — chỉ append, không bao giờ sửa dòng cũ. */
export function appendEvents(dir, events) {
  if (!events.length) return;
  const byMonth = new Map();
  for (const ev of events) {
    const key = monthKey(ev.ts);
    byMonth.set(key, `${byMonth.get(key) ?? ""}${JSON.stringify(ev)}\n`);
  }
  const act = join(dir, "activity");
  mkdirSync(act, { recursive: true });
  for (const [key, text] of byMonth) appendFileSync(join(act, `${key}.jsonl`), text, "utf8");
}

/** Đọc sự kiện của 1 tháng (`YYYY-MM`) hoặc tất cả (`all`); bỏ qua dòng hỏng. */
export function readEvents(dir, month = "all") {
  const act = join(dir, "activity");
  if (!existsSync(act)) return [];
  const files = readdirSync(act)
    .filter((f) => f.endsWith(".jsonl") && (month === "all" || f === `${month}.jsonl`))
    .sort();
  const out = [];
  for (const f of files) {
    for (const line of readFileSync(join(act, f), "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        out.push(JSON.parse(line));
      } catch {
        // dong hong (ghi dang do) -> bo qua
      }
    }
  }
  return out;
}

/** Đọc file trạng thái JSON trong `.state/`; null nếu chưa có hoặc hỏng. */
export function readState(dir, name) {
  try {
    return JSON.parse(readFileSync(join(dir, ".state", name), "utf8"));
  } catch {
    return null;
  }
}

/** Ghi đè file trạng thái JSON trong `.state/`. */
export function writeState(dir, name, value) {
  mkdirSync(join(dir, ".state"), { recursive: true });
  writeFileSync(join(dir, ".state", name), JSON.stringify(value), "utf8");
}

/** Đọc file văn bản; null nếu không đọc được (đã xoá, là thư mục…). */
export function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** Cắt chuỗi về một dòng, tối đa `max` ký tự (thêm `…` nếu bị cắt). */
export function excerpt(text, max) {
  const one = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return one.length > max ? `${one.slice(0, max - 1)}…` : one;
}
