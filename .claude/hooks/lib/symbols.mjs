// Trích TÊN hàm / class / model… và dòng mô tả (doc comment) từ mã nguồn — không lưu code.
// Heuristic theo dòng + thụt lề (code đã qua Prettier / dart format), không phải parser đầy đủ.

const TS_KEYWORDS = new Set([
  "if", "for", "while", "switch", "catch", "return", "super", "function", "constructor",
  "do", "else", "try", "new", "typeof", "await", "yield", "with",
]);
const DART_KEYWORDS = new Set([
  "if", "for", "while", "switch", "return", "assert", "super", "this", "catch", "await",
  "throw", "new", "do", "else", "try", "import", "export", "part", "library", "late",
  "final", "const", "var", "yield", "rethrow", "get", "set", "Function",
]);
/** Method vòng đời / override — không bắt buộc mô tả. */
const LIFECYCLE = new Set([
  "onModuleInit", "onModuleDestroy", "onApplicationBootstrap", "onApplicationShutdown",
  "beforeApplicationShutdown", "build", "createState", "initState", "dispose",
  "didChangeDependencies", "didUpdateWidget", "deactivate", "toString", "toJSON", "main",
]);

/** Nhận diện loại file theo đường dẫn; null nếu không trích tên. */
export function langOf(path) {
  const p = path.toLowerCase();
  const name = p.split("/").pop();
  if (name === "package.json") return "npm";
  if (name === "pubspec.yaml") return "pub";
  if (p.endsWith(".d.ts")) return null;
  if (/\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/.test(p)) return "ts";
  if (p.endsWith(".dart")) return "dart";
  if (p.endsWith(".prisma")) return "prisma";
  if (p.endsWith(".sql")) return "sql";
  return null;
}

/** File test / sinh tự động — ghi tên nhưng không bắt buộc mô tả. */
export function isExemptPath(path) {
  const p = path.toLowerCase();
  return (
    /(^|\/)(test|tests|__tests__|e2e|integration_test|generated|gen|dist|build|\.dart_tool|api_client_dart)\//.test(p) ||
    /\.(spec|test|e2e-spec)\.[cm]?[jt]sx?$/.test(p) ||
    /(_test|\.g|\.freezed|\.gr|\.mocks)\.dart$/.test(p)
  );
}

function indentOf(line) {
  const m = /^[ \t]*/.exec(line)[0];
  return m.replaceAll("\t", "  ").length;
}

/**
 * Trích danh sách khai báo từ `text`.
 * Mỗi phần tử: { name (tên đầy đủ, vd `Class.method`), kind, line (0-based), indent, need }.
 * `need` = bắt buộc có mô tả (class, hàm export, method public không phải override/vòng đời).
 */
export function extractSymbols(text, lang) {
  if (text == null) return [];
  const lines = String(text).split(/\r?\n/);
  if (lang === "ts") return extractTs(lines);
  if (lang === "dart") return extractDart(lines);
  if (lang === "prisma") return extractPrisma(lines);
  if (lang === "sql") return extractSql(lines);
  return [];
}

function pushUnique(out, seen, sym) {
  if (seen.has(sym.name)) return;
  seen.add(sym.name);
  out.push(sym);
}

/** Theo dõi class đang mở bằng thụt lề; trả class hiện tại (hoặc undefined). */
function classScope(stack, indent, trimmed) {
  while (
    stack.length &&
    (indent < stack.at(-1).indent || (indent === stack.at(-1).indent && trimmed.startsWith("}")))
  ) {
    stack.pop();
  }
  const cur = stack.at(-1);
  if (cur && cur.member === undefined && indent > cur.indent) cur.member = indent;
  return cur;
}

