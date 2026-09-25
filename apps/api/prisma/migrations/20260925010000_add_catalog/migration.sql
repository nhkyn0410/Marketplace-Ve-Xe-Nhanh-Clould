-- TASK-CAT-001 — Catalog chuẩn Platform (DB §5.2, DB-MIG-04): provinces, wards, stop_points_catalog,
-- vehicle_types, amenities. KHÔNG `operator_id`. Không xoá cứng — vô hiệu hoá bằng `status` (UC-24 A1).

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StopPointType" AS ENUM ('BUS_STATION', 'OFFICE', 'REST_STOP', 'PICKUP_POINT');

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop_points_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StopPointType" NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stop_points_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wards_code_key" ON "wards"("code");

-- CreateIndex
CREATE INDEX "wards_province_id_idx" ON "wards"("province_id");

-- CreateIndex
CREATE UNIQUE INDEX "wards_id_province_id_key" ON "wards"("id", "province_id");

-- CreateIndex
CREATE INDEX "stop_points_catalog_province_id_status_idx" ON "stop_points_catalog"("province_id", "status");

-- CreateIndex
CREATE INDEX "stop_points_catalog_ward_id_idx" ON "stop_points_catalog"("ward_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_code_key" ON "vehicle_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "amenities_code_key" ON "amenities"("code");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — FK ghép: `province_id` của stop point phải đúng tỉnh của phường (UC-24 A2). Tỉnh
-- được đảm bảo tồn tại gián tiếp qua `wards_province_id_fkey`.
ALTER TABLE "stop_points_catalog" ADD CONSTRAINT "stop_points_catalog_ward_id_province_id_fkey" FOREIGN KEY ("ward_id", "province_id") REFERENCES "wards"("id", "province_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ── Toạ độ trong phạm vi hợp lệ (Prisma không sinh CHECK) ──
ALTER TABLE "stop_points_catalog" ADD CONSTRAINT "stop_points_catalog_latitude_range"
  CHECK ("latitude" BETWEEN -90 AND 90);
ALTER TABLE "stop_points_catalog" ADD CONSTRAINT "stop_points_catalog_longitude_range"
  CHECK ("longitude" BETWEEN -180 AND 180);

-- ── RLS (quyết định Q3): cùng mẫu `operator_profiles` — ai cũng ĐỌC, chỉ platform/system được GHI ──
-- Role app có quyền CRUD mọi bảng (db-app-role.mjs); thiếu policy thì một bug ở route tenant/Guest sửa
-- được catalog toàn hệ thống. FORCE để áp cả owner không phải superuser.
ALTER TABLE "provinces" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provinces" FORCE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "provinces" FOR SELECT
  USING (true);
CREATE POLICY "platform_insert" ON "provinces" FOR INSERT
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_update" ON "provinces" FOR UPDATE
  USING (current_setting('app.scope', true) IN ('platform', 'system'))
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_delete" ON "provinces" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));

ALTER TABLE "wards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wards" FORCE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "wards" FOR SELECT
  USING (true);
CREATE POLICY "platform_insert" ON "wards" FOR INSERT
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_update" ON "wards" FOR UPDATE
  USING (current_setting('app.scope', true) IN ('platform', 'system'))
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_delete" ON "wards" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));

ALTER TABLE "stop_points_catalog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stop_points_catalog" FORCE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "stop_points_catalog" FOR SELECT
  USING (true);
CREATE POLICY "platform_insert" ON "stop_points_catalog" FOR INSERT
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_update" ON "stop_points_catalog" FOR UPDATE
  USING (current_setting('app.scope', true) IN ('platform', 'system'))
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_delete" ON "stop_points_catalog" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));

ALTER TABLE "vehicle_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_types" FORCE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "vehicle_types" FOR SELECT
  USING (true);
CREATE POLICY "platform_insert" ON "vehicle_types" FOR INSERT
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_update" ON "vehicle_types" FOR UPDATE
  USING (current_setting('app.scope', true) IN ('platform', 'system'))
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_delete" ON "vehicle_types" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));

ALTER TABLE "amenities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amenities" FORCE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON "amenities" FOR SELECT
  USING (true);
CREATE POLICY "platform_insert" ON "amenities" FOR INSERT
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_update" ON "amenities" FOR UPDATE
  USING (current_setting('app.scope', true) IN ('platform', 'system'))
  WITH CHECK (current_setting('app.scope', true) IN ('platform', 'system'));
CREATE POLICY "platform_delete" ON "amenities" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));
