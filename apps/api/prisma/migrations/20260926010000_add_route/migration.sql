-- TASK-TRN-002 — Route + RouteStop + StopPoint riêng + đề xuất StopPoint (DB §5.2/§7, ADR-027).
-- Operator-owned: mọi bảng có `operator_id` + RLS. FK ghép `(…, operator_id)` chặn gắn chéo tenant.

-- CreateEnum
CREATE TYPE "StopPointStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StopPointProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RouteStopRole" AS ENUM ('ORIGIN', 'INTERMEDIATE', 'DESTINATION');

-- CreateEnum
CREATE TYPE "RoutingMetricsSource" AS ENUM ('GOONG', 'ESTIMATE');

-- CreateTable
CREATE TABLE "stop_points" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StopPointType" NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "StopPointStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stop_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop_point_proposals" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StopPointType" NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "StopPointProposalStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "catalog_stop_point_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stop_point_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "total_distance_meters" INTEGER NOT NULL,
    "total_duration_seconds" INTEGER NOT NULL,
    "metrics_source" "RoutingMetricsSource" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" "RouteStopRole" NOT NULL,
    "catalog_stop_point_id" TEXT,
    "stop_point_id" TEXT,
    "note" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distance_meters_from_previous" INTEGER,
    "duration_seconds_from_previous" INTEGER,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stop_points_operator_id_status_idx" ON "stop_points"("operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "stop_points_operator_id_name_key" ON "stop_points"("operator_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "stop_points_id_operator_id_key" ON "stop_points"("id", "operator_id");

-- CreateIndex
CREATE INDEX "stop_point_proposals_operator_id_status_idx" ON "stop_point_proposals"("operator_id", "status");

-- CreateIndex
CREATE INDEX "stop_point_proposals_status_idx" ON "stop_point_proposals"("status");

-- CreateIndex
CREATE INDEX "routes_operator_id_status_idx" ON "routes"("operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "routes_operator_id_name_key" ON "routes"("operator_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "routes_id_operator_id_key" ON "routes"("id", "operator_id");

-- CreateIndex
CREATE INDEX "route_stops_catalog_stop_point_id_idx" ON "route_stops"("catalog_stop_point_id");

-- CreateIndex
CREATE INDEX "route_stops_stop_point_id_idx" ON "route_stops"("stop_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_sequence_key" ON "route_stops"("route_id", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_catalog_stop_point_id_key" ON "route_stops"("route_id", "catalog_stop_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_route_id_stop_point_id_key" ON "route_stops"("route_id", "stop_point_id");

-- AddForeignKey
ALTER TABLE "stop_points" ADD CONSTRAINT "stop_points_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — phường phải thuộc đúng tỉnh (UC-13 A3), cùng mẫu `stop_points_catalog`.
ALTER TABLE "stop_points" ADD CONSTRAINT "stop_points_ward_id_province_id_fkey" FOREIGN KEY ("ward_id", "province_id") REFERENCES "wards"("id", "province_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stop_point_proposals" ADD CONSTRAINT "stop_point_proposals_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stop_point_proposals" ADD CONSTRAINT "stop_point_proposals_ward_id_province_id_fkey" FOREIGN KEY ("ward_id", "province_id") REFERENCES "wards"("id", "province_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "stop_point_proposals" ADD CONSTRAINT "stop_point_proposals_catalog_stop_point_id_fkey" FOREIGN KEY ("catalog_stop_point_id") REFERENCES "stop_points_catalog"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_operator_id_fkey" FOREIGN KEY ("route_id", "operator_id") REFERENCES "routes"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_catalog_stop_point_id_fkey" FOREIGN KEY ("catalog_stop_point_id") REFERENCES "stop_points_catalog"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — điểm riêng phải thuộc đúng tenant của route.
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_stop_point_id_operator_id_fkey" FOREIGN KEY ("stop_point_id", "operator_id") REFERENCES "stop_points"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ── Invariant Prisma không sinh ──
ALTER TABLE "stop_points" ADD CONSTRAINT "stop_points_coordinates_range"
  CHECK ("latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180);
ALTER TABLE "stop_point_proposals" ADD CONSTRAINT "stop_point_proposals_coordinates_range"
  CHECK ("latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180);
-- Trạng thái đề xuất nhất quán: PENDING sạch; REJECTED có lý do; APPROVED đã link điểm catalog (ADM-001).
ALTER TABLE "stop_point_proposals" ADD CONSTRAINT "stop_point_proposals_state_consistent" CHECK (
  ("status" = 'PENDING' AND "rejection_reason" IS NULL AND "catalog_stop_point_id" IS NULL)
  OR ("status" = 'REJECTED' AND btrim(COALESCE("rejection_reason", '')) <> '' AND "catalog_stop_point_id" IS NULL)
  OR ("status" = 'APPROVED' AND "catalog_stop_point_id" IS NOT NULL)
);
ALTER TABLE "routes" ADD CONSTRAINT "routes_metrics_non_negative"
  CHECK ("total_distance_meters" >= 0 AND "total_duration_seconds" >= 0);
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_coordinates_range"
  CHECK ("latitude" BETWEEN -90 AND 90 AND "longitude" BETWEEN -180 AND 180);
-- Đúng một nguồn điểm: catalog HOẶC điểm riêng (Q3).
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_single_source"
  CHECK (("catalog_stop_point_id" IS NULL) <> ("stop_point_id" IS NULL));
-- Điểm đầu là ORIGIN và không có chặng trước; các điểm sau luôn có số liệu chặng (Goong lỗi thì không lưu).
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_sequence_consistent" CHECK (
  "sequence" >= 1
  AND ("sequence" = 1) = ("role" = 'ORIGIN')
  AND ("sequence" = 1) = ("distance_meters_from_previous" IS NULL)
  AND ("sequence" = 1) = ("duration_seconds_from_previous" IS NULL)
  AND COALESCE("distance_meters_from_previous", 0) >= 0
  AND COALESCE("duration_seconds_from_previous", 0) >= 0
);

-- ── RLS tenant (mẫu `employee_accounts`) cho điểm riêng, route và điểm dừng ──
ALTER TABLE "stop_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stop_points" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "stop_points"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "routes"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "route_stops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "route_stops" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "route_stops"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

-- ── RLS đề xuất: DB tự giữ state machine phía tenant (Operator không tự duyệt được, kể cả khi service có bug) ──
-- Tenant: đọc của mình; chỉ TẠO bản PENDING; chỉ SỬA bản đang REJECTED và kết quả phải là PENDING (gửi lại);
-- không xoá. Scope platform/system (Admin ADM-001, script) làm mọi chuyển trạng thái.
ALTER TABLE "stop_point_proposals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stop_point_proposals" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_read" ON "stop_point_proposals" FOR SELECT
  USING (app_rls_allows("operator_id"));
CREATE POLICY "tenant_insert_pending" ON "stop_point_proposals" FOR INSERT
  WITH CHECK (
    app_rls_allows("operator_id")
    AND (current_setting('app.scope', true) IN ('platform', 'system') OR "status" = 'PENDING')
  );
CREATE POLICY "tenant_resubmit_rejected" ON "stop_point_proposals" FOR UPDATE
  USING (
    app_rls_allows("operator_id")
    AND (current_setting('app.scope', true) IN ('platform', 'system') OR "status" = 'REJECTED')
  )
  WITH CHECK (
    app_rls_allows("operator_id")
    AND (current_setting('app.scope', true) IN ('platform', 'system') OR "status" = 'PENDING')
  );
CREATE POLICY "platform_delete" ON "stop_point_proposals" FOR DELETE
  USING (current_setting('app.scope', true) IN ('platform', 'system'));