function extractTs(lines) {
  const out = [];
  const seen = new Set();
  const stack = [];
  let inBlockComment = false;
  lines.forEach((raw, i) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      return;
    }
    if (trimmed.startsWith("/*")) {
      if (!trimmed.includes("*/")) inBlockComment = true;
      return;
    }
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
    const indent = indentOf(raw);
    const cur = classScope(stack, indent, trimmed);

    const cls = /^(export\s+)?(default\s+)?(declare\s+)?(abstract\s+)?class\s+([A-Za-z_$][\w$]*)/.exec(trimmed);
    if (cls && (indent === 0 || !cur)) {
      pushUnique(out, seen, { name: cls[5], kind: "class", line: i, indent, need: true });
      stack.push({ name: cls[5], indent });
      return;
    }
    if (cur && indent === cur.member) {
      if (trimmed.startsWith("@")) return;
      const m =
        /^((?:(?:public|private|protected|static|async|override|readonly|abstract|declare|accessor)\s+)*)(?:(get|set)\s+)?(\*\s*)?(#?[A-Za-z_$][\w$]*)\s*\??\s*(<[^>]*>)?\s*\(/.exec(trimmed) ||
        /^((?:(?:public|private|protected|static|readonly|override)\s+)*)()()(#?[A-Za-z_$][\w$]*)\s*(?::[^=]*)?=\s*(?:async\s+)?(?:\(|[A-Za-z_$][\w$]*\s*=>)/.exec(trimmed);
      if (!m || TS_KEYWORDS.has(m[4])) return;
      const mods = m[1] || "";
      const pub = !/\b(private|protected)\b/.test(mods) && !m[4].startsWith("#");
      const need = pub && !m[2] && !/\boverride\b/.test(mods) && !LIFECYCLE.has(m[4]);
      pushUnique(out, seen, { name: `${cur.name}.${m[4]}`, kind: "method", line: i, indent, need });
      return;
    }
    if (indent !== 0 || cur) return;

    let m = /^(export\s+)?(default\s+)?(declare\s+)?(async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/.exec(trimmed);
    if (m) return pushUnique(out, seen, { name: m[5], kind: "function", line: i, indent, need: Boolean(m[1]) && !LIFECYCLE.has(m[5]) });
    m = /^(export\s+)?(declare\s+)?interface\s+([A-Za-z_$][\w$]*)/.exec(trimmed);
    if (m) return pushUnique(out, seen, { name: m[3], kind: "interface", line: i, indent, need: false });
    m = /^(export\s+)?(declare\s+)?type\s+([A-Za-z_$][\w$]*)\s*(<[^=]*>)?\s*=/.exec(trimmed);
    if (m) return pushUnique(out, seen, { name: m[3], kind: "type", line: i, indent, need: false });
    m = /^(export\s+)?(declare\s+)?(const\s+)?enum\s+([A-Za-z_$][\w$]*)/.exec(trimmed);
    if (m) return pushUnique(out, seen, { name: m[4], kind: "enum", line: i, indent, need: false });
    m = /^(export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(.*)$/.exec(trimmed);
    if (m) {
      const isFn = /^(async\s+)?(function\b|\(|[A-Za-z_$][\w$]*\s*=>|<)/.test(m[3]);
      if (isFn) pushUnique(out, seen, { name: m[2], kind: "function", line: i, indent, need: Boolean(m[1]) });
      else if (m[1]) pushUnique(out, seen, { name: m[2], kind: "const", line: i, indent, need: false });
    }
  });
  return out;
}

function extractDart(lines) {
  const out = [];
  const seen = new Set();
  const stack = [];
  let override = false;
  lines.forEach((raw, i) => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
    const indent = indentOf(raw);
    const cur = classScope(stack, indent, trimmed);

    if (indent === 0) {
      override = false;
      let m = /^(?:(?:abstract|base|interface|final|sealed|mixin)\s+)*class\s+([A-Za-z_]\w*)/.exec(trimmed);
      if (m) {
        pushUnique(out, seen, { name: m[1], kind: "class", line: i, indent, need: !m[1].startsWith("_") });
        stack.push({ name: m[1], indent });
        return;
      }
      m = /^(?:base\s+)?mixin\s+([A-Za-z_]\w*)/.exec(trimmed) || /^extension\s+([A-Za-z_]\w*)\s+on\b/.exec(trimmed);
      if (m) {
        pushUnique(out, seen, { name: m[1], kind: "class", line: i, indent, need: !m[1].startsWith("_") });
        stack.push({ name: m[1], indent });
        return;
      }
      m = /^enum\s+([A-Za-z_]\w*)/.exec(trimmed);
      if (m) {
        pushUnique(out, seen, { name: m[1], kind: "enum", line: i, indent, need: false });
        stack.push({ name: m[1], indent, isEnum: true });
        return;
      }
      m = /^typedef\s+([A-Za-z_]\w*)/.exec(trimmed);
      if (m) return pushUnique(out, seen, { name: m[1], kind: "type", line: i, indent, need: false });
      m = /^(?:external\s+)?(?:[\w.]+(?:<[^()]*>)?\??\s+)?([a-zA-Z_]\w*)\s*(<[^()]*>)?\s*\(/.exec(trimmed);
      if (m && !DART_KEYWORDS.has(m[1]) && !/^(final|const|var|late)\b/.test(trimmed)) {
        const need = !m[1].startsWith("_") && !LIFECYCLE.has(m[1]);
        pushUnique(out, seen, { name: m[1], kind: "function", line: i, indent, need });
      }
      return;
    }
    if (!cur || indent !== cur.member) return;
    if (cur.isEnum && !cur.valuesDone) {
      // Gia tri enum (`pending('PENDING'),`) khong phai method; `;` ket thuc danh sach gia tri
      if (/;\s*$/.test(trimmed)) cur.valuesDone = true;
      return;
    }
    if (trimmed.startsWith("@")) {
      if (/^@override\b/.test(trimmed)) override = true;
      return;
    }
    const m =
      /^(?:(?:static|external|abstract|factory|const)\s+)*(?:[\w.]+(?:<[^()]*>)?\??\s+)?(?:operator\s*\S+\s*)?([a-zA-Z_]\w*(?:\.\w+)?)\s*(<[^()]*>)?\s*\(/.exec(trimmed);
    const wasOverride = override;
    override = false;
    if (!m || DART_KEYWORDS.has(m[1])) return;
    const name = m[1];
    if (name === cur.name || name.startsWith(`${cur.name}.`) || /^(final|late|var)\b/.test(trimmed)) return;
    const need = !name.startsWith("_") && !wasOverride && !LIFECYCLE.has(name);
    pushUnique(out, seen, { name: `${cur.name}.${name}`, kind: "method", line: i, indent, need });
  });
  return out;
}

function extractPrisma(lines) {
  const out = [];
  const seen = new Set();
  lines.forEach((raw, i) => {
    const m = /^(model|enum|view|type)\s+([A-Za-z_]\w*)/.exec(raw);
    if (m) pushUnique(out, seen, { name: m[2], kind: m[1], line: i, indent: 0, need: false });
  });
  return out;
}

function extractSql(lines) {
  const out = [];
  const seen = new Set();
  lines.forEach((raw, i) => {
    const create =
      /CREATE\s+(?:OR\s+REPLACE\s+)?(?:UNIQUE\s+)?(TABLE|INDEX|POLICY|FUNCTION|TRIGGER|VIEW|TYPE|SCHEMA|ROLE|EXTENSION)\s+(?:IF\s+NOT\s+EXISTS\s+)?("?[\w.]+"?)/i.exec(raw);
    if (create) {
      const name = `${create[1].toUpperCase()} ${create[2].replaceAll('"', "")}`;
      pushUnique(out, seen, { name, kind: "sql", line: i, indent: 0, need: false });
    }
    const col = /ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(?:ONLY\s+)?("?[\w.]+"?)\s+ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?("?\w+"?)/i.exec(raw);
    if (col) {
      const name = `COLUMN ${col[1].replaceAll('"', "")}.${col[2].replaceAll('"', "")}`;
      pushUnique(out, seen, { name, kind: "sql", line: i, indent: 0, need: false });
    }
  });
  return out;
}

/** Dòng mô tả của khai báo: dòng đầu JSDoc `/** … *\/` hoặc `///` ngay phía trên (bỏ qua decorator). */
export function docFor(text, sym) {
  if (text == null || !sym) return null;
  const lines = String(text).split(/\r?\n/);
  let j = sym.line - 1;
  while (j >= 0) {
    const t = lines[j].trim();
    const ind = indentOf(lines[j]);
    if (!t) return null;
    const isDocLine = t.startsWith("*") || t.startsWith("///") || t.startsWith("/**");
    const decorator =
      t.startsWith("@") ||
      (ind > sym.indent && !isDocLine) ||
      (ind === sym.indent && /^[)\]}]+[,;)]*$/.test(t));
    if (!decorator) break;
    j -= 1;
  }
  if (j < 0) return null;
  const t = lines[j].trim();
  let body = [];
  if (t.endsWith("*/")) {
    let k = j;
    while (k >= 0 && !lines[k].includes("/*") && j - k < 60) k -= 1;
    if (k < 0 || !lines[k].includes("/**")) return null;
    body = lines
      .slice(k, j + 1)
      .join("\n")
      .replace(/^\s*\/\*\*/, "")
      .replace(/\*\/\s*$/, "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim());
  } else if (t.startsWith("///")) {
    let k = j;
    while (k - 1 >= 0 && lines[k - 1].trim().startsWith("///")) k -= 1;
    body = lines.slice(k, j + 1).map((l) => l.trim().replace(/^\/\/\/\s?/, "").trim());
  } else {
    return null;
  }
  const first = body.find((l) => l && !l.startsWith("@") && !l.startsWith("```"));
  if (!first) return null;
  const one = first.replace(/\s+/g, " ").trim();
  return one.length > 160 ? `${one.slice(0, 159)}…` : one;
}

/** Khoảng dòng [s, e] (0-based, trong `after`) bị thay đổi so với `before` — so khớp đầu/cuối. */
function changedRange(before, after) {
  const a = before.split(/\r?\n/);
  const b = after.split(/\r?\n/);
  let s = 0;
  while (s < a.length && s < b.length && a[s] === b[s]) s += 1;
  let ea = a.length - 1;
  let eb = b.length - 1;
  while (ea >= s && eb >= s && a[ea] === b[eb]) {
    ea -= 1;
    eb -= 1;
  }
  if (s > eb && s > ea) return null;
  return [s, Math.max(s, eb)];
}

/** Dòng cuối thân khai báo: dòng `}` / `)` đầu tiên cùng thụt lề (code đã format), hoặc trước dòng cùng cấp kế tiếp. */
function endLine(lines, sym) {
  for (let k = sym.line + 1; k < lines.length; k += 1) {
    const t = lines[k].trim();
    if (!t) continue;
    if (indentOf(lines[k]) > sym.indent) continue;
    if (/^\)[^;]*(\{|=>)\s*$/.test(t)) continue; // phan cuoi cua chu ky nhieu dong: `): Promise<void> {`
    return /^[})\]]/.test(t) ? k : k - 1;
  }
  return lines.length - 1;
}

