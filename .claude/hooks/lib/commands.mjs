// Che secret + phân nhóm lệnh shell (bash / PowerShell) cho nhật ký — không lưu output của lệnh.

const SECRET_NAME = /(pass(word|wd)?|pwd|secret|token|api[_-]?key|access[_-]?key|private[_-]?key|credential|auth|cookie|session|dsn|database_url|_url|_uri)/i;

/** Che secret trong 1 chuỗi (lệnh, trích prompt) — best-effort, không thay được kỷ luật không đưa secret vào lệnh. */
export function redact(text) {
  let s = String(text ?? "").slice(0, MAX_INPUT);
  // URL co user:pass@ (lap co gioi han — tranh backtracking bac 2 tren chuoi dai)
  s = s.replace(/([a-z][a-z0-9+.-]{0,20}:\/\/)[^\s/:@'"]{1,200}:[^\s/@'"]{1,200}@/gi, "$1***:***@");
  // Authorization: Bearer xxx
  s = s.replace(/\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi, "$1 ***");
  // $env:NAME = "value" | export NAME=value | set NAME=value | NAME=value (ten nhay cam)
  s = s.replace(
    /(\$env:|\bexport\s+|\bset\s+|\b)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)("[^"]*"|'[^']*'|[^\s;&|]+)/g,
    (all, pre, name, eq) => (SECRET_NAME.test(name) ? `${pre}${name}${eq}***` : all),
  );
  // --password xxx | --token=xxx | -p xxx (sau ten nhay cam)
  s = s.replace(
    /(--?[A-Za-z-]{0,40}(?:pass|secret|token|key|auth)[A-Za-z-]{0,40})(\s+|=)("[^"]*"|'[^']*'|[^\s;&|]+)/gi,
    "$1$2***",
  );
  // key: value / key=value trong JSON / header
  s = s.replace(
    /(["']?(?:password|passwd|secret|token|api[_-]?key|authorization|client[_-]?secret)["']?\s*[:=]\s*)(?!(?:bearer|basic)\s)("[^"]*"|'[^']*'|[^\s,;&|}]+)/gi,
    "$1***",
  );
  // Chuoi ngau nhien dai (key, JWT, hex) -> *** ; giu ten migration kieu 20260922010000_add_x
  s = s.replace(/[A-Za-z0-9_+=-]{32,}/g, (tok) => {
    const hex = /^[0-9a-f]+$/i.test(tok) && /[0-9]/.test(tok) && /[a-f]/i.test(tok);
    const mixed = /[0-9]/.test(tok) && /[a-z]/.test(tok) && /[A-Z]/.test(tok);
    return hex || mixed ? "***" : tok;
  });
  return s;
}

/**
 * Bỏ phần thân mã nhúng trong lệnh (heredoc, here-string PowerShell, `node -e "…"`) —
 * nhật ký chỉ ghi lệnh, không ghi code.
 */
export function stripBodies(command) {
  return String(command ?? "")
    .slice(0, MAX_INPUT)
    .replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?(?:\n\s*\2\b|$)/g, "<<$2 …") // thieu dong ket thuc -> bo toi het
    .replace(/@(['"])\r?\n[\s\S]*?(?:\r?\n\1@|$)/g, "@$1…$1@")
    .replace(/(\s-(?:e|c|p|-eval|-print|Command)(?:\s+|=))("(?:\\.|[^"\\])*"|'[^']*')/g, '$1"…"');
}

/** Giới hạn độ dài đầu vào trước khi chạy regex (nhật ký chỉ lưu 300 ký tự). */
export const MAX_INPUT = 4000;

/** Lệnh ghi file bằng shell: che chuỗi trong nháy dài (thường là nội dung code bị ghi ra file). */
export function blankLongQuotes(command) {
  return String(command).replace(/"(?:\\.|[^"\\]){40,}"|'[^']{40,}'/g, '"…"');
}

/** Đoạn lệnh chính: bỏ các đoạn `cd …` / gán biến ở đầu (dùng để gom nhóm lệnh trong báo cáo). */
export function mainSegment(command) {
  const parts = segments(stripBodies(command));
  const main = parts.find((p) => !/^(cd|set-location|sl|pushd)\s/i.test(p) && !/^(\$env:)?[A-Za-z_][A-Za-z0-9_]*\s*=/.test(p));
  return main ?? parts[0] ?? "";
}

/** Tách lệnh ghép thành các đoạn (&&, ||, ;, |, xuống dòng). */
function segments(cmd) {
  return String(cmd)
    .split(/\s*(?:&&|\|\||;|\||\r?\n)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Tách token kiểu shell đơn giản (giữ chuỗi trong nháy). */
function tokens(seg) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(seg))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

const PRIORITY = [
  "journal", "deploy", "install", "scaffold", "db", "check", "run", "git", "external", "file", "other", "read",
];

const READ_CMDS = new Set([
  "ls", "dir", "cat", "type", "head", "tail", "less", "more", "grep", "rg", "find", "wc", "sort", "uniq",
  "echo", "printf", "pwd", "cd", "which", "where", "whoami", "date", "env", "printenv", "stat", "file", "du",
  "df", "tree", "jq", "awk", "diff", "cmp", "sleep", "true", "false", "exit", "test", "basename", "dirname",
  "realpath", "readlink", "column", "cut", "tr", "xargs", "nl", "od", "xxd", "sha1sum", "sha256sum", "md5sum",
  "get-childitem", "gci", "get-content", "gc", "select-string", "sls", "test-path", "get-command", "gcm",
  "get-item", "gi", "get-location", "resolve-path", "measure-object", "where-object", "foreach-object",
  "select-object", "sort-object", "format-table", "format-list", "write-output", "write-host", "get-date",
  "get-process", "start-sleep", "set-location", "sl", "get-itemproperty", "get-filehash", "out-string",
  "join-path", "split-path", "group-object", "convertfrom-json", "convertto-json", "out-null", "%", "?",
]);
const FILE_CMDS = new Set([
  "rm", "rmdir", "del", "mv", "cp", "mkdir", "touch", "ln", "chmod", "chown", "remove-item", "ri",
  "move-item", "mi", "copy-item", "cpi", "new-item", "ni", "rename-item", "rni", "set-content", "sc",
  "add-content", "ac", "out-file", "clear-content", "tee", "tee-object", "unzip", "tar", "expand-archive",
  "compress-archive", "sed", "perl",
]);
const IN_PLACE_EDIT = new Set(["set-content", "sc", "add-content", "ac", "out-file", "tee", "tee-object", "clear-content"]);
const INSTALLERS = new Set(["winget", "choco", "scoop", "pip", "pip3", "pipx", "brew", "apt", "apt-get", "corepack", "cargo", "go"]);
const EXTERNAL = new Set([
  "gh", "supabase", "render", "vercel", "fly", "flyctl", "firebase", "flutterfire", "stripe", "upstash", "wrangler",
  "railway", "heroku", "aws", "gcloud", "az", "codemagic", "sentry-cli", "openssl", "ssh", "scp", "curl", "wget",
  "invoke-webrequest", "iwr", "invoke-restmethod", "irm", "http", "ngrok", "cloudflared", "docker", "podman",
  "resend", "code", "cursor",
]);

function scriptCategory(name) {
  const n = name.toLowerCase();
  if (/deploy|release|publish/.test(n)) return "deploy";
  if (/prisma|migrat|^db[:-]|seed|studio/.test(n)) return "db";
  if (/^gen|:gen|generate|codegen|openapi/.test(n)) return "scaffold";
  if (/test|lint|typecheck|tsc|build|format|check|analy[sz]e|e2e|vitest|coverage/.test(n)) return "check";
  if (/^dev$|start|serve|preview|watch/.test(n)) return "run";
  return "other";
}

function stripOpts(args, withValue) {
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (withValue.has(a)) {
      i += 1;
      continue;
    }
    if (a.startsWith("-")) continue;
    out.push(a);
  }
  return out;
}

function pkgsFrom(list, sign = "+") {
  return list.filter((p) => p && !p.startsWith("-") && !p.includes("=")).map((p) => `${sign}${p}`);
}

/** Phân nhóm 1 đoạn lệnh → { cat, pkgs?, ext?, edit? }. */
function classifySegment(seg) {
  const tk = tokens(seg).filter((t) => !/^\$env:/i.test(t) || !t.includes("="));
  while (tk.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tk[0])) tk.shift(); // FOO=bar cmd
  if (!tk.length) return { cat: "read" };
  if (tk[0] === "&" || tk[0] === "call") tk.shift();
  if (!tk.length) return { cat: "read" };
  const first = tk[0].split(/[\\/]/).pop().toLowerCase().replace(/\.(exe|cmd|bat|ps1)$/, "");
  const args = tk.slice(1);
  const lower = args.map((a) => a.toLowerCase());
  const redirect = /(?<![0-9&=-])>>?\s*(?!&|\s*(?:\/dev\/null|\$null|nul)\b)\S/i.test(seg);

  if (/^\$env:/i.test(tk[0])) return { cat: "read" }; // gan bien moi truong
  if (first === "node" && args.some((a) => /ai-journal\.mjs$/.test(a))) return { cat: "journal" };
  if (first === "node" && (lower.includes("--test") || lower.includes("--check"))) return { cat: "check" };
  if (lower.includes("--version") || lower[0] === "-v" || lower[0] === "version") return { cat: "read" };

  if (first === "git") {
    const rest = stripOpts(args, new Set(["-C", "-c"]));
    const sub = (rest[0] || "").toLowerCase();
    if (sub === "push") return { cat: "deploy" };
    const readSubs = [
      "status", "log", "diff", "show", "rev-parse", "ls-files", "blame", "grep", "describe", "cat-file",
      "merge-base", "reflog", "shortlog", "ls-remote", "rev-list", "name-rev", "for-each-ref", "check-ignore",
    ];
    if (readSubs.includes(sub)) return { cat: "read" };
    if (sub === "branch" && !args.some((a) => /^-(d|D|m|M|c|C)$|^--(delete|move|copy)$/.test(a)) && rest.length <= 1)
      return { cat: "read" };
    if (sub === "remote" && (rest.length === 1 || rest[1] === "-v" || lower.includes("-v"))) return { cat: "read" };
    if (sub === "config" && (lower.includes("--get") || lower.includes("--list") || lower.includes("-l")))
      return { cat: "read" };
    if (sub === "stash" && ["list", "show"].includes((rest[1] || "").toLowerCase())) return { cat: "read" };
    return { cat: "git" };
  }
  if (first === "gh") {
    const [a, b] = lower;
    if ((a === "pr" && ["create", "merge"].includes(b)) || a === "release" || (a === "workflow" && b === "run"))
      return { cat: "deploy", ext: "gh" };
    return { cat: "external", ext: "gh" };
  }
  if (["pnpm", "npm", "yarn", "bun"].includes(first)) {
    const rest = stripOpts(args, new Set(["--filter", "-F", "-C", "--dir", "--prefix", "-w", "--workspace"]));
    const sub = (rest[0] || "install").toLowerCase();
    if (["add", "install", "i", "ci", "update", "up", "upgrade", "link", "prune", "dedupe"].includes(sub))
      return { cat: "install", pkgs: pkgsFrom(rest.slice(1)) };
    if (["remove", "rm", "uninstall", "un", "unlink"].includes(sub))
      return { cat: "install", pkgs: pkgsFrom(rest.slice(1), "-") };
    if (["create", "init"].includes(sub)) return { cat: "scaffold", pkgs: pkgsFrom(rest.slice(1, 2)) };
    if (["dlx", "exec", "x", "npx"].includes(sub)) {
      const inner = classifySegment(rest.slice(1).join(" "));
      if (inner.cat !== "other" && inner.cat !== "read") return inner;
      return sub === "dlx" || sub === "x" ? { cat: "external", pkgs: pkgsFrom(rest.slice(1, 2)) } : inner;
    }
    if (sub === "turbo") return { cat: scriptCategory((rest[1] === "run" ? rest[2] : rest[1]) || "") };
    if (["outdated", "ls", "list", "why", "view", "info", "audit", "config", "root", "bin", "store"].includes(sub))
      return { cat: "read" };
    if (sub === "publish") return { cat: "deploy" };
    const script = sub === "run" || sub === "run-script" ? rest[1] || "" : sub;
    return { cat: scriptCategory(script) };
  }
  if (first === "npx" || first === "bunx") {
    const rest = stripOpts(args, new Set(["-p", "--package"]));
    const inner = classifySegment(rest.join(" "));
    if (inner.cat !== "other" && inner.cat !== "read") return inner;
    return { cat: "external", pkgs: pkgsFrom(rest.slice(0, 1)) };
  }
  if (first === "turbo") return { cat: scriptCategory((lower[0] === "run" ? lower[1] : lower[0]) || "") };
  if (/^(shadcn|create-)/.test(first)) return { cat: "scaffold", pkgs: pkgsFrom([tk[0]]) };
  if (first === "prisma") return { cat: lower[0] === "init" ? "scaffold" : "db" };
  if (["psql", "mongosh", "mongo", "redis-cli", "pg_dump", "pg_restore"].includes(first)) return { cat: "db" };
  if (["vitest", "jest", "tsc", "eslint", "prettier", "playwright", "maestro", "biome"].includes(first))
    return { cat: "check" };
  if (first === "nest") return { cat: ["g", "generate", "new", "n"].includes(lower[0]) ? "scaffold" : scriptCategory(lower[0] || "") };
  if (first === "fvm") {
    if (["flutter", "dart"].includes(lower[0])) return classifySegment(args.join(" "));
    return { cat: ["list", "releases", "doctor"].includes(lower[0]) ? "read" : "install", pkgs: pkgsFrom(["install", "use"].includes(lower[0]) ? [`flutter@${args[1] ?? ""}`] : []) };
  }
  if (first === "flutter" || first === "dart") {
    const [a, b] = lower;
    if (a === "create") return { cat: "scaffold" };
    if (a === "pub") {
      if (["add", "remove", "get", "upgrade", "downgrade"].includes(b))
        return { cat: "install", pkgs: pkgsFrom(args.slice(2), b === "remove" ? "-" : "+") };
      if (b === "global") return { cat: "install", pkgs: pkgsFrom(args.slice(3)) };
      return { cat: "read" };
    }
    if (a === "run" && lower.includes("build_runner")) return { cat: "scaffold" };
    if (["test", "analyze", "format", "fix"].includes(a)) return { cat: "check" };
    if (a === "build") return { cat: "deploy" };
    if (["run", "attach", "drive"].includes(a)) return { cat: "run" };
    if (["doctor", "devices", "emulators", "config", "channel"].includes(a) && !b) return { cat: "read" };
    if (a === "upgrade") return { cat: "install", pkgs: [`+${first}`] };
    if (a === "clean") return { cat: "file" };
    return { cat: "other" };
  }
  if (first === "docker" || first === "podman") {
    const words = lower.filter((w) => !w.startsWith("-"));
    if (words.includes("push")) return { cat: "deploy", ext: first };
    if (["ps", "images", "logs", "inspect", "info", "version", "stats"].includes(words.at(-1)) || words.includes("ps") || words.includes("logs"))
      return { cat: "read" };
    if (words[0] === "compose" || ["run", "start", "stop", "restart", "exec", "rm", "up", "down"].includes(words[0]))
      return { cat: "run", ext: first };
    return { cat: "external", ext: first };
  }
  if (INSTALLERS.has(first)) {
    const rest = stripOpts(args, new Set(["--id", "-e", "--source", "-s"]));
    const sub = (rest[0] || "").toLowerCase();
    if (["list", "search", "show", "info", "freeze"].includes(sub)) return { cat: "read" };
    const sign = ["uninstall", "remove"].includes(sub) ? "-" : "+";
    const idArg = args.indexOf("--id");
    const names = idArg >= 0 ? [args[idArg + 1]] : rest.slice(1);
    return { cat: "install", pkgs: pkgsFrom(names, sign).map((p) => `${p[0]}${first}:${p.slice(1)}`) };
  }
  if (EXTERNAL.has(first)) {
    const url = args.find((a) => /^https?:\/\//i.test(a));
    let ext = first;
    if (url) {
      try {
        ext = `${first} ${new URL(url).host}`;
      } catch {
        // URL hong -> giu ten lenh
      }
    }
    if (lower.includes("deploy") || (first === "vercel" && lower.includes("--prod"))) return { cat: "deploy", ext };
    return { cat: "external", ext };
  }
  if (FILE_CMDS.has(first)) {
    const edit =
      IN_PLACE_EDIT.has(first) ||
      ((first === "sed" || first === "perl") && args.some((a) => /^-[a-z]*i/.test(a))) ||
      redirect;
    if ((first === "sed" || first === "perl") && !edit) return { cat: "read" };
    return { cat: "file", edit };
  }
  if (READ_CMDS.has(first)) return redirect ? { cat: "file", edit: true } : { cat: "read" };
  if (redirect) return { cat: "file", edit: true };
  return { cat: "other" };
}

/**
 * Phân nhóm 1 lệnh (có thể ghép nhiều đoạn) → { cat, pkgs, ext, edit }.
 * cat ∈ journal · deploy · install · scaffold · db · check · run · git · external · file · other · read.
 */
export function classifyCommand(command) {
  const parts = segments(stripBodies(command)).map(classifySegment);
  if (!parts.length) return { cat: "read", pkgs: [], ext: [], edit: false };
  const cat = parts.map((p) => p.cat).sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b))[0];
  return {
    cat,
    pkgs: [...new Set(parts.flatMap((p) => p.pkgs ?? []))],
    ext: [...new Set(parts.map((p) => p.ext).filter(Boolean))],
    edit: parts.some((p) => p.edit),
  };
}

/** Nhãn tiếng Việt cho từng nhóm lệnh (dùng trong báo cáo). */
export const CATEGORY_LABEL = {
  journal: "Nhật ký",
  deploy: "Deploy / phát hành",
  install: "Cài / gỡ package",
  scaffold: "Sinh khung / code bằng công cụ",
  db: "Cơ sở dữ liệu",
  check: "Kiểm tra / build",
  run: "Chạy dịch vụ",
  git: "Git",
  external: "Công cụ / dịch vụ ngoài",
  file: "Thao tác file",
  other: "Lệnh khác",
  read: "Chỉ đọc",
};
