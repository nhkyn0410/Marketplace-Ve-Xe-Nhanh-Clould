/**
 * Cửa duy nhất để code domain dùng enum/kiểu của Prisma.
 * Luật lint `api-db-driver-boundary` chặn mọi import từ `generated/prisma/` ngoài
 * `src/database/` — kể cả `import type` — để Prisma không rò khắp domain.
 */
export {
  CatalogStatus,
  EmployeeRole,
  OperatorRole,
  PlatformRole,
  SessionRevokeReason,
  StopPointType,
  SubjectType,
} from "../generated/prisma/client";
export type { AuthSession } from "../generated/prisma/client";
