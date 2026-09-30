-- TASK-TRN-003 — Trip + TripStop + TripSeat (DB §5.2/§7, FR-OPS-06, BR-14, UC-14).
-- Operator-owned: mọi bảng có `operator_id` + RLS. FK ghép `(…, operator_id)` chặn gắn route/xe/điểm của tenant khác.

-- btree_gist: cho phép `… WITH =` trên cột TEXT trong ràng buộc EXCLUDE dùng GiST (contrib Postgres 16 / Supabase).
-- Đặt ở schema `extensions` (khuyến nghị Supabase, không rải object vào `public`); Postgres tìm operator class
-- mặc định không phụ thuộc search_path nên ràng buộc bên dưới vẫn dùng được.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'OPEN_FOR_SALE', 'SOLD_OUT', 'LOCKED', 'BOARDING', 'DEPARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'INCIDENT');

-- CreateEnum
CREATE TYPE "TripSeatStatus" AS ENUM ('AVAILABLE', 'HOLDING', 'BOOKED', 'CHECKED_IN', 'BLOCKED');

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "departure_at" TIMESTAMP(3) NOT NULL,
    "arrival_at" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stops" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "role" "RouteStopRole" NOT NULL,
    "catalog_stop_point_id" TEXT,
    "stop_point_id" TEXT,
    "note" TEXT,
    "planned_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_seats" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "seat_code" TEXT NOT NULL,
    "deck" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL,
    "status" "TripSeatStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "trip_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trips_operator_id_departure_at_idx" ON "trips"("operator_id", "departure_at");

-- CreateIndex
CREATE INDEX "trips_route_id_idx" ON "trips"("route_id");

-- CreateIndex
CREATE UNIQUE INDEX "trips_id_operator_id_key" ON "trips"("id", "operator_id");

-- CreateIndex
CREATE INDEX "trip_stops_catalog_stop_point_id_idx" ON "trip_stops"("catalog_stop_point_id");

-- CreateIndex
CREATE INDEX "trip_stops_stop_point_id_idx" ON "trip_stops"("stop_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stops_trip_id_sequence_key" ON "trip_stops"("trip_id", "sequence");

-- CreateIndex
CREATE INDEX "trip_seats_trip_id_status_idx" ON "trip_seats"("trip_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "trip_seats_trip_id_seat_code_key" ON "trip_seats"("trip_id", "seat_code");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — route phải thuộc đúng tenant của chuyến.
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_operator_id_fkey" FOREIGN KEY ("route_id", "operator_id") REFERENCES "routes"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — xe phải thuộc đúng tenant của chuyến.
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_operator_id_fkey" FOREIGN KEY ("vehicle_id", "operator_id") REFERENCES "vehicles"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_trip_id_operator_id_fkey" FOREIGN KEY ("trip_id", "operator_id") REFERENCES "trips"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_catalog_stop_point_id_fkey" FOREIGN KEY ("catalog_stop_point_id") REFERENCES "stop_points_catalog"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey — điểm riêng phải thuộc đúng tenant của chuyến.
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_stop_point_id_operator_id_fkey" FOREIGN KEY ("stop_point_id", "operator_id") REFERENCES "stop_points"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "trip_seats" ADD CONSTRAINT "trip_seats_trip_id_operator_id_fkey" FOREIGN KEY ("trip_id", "operator_id") REFERENCES "trips"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ── Invariant Prisma không sinh ──
-- Giờ đến sau giờ đi (UC-14 bước 2).
ALTER TABLE "trips" ADD CONSTRAINT "trips_arrival_after_departure" CHECK ("arrival_at" > "departure_at");
-- BR-14: một xe không chạy hai chuyến chồng giờ. Khoảng bận `[departure_at, arrival_at)` — chuyến sau được
-- khởi hành đúng lúc chuyến trước đến (Khanh chốt 30/09/2026: không có thời gian đệm quay đầu). Chuyến đã
-- huỷ không giữ xe. Ràng buộc ở DB nên hai request đồng thời cũng chỉ một bên thành công.
-- Có `operator_id`: EXCLUDE kiểm trước FK ghép (FK chạy cuối câu lệnh) và bỏ qua RLS — thiếu cột tenant thì
-- một dòng gắn nhầm xe của tenant khác sẽ báo "trùng lịch" thay vì lỗi FK, lộ lịch xe tenant đó. Không làm
-- yếu BR-14: xe thuộc đúng một tenant (FK ghép, ON UPDATE RESTRICT).
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_no_overlap" EXCLUDE USING gist (
  "operator_id" WITH =,
  "vehicle_id" WITH =,
  tsrange("departure_at", "arrival_at", '[)') WITH &&
) WHERE ("vehicle_id" IS NOT NULL AND "status" <> 'CANCELLED');
-- Đúng một nguồn điểm: catalog HOẶC điểm riêng (giống `route_stops`).
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_single_source"
  CHECK (("catalog_stop_point_id" IS NULL) <> ("stop_point_id" IS NULL));
-- Điểm đầu là ORIGIN.
ALTER TABLE "trip_stops" ADD CONSTRAINT "trip_stops_sequence_consistent"
  CHECK ("sequence" >= 1 AND ("sequence" = 1) = ("role" = 'ORIGIN'));

-- ── RLS tenant (mẫu `routes`) ──
ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "trips"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "trip_stops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_stops" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "trip_stops"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "trip_seats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_seats" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "trip_seats"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));