/** Các khai báo "sâu nhất" có thân chứa đoạn bị sửa. */
function enclosing(symbols, range, lines) {
  if (!range) return [];
  const [s, e] = range;
  const spans = symbols.map((sym) => ({ sym, end: endLine(lines, sym) }));
  const hit = spans.filter(({ sym, end }) => sym.line <= e && end >= s);
  return hit
    .filter(({ sym, end }) => !hit.some((o) => o.sym !== sym && o.sym.line > sym.line && o.sym.line <= end))
    .map(({ sym }) => sym);
}

function npmDeps(text) {
  const out = {};
  try {
    const pkg = JSON.parse(text || "{}");
    for (const key of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      for (const [n, v] of Object.entries(pkg[key] || {})) out[n] = String(v);
    }
  } catch {
    // JSON hong giua chung -> coi nhu rong
  }
  return out;
}

function pubDeps(text) {
  const out = {};
  let section = false;
  for (const raw of String(text || "").split(/\r?\n/)) {
    if (/^\S/.test(raw)) section = /^(dependencies|dev_dependencies|dependency_overrides):/.test(raw);
    else if (section) {
      const m = /^ {2}([A-Za-z_]\w*):\s*(.*)$/.exec(raw);
      if (m) out[m[1]] = m[2].replace(/\s+#.*$/, "").trim() || "(khối)";
    }
  }
  return out;
}

function depChanges(before, after, parse) {
  const b = parse(before);
  const a = parse(after);
  const sym = [];
  for (const [n, v] of Object.entries(a)) {
    if (!(n in b)) sym.push(`+${n}@${v}`);
    else if (b[n] !== v) sym.push(`~${n}@${v}`);
  }
  for (const n of Object.keys(b)) if (!(n in a)) sym.push(`-${n}`);
  return sym;
}

/**
 * So sánh nội dung trước/sau của 1 file → { sym, need, docs }.
 * sym: ["+Tên", "~Tên" (sửa bên trong), "-Tên"]; need: tên mới bắt buộc có mô tả; docs: {tên: mô tả}.
 * `before` = null nghĩa là không biết nội dung cũ → coi mọi khai báo là mới.
 */
export function symbolChanges(path, before, after) {
  const lang = langOf(path);
  const empty = { sym: [], need: [], docs: {} };
  if (!lang || after == null) return empty;
  if (lang === "npm") return { ...empty, sym: depChanges(before ?? "{}", after, npmDeps) };
  if (lang === "pub") return { ...empty, sym: depChanges(before ?? "", after, pubDeps) };

  const now = extractSymbols(after, lang);
  const old = before == null ? [] : extractSymbols(before, lang);
  const oldNames = new Set(old.map((s) => s.name));
  const nowNames = new Set(now.map((s) => s.name));
  const added = now.filter((s) => !oldNames.has(s.name));
  const removed = old.filter((s) => !nowNames.has(s.name));
  const sym = [...added.map((s) => `+${s.name}`), ...removed.map((s) => `-${s.name}`)];
  if (!added.length && !removed.length && before != null) {
    const range = changedRange(before, after);
    for (const s of enclosing(now, range, after.split(/\r?\n/))) sym.push(`~${s.name}`);
  }
  const exempt = isExemptPath(path);
  const need = exempt ? [] : added.filter((s) => s.need).map((s) => s.name);
  const docs = {};
  for (const s of added) {
    const d = docFor(after, s);
    if (d) docs[s.name] = d;
  }
  return { sym, need, docs };
}

/** Mô tả hiện tại của các tên trong file (dùng khi hook Stop kiểm tra lại cuối lượt). */
export function docsInFile(path, text, names) {
  const lang = langOf(path);
  const found = {};
  if (!lang || text == null) return found;
  const all = extractSymbols(text, lang);
  for (const name of names) {
    const s = all.find((x) => x.name === name);
    if (!s) continue;
    found[name] = docFor(text, s);
  }
  return found;
}
