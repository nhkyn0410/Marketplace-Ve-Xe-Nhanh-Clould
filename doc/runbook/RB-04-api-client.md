---
id: RB-04
title: Sinh lại API client (TS + Dart) sau khi đổi API
match:
  - gen:api-client
  - openapi:generate
  - openapi-generator-cli
  - build_runner
---

# RB-04 — Sinh lại API client (TS + Dart)

**Mục đích:** giữ client Web (TS) và Mobile (Dart) khớp với OpenAPI của backend. Contract CI sẽ đỏ nếu lệch.
**Điều kiện:** đổi xong Zod DTO/controller ở `apps/api`. Có Docker để sinh client Dart.

## Các bước

1. Sinh `openapi.json` + client TS: `pnpm gen:api-client`
2. Sinh client Dart. Dùng **đúng** bản `v7.25.0`, không dùng `latest`:
   ```powershell
   docker run --rm -v "${PWD}/packages/api-client/src/generated:/spec" -v "${PWD}/packages/api_client_dart:/out" openapitools/openapi-generator-cli:v7.25.0 generate -i /spec/openapi.json -g dart-dio -o /out --additional-properties=pubName=api_client_dart,pubLibrary=api_client_dart
   ```
3. Sinh code phụ (built_value) và kiểm tra:
   `cd packages/api_client_dart; dart pub get; dart run build_runner build; dart analyze`
4. Commit cùng lúc: DTO backend, `packages/api-client/src/generated/`, `packages/api_client_dart/`.

## Kiểm tra

- `dart analyze` báo 0 lỗi; cảnh báo `unused_import` thì bỏ qua được.
- `git status` chỉ đổi những endpoint vừa sửa. Nếu đổi hàng loạt thì nhiều khả năng generator đã bị đổi bản.

## Lỗi hay gặp

- CI "Contract" đỏ: quên chạy bước 2 hoặc 3. Sinh lại rồi commit.
- Không có Docker (vd. môi trường cloud): chạy thẳng file jar cùng bản, cần Java 11+:
  `java -jar openapi-generator-cli-7.25.0.jar generate -i packages/api-client/src/generated/openapi.json -g dart-dio -o <thư-mục-tạm> --additional-properties=pubName=api_client_dart,pubLibrary=api_client_dart`
  (jar tải từ Maven Central `org/openapitools/openapi-generator-cli/7.25.0/`, đối chiếu file `.sha1` cạnh jar). Sinh vào thư mục tạm rồi chỉ chép **file mới** + file `lib/` / `README.md` đổi; giữ test cũ và bỏ dòng `test/`, `.openapi-generator-ignore` khỏi `.openapi-generator/FILES` — giống kết quả khi sinh đè bằng Docker.
- Cảnh báo "OpenAPI 3.1 support is still in beta" là bình thường. Nếu nâng bản generator thì phải chạy lại cả `dart analyze`.

**Liên quan:** ADR-012 (OpenAPI 3.1 là nguồn duy nhất) · ADR-028 · `.github/workflows/contract.yml` · `doc/task-propreties/FND-009-guide.md` §3
