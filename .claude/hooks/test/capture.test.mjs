import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { eventsFromHook, parsePatch } from "../lib/capture.mjs";
import { repoContext } from "../lib/store.mjs";
import { put, tempRepo } from "./helpers.mjs";

const SVC = `/** Gửi mã OTP qua email. */
export class OtpService {
  /** Tạo và gửi mã. */
  send(email: string) {
    return email;
  }
}
`;

function setup() {
  const root = tempRepo();
  return { root, ctx: repoContext(root) };
}

test("Claude Write (tạo mới) → sự kiện file có tên + mô tả, gắn subagent", () => {
  const { root, ctx } = setup();
  put(root, "apps/api/src/otp.service.ts", SVC);
  const [ev] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      session_id: "sess-1234567890",
      prompt_id: "prompt-abcdefgh",
      agent_id: "agent-xyz123456",
      agent_type: "backend-developer",
      tool_name: "Write",
      tool_input: { file_path: join(root, "apps/api/src/otp.service.ts"), content: SVC },
      tool_response: { type: "create", originalFile: null, structuredPatch: [] },
    },
    "claude",
    ctx,
  );
  assert.equal(ev.ev, "file");
  assert.equal(ev.op, "create");
  assert.equal(ev.path, "apps/api/src/otp.service.ts");
  assert.equal(ev.agent, "backend-developer");
  assert.equal(ev.sid, "sess-123");
  assert.equal(ev.turn, "prompt-a");
  assert.deepEqual(ev.sym, ["+OtpService", "+OtpService.send"]);
  assert.deepEqual(ev.need, ["OtpService", "OtpService.send"]);
  assert.equal(ev.docs["OtpService.send"], "Tạo và gửi mã.");
  assert.equal(JSON.stringify(ev).includes("return email"), false, "không lưu code");
});

test("Claude Edit dùng originalFile → ~ method; file ngoài repo / .ai-journal bị bỏ qua", () => {
  const { root, ctx } = setup();
  const after = SVC.replace("return email;", "return email.trim();");
  put(root, "a.ts", after);
  const [ev] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      tool_name: "Edit",
      tool_input: { file_path: join(root, "a.ts"), old_string: "return email;", new_string: "return email.trim();" },
      tool_response: { originalFile: SVC, structuredPatch: [{ lines: ["-    return email;", "+    return email.trim();"] }] },
    },
    "claude",
    ctx,
  );
  assert.deepEqual(ev.sym, ["~OtpService.send"]);
  assert.equal(ev.add, 1);
  assert.equal(ev.del, 1);
  assert.equal(ev.agent, "main");

  const outside = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "Write", tool_input: { file_path: join(root, "..", "x.ts") } },
    "claude",
    ctx,
  );
  assert.deepEqual(outside, []);
  const journal = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "Write", tool_input: { file_path: join(root, ".ai-journal/x.md") } },
    "claude",
    ctx,
  );
  assert.deepEqual(journal, []);
});

test("Claude Edit không có originalFile → dựng lại từ old/new_string", () => {
  const { root, ctx } = setup();
  const after = SVC.replace("  /** Tạo và gửi mã. */", "  /** Xoá mã. */\n  clear() {}\n\n  /** Tạo và gửi mã. */");
  put(root, "a.ts", after);
  const [ev] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      tool_name: "Edit",
      tool_input: {
        file_path: join(root, "a.ts"),
        old_string: "  /** Tạo và gửi mã. */",
        new_string: "  /** Xoá mã. */\n  clear() {}\n\n  /** Tạo và gửi mã. */",
      },
      tool_response: {},
    },
    "claude",
    ctx,
  );
  assert.deepEqual(ev.sym, ["+OtpService.clear"]);
  assert.equal(ev.docs["OtpService.clear"], "Xoá mã.");
});

test("Codex apply_patch → 1 sự kiện mỗi file (thêm / sửa / xoá), model lấy từ hook", () => {
  const { root, ctx } = setup();
  put(root, "src/new.ts", "/** Tiện ích mới. */\nexport function helper() {}\n");
  put(root, "src/old.ts", "export function a() {\n  return 2;\n}\n");
  const patch = [
    "*** Begin Patch",
    "*** Add File: src/new.ts",
    "+/** Tiện ích mới. */",
    "+export function helper() {}",
    "*** Update File: src/old.ts",
    "@@",
    " export function a() {",
    "-  return 1;",
    "+  return 2;",
    " }",
    "*** Delete File: src/gone.ts",
    "*** End Patch",
  ].join("\n");
  assert.equal(parsePatch(patch).length, 3);
  const evs = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      session_id: "codex-session-1",
      turn_id: "turn-0001xyz",
      model: "gpt-5.6-sol",
      tool_name: "apply_patch",
      tool_input: { command: patch },
    },
    "codex",
    ctx,
  );
  assert.deepEqual(
    evs.map((e) => [e.op, e.path, e.sym ?? []]),
    [
      ["create", "src/new.ts", ["+helper"]],
      ["edit", "src/old.ts", ["~a"]],
      ["delete", "src/gone.ts", []],
    ],
  );
  assert.equal(evs[0].docs.helper, "Tiện ích mới.");
  assert.equal(evs[0].model, "gpt-5.6-sol");
  assert.equal(evs[0].turn, "turn-000");
  assert.equal(evs[1].add, 1);
});

