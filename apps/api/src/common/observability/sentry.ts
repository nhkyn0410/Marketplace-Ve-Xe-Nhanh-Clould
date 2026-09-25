import * as Sentry from "@sentry/nestjs";
import type { AppConfig } from "../../config/env.config";

type RuntimeName = "api" | "worker";

let initialized = false;

export function initSentry(
  config: Pick<
    AppConfig,
    | "NODE_ENV"
    | "SENTRY_DSN"
    | "SENTRY_ENVIRONMENT"
    | "SENTRY_TRACES_SAMPLE_RATE"
    | "OTEL_SERVICE_NAME"
  >,
  runtime: RuntimeName
): void {
  if (initialized || !config.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.SENTRY_ENVIRONMENT ?? config.NODE_ENV,
    tracesSampleRate: config.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
    // Mặc định SDK đính kèm body request (≤10KB) vào event lỗi — với route auth đó là password,
    // OTP, refresh token, mã MFA, challenge token gửi sang bên thứ ba. `sendDefaultPii` KHÔNG tắt được.
    integrations: [Sentry.httpIntegration({ maxIncomingRequestBodySize: "none" })],
    // NodeFetch (mặc định) ghi breadcrumb + span cho request đi ra kèm URL đầy đủ — vendor như Goong đặt
    // key ở query (`api_key=`), nên phải che trước khi rời process (TASK-TRN-002 security M1).
    beforeBreadcrumb: scrubBreadcrumb,
    beforeSend: scrubSentryEvent,
    beforeSendTransaction: scrubSentryEvent
  });
  Sentry.setTag("service", config.OTEL_SERVICE_NAME);
  Sentry.setTag("runtime", runtime);

  initialized = true;
}

const SENSITIVE_HEADERS = ["authorization", "cookie", "x-api-key", "x-bull-board-token"];

// Query param mang secret trong URL (vd. Goong `api_key=`); giữ tên param để còn debug được. Khớp cả
// chuỗi query không có `?` đầu (span attribute `http.query` có thể ở dạng `a=1&api_key=…`).
const SECRET_QUERY_PARAM = /((?:^|[?&])(?:api_key|apikey|api-key|key|access_token|token|secret)=)[^&#\s"']*/gi;

/** Che giá trị query param mang secret trong một chuỗi URL/mô tả. */
export function redactSecretQuery(value: string): string {
  return value.replace(SECRET_QUERY_PARAM, "$1[Filtered]");
}

type Scrubbable = { data?: Record<string, unknown>; message?: string; description?: string };

function scrubStrings<T extends Scrubbable>(item: T): T {
  if (typeof item.message === "string") item.message = redactSecretQuery(item.message);
  if (typeof item.description === "string") item.description = redactSecretQuery(item.description);
  for (const [key, value] of Object.entries(item.data ?? {})) {
    if (typeof value === "string") item.data![key] = redactSecretQuery(value);
  }
  return item;
}

/** Che secret trong URL của breadcrumb (fetch/http đi ra) trước khi SDK lưu nó. */
export function scrubBreadcrumb<T extends Scrubbable>(breadcrumb: T): T {
  return scrubStrings(breadcrumb);
}

/**
 * Lớp chặn cuối: bỏ body + header mang credential khỏi event, và che secret trong URL ở breadcrumb /
 * span / request, dù integration nào đã gắn vào.
 */
export function scrubSentryEvent<
  T extends {
    request?: { data?: unknown; headers?: Record<string, string>; url?: string; query_string?: unknown };
    breadcrumbs?: Scrubbable[];
    spans?: Scrubbable[];
    contexts?: { trace?: Scrubbable };
  }
>(event: T): T {
  if (event.request) {
    delete event.request.data;
    for (const name of Object.keys(event.request.headers ?? {})) {
      if (SENSITIVE_HEADERS.includes(name.toLowerCase())) {
        delete event.request.headers![name];
      }
    }
    if (typeof event.request.url === "string") event.request.url = redactSecretQuery(event.request.url);
    if (typeof event.request.query_string === "string") {
      event.request.query_string = redactSecretQuery(`?${event.request.query_string}`).slice(1);
    }
  }
  event.breadcrumbs?.forEach(scrubStrings);
  event.spans?.forEach(scrubStrings);
  if (event.contexts?.trace) scrubStrings(event.contexts.trace);
  return event;
}

export function isSentryInitialized(): boolean {
  return initialized;
}
