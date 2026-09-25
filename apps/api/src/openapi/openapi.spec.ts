import { NestFactory } from "@nestjs/core";
import { describe, expect, it } from "vitest";
import { buildOpenApiDocument, configureApiRoutes } from "./openapi";
import { OpenApiModule } from "./openapi.module";

describe("OpenAPI generation", () => {
  it("generates an OpenAPI 3.1 contract from Zod DTO metadata", async () => {
    const app = await NestFactory.create(OpenApiModule, { logger: false });

    try {
      configureApiRoutes(app);

      const document = buildOpenApiDocument(app);

      expect(document.openapi).toBe("3.1.0");
      expect(document.paths["/v1/health"]?.get?.responses[200]).toBeDefined();
      expect(document.components?.schemas?.HealthResponseDto_Output).toBeDefined();
      expect(document.components?.schemas?.ProblemDetailsDto).toBeDefined();

      // 9 endpoint auth trong phạm vi API §7.1 phải có mặt (`/auth/mfa/verify` = IAM-004): thiếu
      // chúng thì `gen:api-client` sinh client không có auth mà CI vẫn xanh — lỗi im lặng đã từng xảy ra thật.
      for (const path of [
        "/v1/auth/register",
        "/v1/auth/otp/request",
        "/v1/auth/otp/verify",
        "/v1/auth/oauth/{provider}",
        "/v1/auth/operator/login",
        "/v1/auth/platform/login",
        "/v1/auth/refresh",
        "/v1/auth/logout",
        "/v1/auth/re-auth",
        "/v1/auth/mfa/verify",
        "/v1/auth/password/change-required",
        "/v1/operator/employees",
        "/v1/operator/employees/{employeeId}/password-reset"
      ]) {
        expect(document.paths[path]?.post, `thiếu POST ${path} trong OpenAPI`).toBeDefined();
      }
      expect(document.paths["/v1/auth/sessions"]?.get).toBeDefined();
      expect(document.paths["/v1/auth/sessions/{sessionId}"]?.delete).toBeDefined();
      expect(document.paths["/v1/operator/employees"]?.get).toBeDefined();
      expect(document.paths["/v1/operator/employees/{employeeId}"]?.patch).toBeDefined();

      // `requestBody` phải có: script gen chạy bằng tsx (esbuild) nên KHÔNG có `design:paramtypes`
      // → @nestjs/swagger không suy ra được kiểu của `@Body()`. Thiếu `@ApiBody` thì spec vẫn hợp lệ
      // và CI vẫn xanh, nhưng client sinh ra (TS lẫn Dart) mất sạch payload — đã xảy ra thật, phát
      // hiện khi spike openapi-generator 09/09/2026.
      for (const path of [
        "/v1/auth/register",
        "/v1/auth/otp/request",
        "/v1/auth/otp/verify",
        "/v1/auth/oauth/{provider}",
        "/v1/auth/operator/login",
        "/v1/auth/platform/login",
        "/v1/auth/refresh",
        "/v1/auth/re-auth",
        "/v1/auth/mfa/verify",
        "/v1/auth/password/change-required",
        "/v1/operator/employees",
        "/v1/operator/employees/{employeeId}/password-reset"
      ]) {
        expect(
          document.paths[path]?.post?.requestBody,
          `POST ${path} thiếu requestBody — nhớ @ApiBody({ type: ... })`
        ).toBeDefined();
      }
      expect(document.paths["/v1/operator/employees/{employeeId}"]?.patch?.requestBody).toBeDefined();

      // Path param phải được khai báo, nếu không spec KHÔNG hợp lệ (openapi-generator từ chối) và
      // client sinh ra gọi URL chứa literal "{provider}".
      // Login trả CẶP token: thiếu `refreshToken` trong schema thì client gen ra không lưu được nó.
      // Kiểm đúng schema response: chuỗi "refreshToken" cũng có trong RefreshTokenDto (request).
      const tokenResponse = document.components?.schemas?.AuthTokenResponseDto_Output as
        | { properties?: Record<string, unknown>; required?: string[] }
        | undefined;
      expect(tokenResponse?.properties?.refreshToken).toBeDefined();
      expect(tokenResponse?.required).toEqual(
        expect.arrayContaining(["refreshToken", "refreshExpiresIn"])
      );

      // Endpoint cần đăng nhập phải khai bearer — client gen dựa vào đây để gắn header.
      for (const path of ["/v1/auth/logout", "/v1/auth/re-auth"]) {
        expect(document.paths[path]?.post?.security, `${path} thiếu @ApiBearerAuth()`).toEqual([
          { bearer: [] }
        ]);
      }
      for (const path of ["/v1/auth/sessions", "/v1/operator/employees"]) {
        expect(document.paths[path]?.get?.security, `${path} thiếu bearer`).toEqual([{ bearer: [] }]);
      }
      expect(document.paths["/v1/auth/sessions/{sessionId}"]?.delete?.security).toEqual([{ bearer: [] }]);
      expect(document.paths["/v1/operator/employees/{employeeId}"]?.patch?.security).toEqual([{ bearer: [] }]);
      expect(document.components?.securitySchemes?.bearer).toBeDefined();

      // IAM-004: login Operator/Platform trả token HOẶC MFA challenge — client phải thấy cả hai nhánh,
      // thiếu nhánh challenge thì client gen ra không đọc được `challengeToken` (không login nổi owner/admin).
      type Schema = { properties?: Record<string, unknown>; required?: string[]; anyOf?: Schema[] };
      const schemas = document.components?.schemas as Record<string, Schema> | undefined;
      for (const path of ["/v1/auth/operator/login", "/v1/auth/platform/login"]) {
        const ref = (
          document.paths[path]?.post?.responses?.[200] as {
            content?: Record<string, { schema?: { $ref?: string } }>;
          }
        )?.content?.["application/json"]?.schema?.$ref;
        const variants = schemas?.[ref?.split("/").pop() ?? ""]?.anyOf ?? [];
        expect(variants.map((variant) => variant.required ?? []), path).toEqual(
          expect.arrayContaining([
            expect.arrayContaining(["accessToken", "refreshToken", "mfaRequired"]),
            expect.arrayContaining(["mfaRequired", "challengeToken", "challengeExpiresIn"]),
            expect.arrayContaining(["passwordChangeRequired", "passwordChangeToken", "passwordChangeExpiresIn"])
          ])
        );
      }
      expect(schemas?.MfaVerifyDto?.required).toEqual(expect.arrayContaining(["challengeToken", "code"]));
      expect(schemas?.MfaVerifyResponseDto_Output?.properties?.backupCodes).toBeDefined();
      expect(schemas?.ReauthDto?.properties?.mfaCode).toBeDefined();
      expect(schemas?.PasswordChangeRequiredDto?.required).toEqual(
        expect.arrayContaining(["passwordChangeToken", "newPassword"])
      );
      // Verify dùng challenge token trong body, KHÔNG dùng Bearer (chưa có access token ở bước này).
      expect(document.paths["/v1/auth/mfa/verify"]?.post?.security).toBeUndefined();
      expect(document.paths["/v1/auth/password/change-required"]?.post?.security).toBeUndefined();

      const oauthParams = document.paths["/v1/auth/oauth/{provider}"]?.post?.parameters ?? [];
      expect(
        oauthParams.some((param) => "name" in param && param.name === "provider"),
        "thiếu @ApiParam cho {provider}"
      ).toBe(true);
    } finally {
      await app.close();
    }
  });
});
