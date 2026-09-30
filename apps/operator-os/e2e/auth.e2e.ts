import { expect, test, type Page } from "@playwright/test";

import { accounts, totp } from "./helpers";

// TC-SEC-008 (08 Test) phía Operator OS: first-login Owner → TOTP → backup code → reload giữ phiên;
// access hết hạn → refresh một lần; Employee bị chặn (06 UI §7, TASK-IAM-006 Q4). Chạy tuần tự vì
// các ca sau dùng lại Owner đã enrollment ở ca đầu.
test.describe.configure({ mode: "serial" });

const API = "http://localhost:3000/v1";
let backupCodes: string[] = [];

async function signIn(page: Page, identifier: string, password: string) {
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await page.locator('input[name="identifier"]').fill(identifier);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test("Owner first-login: mật khẩu tạm → đổi → login lại → TOTP → backup code → vào app, reload vẫn giữ phiên", async ({
  page,
  context
}) => {
  const { operatorSlug, owner } = accounts();
  const identifier = `${operatorSlug}/${owner.username}`;
  await page.goto("/");

  await signIn(page, identifier, owner.temporaryPassword);
  await expect(page.getByRole("heading", { name: "Đổi mật khẩu tạm" })).toBeVisible();
  // Chưa có phiên nào trước khi hoàn tất đổi mật khẩu + MFA.
  expect((await context.cookies(API)).some((cookie) => cookie.name === "vxn_access")).toBe(false);
  await page.locator('input[name="newPassword"]').fill(owner.newPassword);
  await page.locator('input[name="confirmPassword"]').fill(owner.newPassword);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();

  await expect(page.getByText("Đổi mật khẩu thành công")).toBeVisible();
  await signIn(page, identifier, owner.newPassword);

  await expect(page.getByRole("heading", { name: "Bật xác thực hai lớp" })).toBeVisible();
  await expect(page.getByAltText("Mã QR thiết lập xác thực hai lớp")).toBeVisible();
  const secret = (await page.locator("code").innerText()).trim();
  await page.locator('input[name="code"]').fill(totp(secret));
  await page.getByRole("button", { name: "Xác nhận" }).click();

  await expect(page.getByRole("heading", { name: "Mã dự phòng" })).toBeVisible();
  backupCodes = await page.getByRole("listitem").allInnerTexts();
  expect(backupCodes).toHaveLength(10);
  await page.getByRole("button", { name: "Tôi đã lưu mã, vào trang quản lý" }).click();

  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  await expect(page.getByText(identifier).first()).toBeVisible();

  const cookies = await context.cookies(API);
  expect(cookies.find((cookie) => cookie.name === "vxn_access")).toMatchObject({
    httpOnly: true,
    sameSite: "Lax",
    path: "/v1"
  });
  expect(cookies.find((cookie) => cookie.name === "vxn_refresh")).toBeUndefined(); // Path /v1/auth/refresh
  expect(
    (await context.cookies(`${API}/auth/refresh`)).find((cookie) => cookie.name === "vxn_refresh")
  ).toMatchObject({ httpOnly: true, sameSite: "Strict" });

  // Backup code không còn trên trang sau khi rời màn.
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  await expect(page.getByText(backupCodes[0]!)).toHaveCount(0);
});

test("access cookie hết hạn → đúng MỘT lần refresh rồi vào lại app", async ({ page, context }) => {
  const { operatorSlug, owner } = accounts();
  await page.goto("/");
  await signIn(page, `${operatorSlug}/${owner.username}`, owner.newPassword);
  await page.locator('input[name="code"]').fill(backupCodes.shift()!);
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();

  await context.clearCookies({ name: "vxn_access" });
  const refreshes: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/auth/refresh")) {
      refreshes.push(request.url());
    }
  });
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toBeVisible();
  expect(refreshes).toHaveLength(1);

  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  expect((await context.cookies(API)).some((cookie) => cookie.name === "vxn_access")).toBe(false);
  // Reload sau logout không vào lại được app.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});

test("nhân viên đăng nhập Operator OS → lỗi chung từ cổng Owner, không có phiên (TASK-IAM-006)", async ({
  page,
  context
}) => {
  const { operatorSlug, employee } = accounts();
  await page.goto("/");
  await signIn(page, `${operatorSlug}/${employee.username}`, employee.password);

  // Cổng `/auth/operator/login` không tra bảng nhân viên → cùng lỗi như sai mật khẩu, không lộ tài khoản.
  await expect(page.getByText("Tên đăng nhập hoặc mật khẩu không đúng.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Điều hướng chính" })).toHaveCount(0);
  expect((await context.cookies(API)).some((cookie) => cookie.name === "vxn_access")).toBe(false);
});
