import { createHmac } from "node:crypto";

export type E2eAccounts = {
  operatorSlug: string;
  owner: { username: string; temporaryPassword: string; newPassword: string };
  employee: { username: string; password: string };
  platform: { username: string; password: string };
};

/** Tài khoản do global-setup seed cho lần chạy này. */
export function accounts(): E2eAccounts {
  const raw = process.env.E2E_WEB_AUTH_ACCOUNTS;
  if (!raw) {
    throw new Error("Thiếu E2E_WEB_AUTH_ACCOUNTS — global-setup chưa chạy.");
  }
  return JSON.parse(raw) as E2eAccounts;
}

/** TOTP RFC 6238 (SHA-1, 30 s, 6 số) — giống app authenticator, để E2E hoàn tất enrollment. */
export function totp(secretBase32: string, nowMs = Date.now()): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const char of secretBase32.replace(/=+$/, "").toUpperCase()) {
    bits += alphabet.indexOf(char).toString(2).padStart(5, "0");
  }
  const key = Buffer.from((bits.match(/.{8}/g) ?? []).map((byte) => parseInt(byte, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(nowMs / 1000 / 30)));
  const hmac = createHmac("sha1", key).update(counter).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}