test("Lệnh shell: che secret, bỏ thân heredoc, lỗi → ok=false", () => {
  const { ctx } = setup();
  const [ev] = eventsFromHook(
    {
      hook_event_name: "PostToolUseFailure",
      tool_name: "Bash",
      tool_input: { command: "export DATABASE_URL=postgres://u:p@h/db && pnpm --filter @vexenhanh/api run prisma:migrate:dev", description: "Chạy migration" },
    },
    "claude",
    ctx,
  );
  assert.equal(ev.ev, "cmd");
  assert.equal(ev.cat, "db");
  assert.equal(ev.ok, false);
  assert.equal(ev.cmd.includes("u:p@"), false);
  assert.equal(ev.desc, "Chạy migration");

  const [codex] = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "Bash", tool_input: { command: "pnpm test" }, tool_response: { exit_code: 1 } },
    "codex",
    ctx,
  );
  assert.equal(codex.ok, false);

  const [cd] = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "Bash", tool_input: { command: `cd "${ctx.top}" && pnpm lint` } },
    "claude",
    ctx,
  );
  assert.equal(cd.cmd, "pnpm lint", "bỏ `cd <gốc repo> &&` cho gọn");
});

test("Không để code lọt vào nhật ký: patch dạng mảng lệnh, echo > file, token trong URL", () => {
  const { root, ctx } = setup();
  put(root, "src/p.ts", "/** Hàm mới. */\nexport function p() {}\n");
  const patch = "*** Begin Patch\n*** Add File: src/p.ts\n+/** Hàm mới. */\n+export function p() {}\n*** End Patch";
  const evs = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "shell", tool_input: { command: ["apply_patch", patch] } },
    "codex",
    ctx,
  );
  assert.deepEqual(evs.map((e) => [e.ev, e.path]), [["file", "src/p.ts"]]);

  const [echo] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      tool_input: { command: 'echo "export const x = computeSomethingLong(1, 2, 3);" > src/x.ts' },
    },
    "claude",
    ctx,
  );
  assert.equal(echo.edit, true);
  assert.equal(echo.cmd.includes("computeSomethingLong"), false);

  const [hook] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      tool_name: "WebFetch",
      tool_input: { url: "https://discord.com/api/webhooks/123456/AbCdEfGh1234567890IjKlMnOpQrStUvWxYz0123456789abcd" },
    },
    "claude",
    ctx,
  );
  assert.equal(hook.target.includes("AbCdEfGh1234567890"), false);
});

test("MCP, web, prompt, subagent", () => {
  const { ctx } = setup();
  const [mcp] = eventsFromHook(
    {
      hook_event_name: "PostToolUse",
      tool_name: "mcp__Claude_Browser__navigate",
      tool_input: { url: "https://dashboard.render.com/web/srv-1?token=secret" },
    },
    "claude",
    ctx,
  );
  assert.deepEqual([mcp.server, mcp.name, mcp.target], ["Claude_Browser", "navigate", "dashboard.render.com/web/srv-1"]);
  const [web] = eventsFromHook(
    { hook_event_name: "PostToolUse", tool_name: "WebFetch", tool_input: { url: "https://docs.nestjs.com/guards?x=1" } },
    "claude",
    ctx,
  );
  assert.equal(web.target, "docs.nestjs.com/guards");
  const [prompt] = eventsFromHook(
    { hook_event_name: "UserPromptSubmit", prompt: `Deploy giúp tôi, token=abc123XYZ ${"x".repeat(300)}` },
    "claude",
    ctx,
  );
  assert.equal(prompt.ev, "prompt");
  assert.equal(prompt.text.includes("abc123XYZ"), false);
  assert.ok(prompt.text.length <= 200);
  assert.equal(prompt.branch, "main");
  const [agent] = eventsFromHook(
    { hook_event_name: "SubagentStart", agent_id: "a1", agent_type: "code-reviewer" },
    "claude",
    ctx,
  );
  assert.deepEqual([agent.ev, agent.phase, agent.type], ["agent", "start", "code-reviewer"]);
  assert.deepEqual(eventsFromHook({ hook_event_name: "PostToolUse", tool_name: "Read" }, "claude", ctx), []);
});
