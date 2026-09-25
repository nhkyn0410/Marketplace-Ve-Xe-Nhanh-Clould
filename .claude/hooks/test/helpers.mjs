// Tiện ích test: repo git tạm + chạy script nhật ký như hook thật.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "..", "ai-journal.mjs");

/** Tạo repo git tạm có sẵn 1 commit và `.gitignore` bỏ qua `.ai-journal/`. */
export function tempRepo() {
  const root = mkdtempSync(join(tmpdir(), "aij-"));
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "ignore" });
  git("init", "-q", "-b", "main");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  git("config", "core.autocrlf", "false");
  writeFileSync(join(root, ".gitignore"), "/.ai-journal/\n");
  git("add", ".");
  git("commit", "-q", "-m", "init");
  return root;
}

/** Ghi file (tự tạo thư mục cha). */
export function put(root, rel, text) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), text);
}

/** Chạy script như hook/CLI; trả { status, stdout, stderr }. Bỏ CLAUDE_PROJECT_DIR của phiên đang chạy test. */
export function run(root, args, stdin) {
  const env = { ...process.env };
  delete env.CLAUDE_PROJECT_DIR;
  const res = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: root,
    env,
    input: stdin === undefined ? "" : typeof stdin === "string" ? stdin : JSON.stringify({ cwd: root, ...stdin }),
    encoding: "utf8",
  });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

/** Đọc mọi sự kiện tầng 1 của repo tạm. */
export function events(root) {
  const dir = join(root, ".ai-journal", "activity");
  let files = [];
  try {
    files = readdirSync(dir);
  } catch {
    return [];
  }
  return files.flatMap((f) =>
    readFileSync(join(dir, f), "utf8")
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l)),
  );
}
