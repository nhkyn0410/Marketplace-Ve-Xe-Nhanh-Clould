"use client";

import { Button } from "@vexenhanh/ui/components/button";
import { LogoMark } from "@vexenhanh/ui/components/logo";
import QRCode from "qrcode";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { ApiError, apiRequest } from "../../lib/auth/api-client";

// Luồng đăng nhập Operator OS (06 UI §7): định danh → [đổi mật khẩu tạm → đăng nhập lại] → TOTP
// (enrollment lần đầu) → backup code một lần → vào app. Challenge chỉ nằm trong state React (memory);
// reload giữa chừng thì bắt đầu lại từ bước đăng nhập.
const LOGIN_PATH = "/auth/operator/login";
const IDENTIFIER_HINT = "nhaxe/tendangnhap";

type LoginResponse =
  | { passwordChangeRequired: true; passwordChangeToken: string }
  | { mfaRequired: true; challengeToken: string; enrollmentRequired: boolean; otpAuthUri?: string }
  | { authenticated: true };

type MfaVerifyResponse = { authenticated: true; backupCodes?: string[] };

type Step =
  | { kind: "credentials"; notice?: string }
  | { kind: "password-change"; token: string }
  | { kind: "mfa"; challengeToken: string; otpAuthUri?: string }
  | { kind: "backup-codes"; codes: string[] };

/** Các bước đăng nhập web; gọi `onAuthenticated` khi cookie phiên đã được cấp. */
export function LoginFlow({ notice, onAuthenticated }: { notice?: string; onAuthenticated: () => Promise<void> }) {
  const [step, setStep] = useState<Step>({ kind: "credentials", notice });

  const restart = (message?: string) => setStep({ kind: "credentials", notice: message });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <LogoMark className="size-9 shrink-0 text-vxn-teal-500" />
          <span className="text-base font-semibold text-vxn-ink">Trang quản lý nhà xe</span>
        </div>
        {step.kind === "credentials" && (
          <CredentialsStep
            notice={step.notice}
            onResult={(result) => {
              if ("passwordChangeRequired" in result) {
                setStep({ kind: "password-change", token: result.passwordChangeToken });
              } else if ("mfaRequired" in result) {
                setStep({ kind: "mfa", challengeToken: result.challengeToken, otpAuthUri: result.otpAuthUri });
              } else {
                void onAuthenticated();
              }
            }}
          />
        )}
        {step.kind === "password-change" && (
          <PasswordChangeStep
            token={step.token}
            onDone={() => restart("Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.")}
            onRestart={restart}
          />
        )}
        {step.kind === "mfa" && (
          <MfaStep
            challengeToken={step.challengeToken}
            otpAuthUri={step.otpAuthUri}
            onVerified={(codes) => (codes ? setStep({ kind: "backup-codes", codes }) : void onAuthenticated())}
            onRestart={restart}
          />
        )}
        {step.kind === "backup-codes" && <BackupCodesStep codes={step.codes} onContinue={onAuthenticated} />}
      </div>
    </div>
  );
}

