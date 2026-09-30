import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { describe, expect, it } from "vitest";
import { buildOpenApiDocument, configureApiRoutes } from "./openapi";
import { OpenApiModule } from "./openapi.module";

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "generated" ? [] : sourceFiles(path);
    }
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".spec.ts") ? [path] : [];
  });
}

describe("OpenAPI generation", () => {
  it("tên class Zod DTO là duy nhất trong src/ — trùng tên thì schema OpenAPI bị ghi đè im lặng", () => {
    // Đã xảy ra thật (TRN-002): `StopPointListResponseDto` của catalog công khai và của điểm riêng Operator
    // trùng tên → client sinh ra mang sai field cho `/catalog/stop-points` mà spec vẫn "hợp lệ".
    const names = sourceFiles(resolve(__dirname, "..")).flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(/export class (\w+) extends createZodDto/g)].map((match) => match[1]!),
    );
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    expect(duplicates).toEqual([]);
    expect(names.length).toBeGreaterThan(20);
  });

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
        "/v1/auth/oauth/session",
        "/v1/auth/operator/login",
        "/v1/auth/employee/login",
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
        "/v1/auth/employee/login",
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
            expect.arrayContaining(["passwordChangeRequired", "passwordChangeToken", "passwordChangeExpiresIn"]),
            // IAM-006 cookie mode: phiên nằm trong cookie, body chỉ metadata.
            expect.arrayContaining(["authenticated", "scope", "role", "expiresIn", "refreshExpiresIn"])
          ])
        );
      }
      expect(schemas?.MfaVerifyDto?.required).toEqual(expect.arrayContaining(["challengeToken", "code"]));
      // MFA verify / refresh: token JSON (Mobile) HOẶC metadata phiên web (cookie) — client thấy cả hai nhánh.
      const mfaVariants = schemas?.MfaVerifyResponseDto_Output?.anyOf ?? [];
      expect(mfaVariants.map((variant) => variant.required ?? [])).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(["accessToken", "refreshToken"]),
          expect.arrayContaining(["authenticated", "expiresIn"])
        ])
      );
      expect(mfaVariants.every((variant) => variant.properties?.backupCodes)).toBe(true);
      const refreshVariants = schemas?.RefreshResponseDto_Output?.anyOf ?? [];
      expect(refreshVariants.map((variant) => variant.required ?? [])).toEqual(
        expect.arrayContaining([
          expect.arrayContaining(["accessToken", "refreshToken"]),
          expect.arrayContaining(["authenticated", "refreshExpiresIn"])
        ])
      );
      // Bearer mode vẫn gửi refreshToken trong body; cookie mode không → field optional.
      expect(schemas?.RefreshTokenDto?.properties?.refreshToken).toBeDefined();
      expect(schemas?.RefreshTokenDto?.required ?? []).not.toContain("refreshToken");

      // IAM-006: bootstrap web — /auth/csrf công khai, /auth/me cần đăng nhập; header transport được khai.
      expect(document.paths["/v1/auth/csrf"]?.get?.security).toBeUndefined();
      expect(document.paths["/v1/auth/csrf"]?.get?.responses?.[200]).toBeDefined();
      expect(document.paths["/v1/auth/me"]?.get?.security).toEqual([{ bearer: [] }]);
      expect(schemas?.AuthMeResponseDto_Output?.required).toEqual(
        expect.arrayContaining(["subjectId", "scope", "role", "username", "sessionId", "accessExpiresAt", "mfaVerified"])
      );
      for (const path of [
        "/v1/auth/operator/login",
        "/v1/auth/platform/login",
        "/v1/auth/mfa/verify",
        "/v1/auth/password/change-required",
        "/v1/auth/refresh",
        "/v1/auth/logout",
        "/v1/auth/re-auth"
      ]) {
        const headers = (document.paths[path]?.post?.parameters ?? []).map((param) =>
          "in" in param && param.in === "header" ? param.name : ""
        );
        expect(headers, `${path} thiếu header dual transport`).toEqual(
          expect.arrayContaining(["X-Auth-Transport", "X-CSRF-Token"])
        );
      }
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

      // CAT-001 (API §7.6): catalog đọc công khai — có route, KHÔNG security, query khai tường minh
      // (tsx không có `design:paramtypes` nên `@Query()` DTO không tự sinh param).
      const catalogQueries: Record<string, string[]> = {
        "/v1/catalog/provinces": [],
        "/v1/catalog/wards": ["provinceId"],
        "/v1/catalog/stop-points": ["provinceId", "wardId", "type", "cursor", "limit"],
        "/v1/catalog/vehicle-types": [],
        "/v1/catalog/amenities": []
      };
      for (const [path, names] of Object.entries(catalogQueries)) {
        const get = document.paths[path]?.get;
        expect(get, `thiếu GET ${path} — nhớ thêm CatalogController vào OpenApiModule`).toBeDefined();
        expect(get?.security, `${path} là route công khai`).toBeUndefined();
        expect(get?.responses?.[200]).toBeDefined();
        const declared = (get?.parameters ?? []).map((param) => ("name" in param ? param.name : ""));
        expect(declared.sort(), `${path} thiếu @ApiQuery`).toEqual([...names].sort());
      }
      expect(schemas?.StopPointListResponseDto_Output?.required).toEqual(
        expect.arrayContaining(["items", "nextCursor"])
      );
      // Catalog công khai chỉ có field công khai — không lẫn schema điểm riêng của Operator (status, timestamp).
      const catalogItem = (
        schemas?.StopPointListResponseDto_Output?.properties?.items as { items?: Schema } | undefined
      )?.items;
      expect(Object.keys(catalogItem?.properties ?? {}).sort()).toEqual(
        ["address", "description", "id", "latitude", "longitude", "name", "provinceId", "type", "wardId"]
      );

      // TRN-001/TRN-002/TRN-003 (API §7.3): Vehicle/SeatMap/Route/StopPoint/Trip — Bearer, requestBody cho
      // POST/PUT, path param khai báo.
      for (const [collection, param] of [
        ["/v1/operator/vehicles", "vehicleId"],
        ["/v1/operator/seat-maps", "seatMapId"],
        ["/v1/operator/routes", "routeId"],
        ["/v1/operator/stop-points", "stopPointId"],
        ["/v1/operator/trips", "tripId"],
        ["/v1/operator/fares", "fareId"]
      ] as const) {
        const item = `${collection}/{${param}}`;
        for (const operation of [
          document.paths[collection]?.get,
          document.paths[collection]?.post,
          document.paths[item]?.get,
          document.paths[item]?.put
        ]) {
          expect(operation, `thiếu route ${collection} — nhớ thêm controller vào OpenApiModule`).toBeDefined();
          expect(operation?.security).toEqual([{ bearer: [] }]);
        }
        expect(document.paths[collection]?.post?.requestBody, `POST ${collection} thiếu @ApiBody`).toBeDefined();
        expect(document.paths[item]?.put?.requestBody, `PUT ${item} thiếu @ApiBody`).toBeDefined();
        const params = (document.paths[item]?.put?.parameters ?? []).map((p) => ("name" in p ? p.name : ""));
        expect(params, `thiếu @ApiParam ${param}`).toContain(param);
      }
      // Đề xuất StopPoint: không có GET/{id}; PUT chỉ để gửi lại bản bị từ chối.
      const proposals = "/v1/operator/stop-point-proposals";
      for (const operation of [
        document.paths[proposals]?.get,
        document.paths[proposals]?.post,
        document.paths[`${proposals}/{proposalId}`]?.put
      ]) {
        expect(operation, `thiếu route ${proposals}`).toBeDefined();
        expect(operation?.security).toEqual([{ bearer: [] }]);
      }
      expect(document.paths[proposals]?.post?.requestBody).toBeDefined();
      expect(document.paths[`${proposals}/{proposalId}`]?.put?.requestBody).toBeDefined();
      // Route lỗi Goong phải công bố 503 để client xử lý "thử lại sau".
      expect(document.paths["/v1/operator/routes"]?.post?.responses?.[503]).toBeDefined();
      // TRN-003: trùng xe (409) và route/xe không dùng được (422) phải có trong hợp đồng; list lọc theo giờ đi.
      for (const operation of [
        document.paths["/v1/operator/trips"]?.post,
        document.paths["/v1/operator/trips/{tripId}"]?.put
      ]) {
        expect(operation?.responses?.[409]).toBeDefined();
        expect(operation?.responses?.[422]).toBeDefined();
      }
      const tripQuery = (document.paths["/v1/operator/trips"]?.get?.parameters ?? []).map((p) => ("name" in p ? p.name : ""));
      expect(tripQuery).toEqual(
        expect.arrayContaining(["routeId", "vehicleId", "status", "departureFrom", "departureTo", "cursor", "limit"])
      );
      // TRN-005: lịch sử giá có route riêng; giá ghế của chuyến có trong hợp đồng (số nguyên đồng, có thể null).
      const revisions = document.paths["/v1/operator/fares/{fareId}/revisions"]?.get;
      expect(revisions, "thiếu route lịch sử giá").toBeDefined();
      expect(revisions?.security).toEqual([{ bearer: [] }]);
      const tripSeat = (
        schemas?.TripResponseDto_Output?.properties?.seats as { items?: Schema } | undefined
      )?.items;
      expect(Object.keys(tripSeat?.properties ?? {})).toContain("price");
      expect(document.paths["/v1/operator/fares"]?.post?.responses?.[409]).toBeDefined();
      // Review TRN-005: ghi lịch sử lỗi / chậm → 503 (bảng giá không đổi); trang lịch sử tối đa 20.
      expect(document.paths["/v1/operator/fares"]?.post?.responses?.[503]).toBeDefined();
      expect(document.paths["/v1/operator/fares/{fareId}"]?.put?.responses?.[503]).toBeDefined();
      const revisionLimit = revisions?.parameters?.find((parameter) => "name" in parameter && parameter.name === "limit");
      expect(revisionLimit && "schema" in revisionLimit ? revisionLimit.schema : undefined).toMatchObject({ maximum: 20 });
      // TRN-006: đổi trạng thái bán + khóa ghế — Bearer, requestBody, path param; lỗi nghiệp vụ trong hợp đồng.
      const tripStatus = document.paths["/v1/operator/trips/{tripId}/status"]?.put;
      const seatStatus = document.paths["/v1/operator/trips/{tripId}/seats/status"]?.put;
      for (const [name, operation, codes] of [
        ["status", tripStatus, [400, 404, 409, 422, 503]],
        ["seats/status", seatStatus, [400, 404, 409, 422]]
      ] as const) {
        expect(operation, `thiếu route PUT /trips/{tripId}/${name}`).toBeDefined();
        expect(operation?.security).toEqual([{ bearer: [] }]);
        expect(operation?.requestBody, `PUT ${name} thiếu @ApiBody`).toBeDefined();
        expect((operation?.parameters ?? []).map((p) => ("name" in p ? p.name : ""))).toContain("tripId");
        for (const code of codes) {
          expect(operation?.responses?.[code], `PUT ${name} thiếu ${code}`).toBeDefined();
        }
      }
      expect(document.paths["/v1/operator/trips/{tripId}"]?.put?.responses?.[409]).toBeDefined();
      expect(Object.keys(schemas?.TripResponseDto_Output?.properties ?? {})).toEqual(
        expect.arrayContaining(["onlineSaleCutoffMinutes", "statusReason"])
      );
      // API §6.2: `reasons` là member mở rộng của Problem Details.
      expect(Object.keys(schemas?.ProblemDetailsDto?.properties ?? {})).toContain("reasons");
    } finally {
      await app.close();
    }
  });
});
