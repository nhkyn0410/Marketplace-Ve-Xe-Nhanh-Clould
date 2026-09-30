import { expect, test, type Page } from "@playwright/test";

import { accounts, totp } from "./helpers";

// TC-SEC-008 (08 Test) phía Admin: `platform/{username}` + mật khẩu → TOTP bắt buộc → backup code →
// reload giữ phiên; tài khoản sai namespace không vào được (06 UI §9).
test.describe.configure({ mode: "serial" });

const API = "http://localhost:3000/v1";

async function signIn(page: Page, identifier: string, password: string) {
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await page.locator('input[name="identifier"]').fill(identifier);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test("Platform admin: mật khẩu → TOTP enrollment → backup code → vào app, reload giữ phiên, đăng xuất", async ({
  page,
  context
}) => {
  const { platform } = accounts();
  const identifier = `platform/${platform.username}`;
  await page.goto("/");

  await signIn(page, identifier, platform.password);
  await expect(page.getByRole("heading", { name: "Bật xác thực hai lớp" })).toBeVisible();
  // Chưa có phiên trước khi xác thực MFA.
  expect((await context.cookies(API)).some((cookie) => cookie.name === "vxn_access")).toBe(false);
  const secret = (await page.locator("code").innerText()).trim();
  await page.locator('input[name="code"]').fill(totp(secret));
  await page.getByRole("button", { name: "Xác nhận" }).click();

  await expect(page.getByRole("heading", { name: "Mã dự phòng" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(10);
  await page.getByRole("button", { name: "Tôi đã lưu mã, vào trang quản trị" }).click();

  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  await expect(page.getByText(identifier).first()).toBeVisible();
  expect((await context.cookies(API)).find((cookie) => cookie.name === "vxn_access")).toMatchObject({
    httpOnly: true,
    sameSite: "Lax"
  });

  await page.reload();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  expect((await context.cookies(API)).some((cookie) => cookie.name === "vxn_access")).toBe(false);
});

test("tài khoản nhà xe đăng nhập Admin → lỗi chung, không vào app", async ({ page }) => {
  const { operatorSlug, employee } = accounts();
  await page.goto("/");
  await signIn(page, `${operatorSlug}/${employee.username}`, employee.password);

  await expect(page.getByText("Tên đăng nhập hoặc mật khẩu không đúng.")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toHaveCount(0);
});
