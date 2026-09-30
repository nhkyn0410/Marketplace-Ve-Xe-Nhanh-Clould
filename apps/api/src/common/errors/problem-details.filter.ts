import { STATUS_CODES } from "node:http";
import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { SentryExceptionCaptured } from "@sentry/nestjs";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import type { Request, Response } from "express";
import { getCurrentTraceId } from "../observability/tracing";
import { getRequestId } from "../observability/request-context";

const PROBLEM_CONTENT_TYPE = "application/problem+json";

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  reasons?: string[];
  requestId?: string;
  traceId?: string;
};

type HttpExceptionResponse = {
  type?: unknown;
  title?: unknown;
  status?: unknown;
  statusCode?: unknown;
  detail?: unknown;
  message?: unknown;
  error?: unknown;
  code?: unknown;
  reasons?: unknown;
};

type RequestInfo = Pick<Request, "originalUrl" | "url">;

@Catch()
export class ProblemDetailsExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const problem = buildProblemDetails(exception, request);

    annotateActiveSpan(problem);

    if (response.headersSent) {
      return;
    }

    response.setHeader("Content-Type", PROBLEM_CONTENT_TYPE);
    response.status(problem.status).json(problem);
  }
}

export function buildProblemDetails(exception: unknown, request: RequestInfo): ProblemDetails {
  const status = getHttpStatus(exception);
  const response = getHttpExceptionResponse(exception);
  const title = getProblemTitle(status, response);

  return {
    type: getProblemType(response),
    title,
    status,
    detail: getProblemDetail(status, exception, response),
    instance: request.originalUrl || request.url,
    code: getProblemCode(status, response, title),
    ...getProblemReasons(response),
    requestId: getRequestId(),
    traceId: getCurrentTraceId()
  };
}

function getHttpStatus(exception: unknown): number {
  if (exception instanceof HttpException) {
    return exception.getStatus();
  }

  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function getHttpExceptionResponse(exception: unknown): HttpExceptionResponse | undefined {
  if (!(exception instanceof HttpException)) {
    return undefined;
  }

  const response = exception.getResponse();

  if (typeof response === "string") {
    return { detail: response };
  }

  if (typeof response === "object" && response !== null) {
    return response as HttpExceptionResponse;
  }

  return undefined;
}

function getProblemType(response: HttpExceptionResponse | undefined): string {
  return typeof response?.type === "string" ? response.type : "about:blank";
}

function getProblemTitle(status: number, response: HttpExceptionResponse | undefined): string {
  if (typeof response?.title === "string") {
    return response.title;
  }

  if (typeof response?.error === "string") {
    return response.error;
  }

  return STATUS_CODES[status] ?? "Error";
}

function getProblemDetail(
  status: number,
  exception: unknown,
  response: HttpExceptionResponse | undefined
): string {
  if (typeof response?.detail === "string") {
    return response.detail;
  }

  const message = response?.message;

  if (Array.isArray(message)) {
    return message.map(String).join("; ");
  }

  if (typeof message === "string") {
    return message;
  }

  if (exception instanceof HttpException && exception.message) {
    return exception.message;
  }

  if (status >= 500) {
    return "Internal server error.";
  }

  return STATUS_CODES[status] ?? "Error";
}

function getProblemCode(
  status: number,
  response: HttpExceptionResponse | undefined,
  title: string
): string {
  if (typeof response?.code === "string") {
    return response.code;
  }

  return toErrorCode(STATUS_CODES[status] ?? title);
}

// Member mở rộng RFC 7807 (API §6.2): chỉ nhận mảng chuỗi để không lộ object nội bộ ra client.
function getProblemReasons(response: HttpExceptionResponse | undefined): { reasons?: string[] } {
  const reasons = response?.reasons;
  return Array.isArray(reasons) && reasons.every((reason) => typeof reason === "string") ? { reasons } : {};
}

function toErrorCode(value: string): string {
  const code = value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return code || "UNKNOWN_ERROR";
}

function annotateActiveSpan(problem: ProblemDetails): void {
  const activeSpan = trace.getActiveSpan();

  if (!activeSpan) {
    return;
  }

  activeSpan.setAttribute("http.response.status_code", problem.status);
  activeSpan.setAttribute("error.code", problem.code);

  if (problem.requestId) {
    activeSpan.setAttribute("request.id", problem.requestId);
  }

  if (problem.status >= 500) {
    activeSpan.setStatus({ code: SpanStatusCode.ERROR, message: problem.title });
  }
}
