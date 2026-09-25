import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyCommand, mainSegment, redact, stripBodies } from "../lib/commands.mjs";

const cat = (cmd) => classifyCommand(cmd).cat;

test("phân nhóm lệnh pnpm / prisma / turbo", () => {
  const add = classifyCommand("pnpm --filter @vexenhanh/api add zod@^3 ioredis");
  assert.equal(add.cat, "install");
  assert.deepEqual(add.pkgs, ["+zod@^3", "+ioredis"]);
  assert.equal(cat("pnpm --filter @vexenhanh/api run prisma:migrate:dev --name add_x"), "db");
  assert.equal(cat("pnpm --filter @vexenhanh/api run db:app-role"), "db");
  assert.equal(cat("npx prisma generate"), "db");
  assert.equal(cat("pnpm test"), "check");
  assert.equal(cat("pnpm turbo run typecheck lint test build"), "check");
  assert.equal(cat("pnpm dev"), "run");
  assert.equal(cat("pnpm gen:api-client"), "scaffold");
  assert.equal(cat("pnpm dlx shadcn@latest add button"), "scaffold");
  assert.equal(cat("pnpm install"), "install");
});

test("phân nhóm git / gh / deploy", () => {
  assert.equal(cat("git status && git log --oneline -5"), "read");
  assert.equal(cat("git add -A && git commit -m \"x\""), "git");
  assert.equal(cat("git push -u origin feat"), "deploy");
  assert.equal(cat("git branch"), "read");
  assert.equal(cat("git switch -c chore/x"), "git");
  const pr = classifyCommand("gh pr create --title x --body y");
  assert.equal(pr.cat, "deploy");
  assert.deepEqual(pr.ext, ["gh"]);
  assert.equal(cat("gh pr view 1"), "external");
  assert.equal(cat("flutter build apk --release"), "deploy");
});

test("phân nhóm Flutter / Docker / cài phần mềm / web", () => {
  const pub = classifyCommand("fvm flutter pub add dio");
  assert.equal(pub.cat, "install");
  assert.deepEqual(pub.pkgs, ["+dio"]);
  assert.equal(cat("flutter test"), "check");
  assert.equal(cat("docker compose up -d"), "run");
  assert.equal(cat("docker compose logs api"), "read");
  const winget = classifyCommand("winget install --id Git.Git -e");
  assert.equal(winget.cat, "install");
  assert.deepEqual(winget.pkgs, ["+winget:Git.Git"]);
  const curl = classifyCommand("curl -s https://api.github.com/repos/x");
  assert.equal(curl.cat, "external");
  assert.deepEqual(curl.ext, ["curl api.github.com"]);
});

test("chỉ-đọc, thao tác file, sửa file bằng shell, lệnh nhật ký", () => {
  assert.equal(cat("ls -la"), "read");
  assert.equal(cat("Get-ChildItem -Force | Select-Object Name"), "read");
  assert.equal(cat("cat package.json | head -5"), "read");
  assert.equal(cat("node --version"), "read");
  assert.equal(cat("mkdir -p apps/x"), "file");
  const sed = classifyCommand("sed -i 's/a/b/' src/a.ts");
  assert.equal(sed.cat, "file");
  assert.equal(sed.edit, true);
  assert.equal(classifyCommand("echo hi > notes.txt").edit, true);
  assert.equal(classifyCommand("pnpm test 2>/dev/null").edit, false);
  assert.equal(cat('node .claude/hooks/ai-journal.mjs add "a" "b" "c" "d" "" "f"'), "journal");
});

test("heredoc: không phân nhóm theo nội dung bên trong, không lưu code", () => {
  const cmd = "cat > src/a.ts <<'EOF'\nexport const a = 1;\ngit push\nEOF";
  const r = classifyCommand(cmd);
  assert.equal(r.cat, "file");
  assert.equal(r.edit, true);
  assert.equal(stripBodies(cmd), "cat > src/a.ts <<EOF …");
  assert.equal(stripBodies('node -e "console.log(require(\'fs\'))"'), 'node -e "…"');
  // Script co dau nhay escape + mui ten => khong bi coi la ghi file
  const inline = 'node -e "const f = (o) => o; console.log(\\"a>b\\")" && echo ok';
  assert.equal(stripBodies(inline), 'node -e "…" && echo ok');
  assert.equal(classifyCommand(inline).edit, false);
  assert.equal(cat("node --test \".claude/hooks/test/*.test.mjs\""), "check");
  assert.equal(mainSegment('cd "C:/x" && S=abc && pnpm dlx foo --bar'), "pnpm dlx foo --bar");
});

test("heredoc thiếu dòng kết thúc, --eval=, đầu vào rất dài vẫn nhanh", () => {
  assert.equal(stripBodies("cat > a.ts <<EOF\nexport const secretCode = 1;"), "cat > a.ts <<EOF …");
  assert.equal(stripBodies('node --eval="console.log(1)"'), 'node --eval="…"');
  const started = Date.now();
  redact("a".repeat(200_000));
  redact("-".repeat(200_000));
  stripBodies("x << y\n".repeat(50_000));
  classifyCommand(`echo ${"b".repeat(200_000)}`);
  assert.ok(Date.now() - started < 2000, `quá chậm: ${Date.now() - started}ms`);
});

test("che secret trong lệnh", () => {
  assert.equal(
    redact('$env:DATABASE_URL = "postgres://app:secret@host:5432/db"'),
    "$env:DATABASE_URL = ***",
  );
  assert.equal(redact("psql postgres://user:pass@localhost/db"), "psql postgres://***:***@localhost/db");
  assert.match(redact('curl -H "Authorization: Bearer abcdef123456" https://x'), /Bearer \*\*\*/);
  assert.equal(redact("export RESEND_API_KEY=re_ABCdef123"), "export RESEND_API_KEY=***");
  assert.equal(redact("gh auth login --with-token abc123"), "gh auth login --with-token ***");
  const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  assert.doesNotMatch(redact(`curl -d ${jwt}`), /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/);
  // Ten migration / duong dan dai khong bi che
  assert.equal(
    redact("prisma migrate resolve --applied 20260922010000_add_account_lifecycle"),
    "prisma migrate resolve --applied 20260922010000_add_account_lifecycle",
  );
  assert.equal(
    redact("cat apps/api/src/modules/iam/session/session.service.ts"),
    "cat apps/api/src/modules/iam/session/session.service.ts",
  );
});