function CredentialsStep({ notice, onResult }: { notice?: string; onResult: (result: LoginResponse) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      onResult(
        await apiRequest<LoginResponse>(LOGIN_PATH, {
          method: "POST",
          body: { identifier: identifier.trim(), password },
          retryOnUnauthorized: false
        })
      );
    } catch (caught) {
      setError(loginErrorMessage(caught));
      setPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Heading title="Đăng nhập" description="Dùng tài khoản do nền tảng cấp cho nhà xe." />
      {notice && <Notice>{notice}</Notice>}
      <Field label="Tên đăng nhập" hint={`Dạng ${IDENTIFIER_HINT}`}>
        <input
          className={INPUT}
          name="identifier"
          autoComplete="username"
          placeholder={IDENTIFIER_HINT}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />
      </Field>
      <Field label="Mật khẩu">
        <input
          className={INPUT}
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={pending || !identifier.includes("/") || !password}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}

function PasswordChangeStep({
  token,
  onDone,
  onRestart
}: {
  token: string;
  onDone: () => void;
  onRestart: (notice?: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const mismatch = confirm.length > 0 && confirm !== password;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 12 || password !== confirm) {
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await apiRequest("/auth/password/change-required", {
        method: "POST",
        body: { passwordChangeToken: token, newPassword: password },
        retryOnUnauthorized: false
      });
      onDone();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        onRestart("Yêu cầu đổi mật khẩu đã hết hạn. Vui lòng đăng nhập lại bằng mật khẩu tạm.");
        return;
      }
      setError(caught instanceof ApiError && caught.status === 400 ? caught.message : loginErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Heading
        title="Đổi mật khẩu tạm"
        description="Lần đăng nhập đầu tiên cần đặt mật khẩu mới. Sau đó bạn đăng nhập lại."
      />
      <Field label="Mật khẩu mới" hint="Tối thiểu 12 ký tự, khác mật khẩu tạm.">
        <input
          className={INPUT}
          type="password"
          name="newPassword"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      <Field label="Nhập lại mật khẩu mới">
        <input
          className={INPUT}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          aria-invalid={mismatch}
          required
        />
      </Field>
      {mismatch && <ErrorText>Mật khẩu nhập lại không khớp.</ErrorText>}
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={pending || password.length < 12 || password !== confirm}>
        {pending ? "Đang lưu…" : "Đổi mật khẩu"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => onRestart()}>
        Quay lại đăng nhập
      </Button>
    </form>
  );
}

function MfaStep({
  challengeToken,
  otpAuthUri,
  onVerified,
  onRestart
}: {
  challengeToken: string;
  otpAuthUri?: string;
  onVerified: (backupCodes?: string[]) => void;
  onRestart: (notice?: string) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const result = await apiRequest<MfaVerifyResponse>("/auth/mfa/verify", {
        method: "POST",
        body: { challengeToken, code: code.trim() },
        retryOnUnauthorized: false
      });
      onVerified(result.backupCodes);
    } catch (caught) {
      setCode("");
      setError(
        caught instanceof ApiError && caught.status === 401
          ? "Mã xác thực không đúng hoặc đã hết hạn. Nhập sai nhiều lần thì cần đăng nhập lại."
          : caught instanceof ApiError && caught.status === 400
            ? "Nhập mã 6 số từ ứng dụng xác thực hoặc một mã dự phòng."
            : loginErrorMessage(caught)
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {otpAuthUri ? (
        <>
          <Heading
            title="Bật xác thực hai lớp"
            description="Quét mã QR bằng Google Authenticator (hoặc ứng dụng tương tự), rồi nhập mã 6 số."
          />
          <TotpEnrollment otpAuthUri={otpAuthUri} />
        </>
      ) : (
        <Heading title="Xác thực hai lớp" description="Nhập mã 6 số từ ứng dụng xác thực hoặc một mã dự phòng." />
      )}
      <Field label="Mã xác thực">
        <input
          className={INPUT}
          name="code"
          inputMode="text"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </Field>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={pending || code.trim().length < 6}>
        {pending ? "Đang xác thực…" : "Xác nhận"}
      </Button>
      <Button type="button" variant="ghost" onClick={() => onRestart()}>
        Quay lại đăng nhập
      </Button>
    </form>
  );
}

/** QR vẽ ngay trong trình duyệt từ `otpAuthUri` (secret không gửi đi đâu) + secret dạng chữ để nhập tay. */
function TotpEnrollment({ otpAuthUri }: { otpAuthUri: string }) {
  const [qr, setQr] = useState<string>();
  const secret = secretOf(otpAuthUri);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(otpAuthUri, { margin: 1, width: 192 })
      .then((url) => active && setQr(url))
      .catch(() => active && setQr(undefined));
    return () => {
      active = false;
    };
  }, [otpAuthUri]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-4">
      {qr ? (
        // Data URL sinh tại chỗ → <img> thường, không qua next/image.
        <img src={qr} alt="Mã QR thiết lập xác thực hai lớp" width={192} height={192} />
      ) : (
        <div className="size-48 animate-pulse rounded bg-muted" aria-hidden />
      )}
      {secret && (
        <p className="text-center text-xs text-vxn-fg-4">
          Không quét được? Nhập khoá thủ công:
          <code className="mt-1 block font-mono text-sm tracking-wider break-all text-vxn-ink">{secret}</code>
        </p>
      )}
    </div>
  );
}

function BackupCodesStep({ codes, onContinue }: { codes: string[]; onContinue: () => Promise<void> }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="Mã dự phòng"
        description="Mỗi mã dùng được một lần khi không có điện thoại. Mã chỉ hiển thị lần này — hãy lưu ở nơi an toàn."
      />
      <ul className="grid grid-cols-1 gap-1.5 rounded-lg border bg-muted/30 p-3 font-mono text-sm text-vxn-ink">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <Button type="button" variant="outline" onClick={() => void copy()}>
        {copied ? "Đã sao chép" : "Sao chép mã"}
      </Button>
      <Button type="button" onClick={() => void onContinue()}>
        Tôi đã lưu mã, vào trang quản lý
      </Button>
    </div>
  );
}

const INPUT =
  "h-10 w-full rounded-md border bg-background px-3 text-sm text-vxn-ink outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive";

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-vxn-ink">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-vxn-fg-2">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-vxn-fg-5">{hint}</span>}
    </label>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-md bg-vxn-teal-50 px-3 py-2 text-sm text-vxn-teal-800">
      {children}
    </p>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {children}
    </p>
  );
}

function secretOf(otpAuthUri: string): string | undefined {
  try {
    return new URL(otpAuthUri).searchParams.get("secret") ?? undefined;
  } catch {
    return undefined;
  }
}

/** Thông báo chung, không lộ tài khoản có tồn tại hay không (06 UI §7). */
function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "AUTH_ACCOUNT_LOCKED") {
      return "Tài khoản đã bị khóa hoặc vô hiệu hóa. Vui lòng liên hệ quản trị nền tảng.";
    }
    if (error.code === "AUTH_PASSWORD_CHANGE_REQUIRED") {
      return error.message;
    }
    if (error.status === 401) {
      return "Tên đăng nhập hoặc mật khẩu không đúng.";
    }
    if (error.status === 429) {
      return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút.";
    }
    if (error.status === 403) {
      return "Yêu cầu bị từ chối. Vui lòng tải lại trang rồi thử lại.";
    }
  }
  return "Không thể kết nối máy chủ. Vui lòng thử lại.";
}
