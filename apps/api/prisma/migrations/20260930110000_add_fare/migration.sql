-- TASK-TRN-005 — Fare + FareRule (DB §5.2/§7, FR-OPS-08, BR-40, BR-41, OQ-08; Q1 = PA1, Q4 = Mongo).
-- Mỗi tuyến một bảng giá; rule = giá tuyệt đối theo loại xe × loại chỗ × khung giờ khởi hành. Lịch sử giá nằm ở
-- Mongo `audit_event`, không có bảng lịch sử. Operator-owned: `operator_id` + RLS, FK ghép chặn gắn chéo tenant.

-- CreateEnum
CREATE TYPE "FareStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "fares" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "status" "FareStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fare_rules" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "fare_id" TEXT NOT NULL,
    "vehicle_type_id" TEXT,
    "seat_type" "SeatType",
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "price" BIGINT NOT NULL,

    CONSTRAINT "fare_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fares_operator_id_status_idx" ON "fares"("operator_id", "status");

-- CreateIndex — mỗi tuyến một bảng giá (route thuộc đúng một tenant nên tương đương unique `route_id`).
CREATE UNIQUE INDEX "fares_route_id_operator_id_key" ON "fares"("route_id", "operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "fares_id_operator_id_key" ON "fares"("id", "operator_id");

-- CreateIndex
CREATE INDEX "fare_rules_fare_id_idx" ON "fare_rules"("fare_id");

-- CreateIndex
CREATE INDEX "fare_rules_vehicle_type_id_idx" ON "fare_rules"("vehicle_type_id");

-- AddForeignKey
ALTER TABLE "fares" ADD CONSTRAINT "fares_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — tuyến phải thuộc đúng tenant của bảng giá.
ALTER TABLE "fares" ADD CONSTRAINT "fares_route_id_operator_id_fkey" FOREIGN KEY ("route_id", "operator_id") REFERENCES "routes"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_fare_id_operator_id_fkey" FOREIGN KEY ("fare_id", "operator_id") REFERENCES "fares"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ── Invariant Prisma không sinh ──
-- Tiền VND không âm (BR-40).
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_price_non_negative" CHECK ("price" >= 0);
-- Khung giờ: đủ cả hai đầu hoặc bỏ trống cả hai; đầu sau lớn hơn đầu trước.
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_window_consistent" CHECK (
  ("valid_from" IS NULL AND "valid_to" IS NULL)
  OR ("valid_from" IS NOT NULL AND "valid_to" IS NOT NULL AND "valid_to" > "valid_from")
);
-- Hai rule cùng phạm vi không được cùng áp cho một ghế (giá không xác định). "Mọi loại" (NULL) tính là một giá
-- trị riêng qua COALESCE / CASE — ép `enum::text` không dùng được trong ràng buộc (không IMMUTABLE), nên loại chỗ
-- được đổi sang số bằng CASE; thêm giá trị vào enum `SeatType` thì phải sửa hai ràng buộc này. Có `operator_id`
-- vì EXCLUDE kiểm trước FK ghép và bỏ qua RLS (cùng lý do như `trips_vehicle_no_overlap`).
-- (1) Giá thường (không khung giờ): một dòng cho mỗi loại xe × loại chỗ.
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_base_unique" EXCLUDE USING gist (
  "operator_id" WITH =,
  "fare_id" WITH =,
  (COALESCE("vehicle_type_id", '')) WITH =,
  (CASE WHEN "seat_type" IS NULL THEN 0 WHEN "seat_type" = 'SEAT' THEN 1 ELSE 2 END) WITH =
) WHERE ("valid_from" IS NULL);
-- (2) Giá theo dịp: cùng loại xe × loại chỗ không chồng khung giờ khởi hành `[valid_from, valid_to)`.
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_window_no_overlap" EXCLUDE USING gist (
  "operator_id" WITH =,
  "fare_id" WITH =,
  (COALESCE("vehicle_type_id", '')) WITH =,
  (CASE WHEN "seat_type" IS NULL THEN 0 WHEN "seat_type" = 'SEAT' THEN 1 ELSE 2 END) WITH =,
  tsrange("valid_from", "valid_to", '[)') WITH &&
) WHERE ("valid_from" IS NOT NULL);

-- ── RLS tenant (mẫu `routes`) ──
ALTER TABLE "fares" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fares" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "fares"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "fare_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fare_rules" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "fare_rules"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));
