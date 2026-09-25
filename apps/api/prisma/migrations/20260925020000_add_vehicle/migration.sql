-- TASK-TRN-001 — Vehicle + SeatMap/Seat (DB §5.2 Transport, §7). Operator-owned: mọi bảng có
-- `operator_id` + RLS. FK ghép `(…, operator_id)` chặn gắn SeatMap / ghế / tiện ích xe của tenant khác.

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('SEAT', 'BED');

-- CreateTable
CREATE TABLE "seat_maps" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout" JSONB NOT NULL,
    "seat_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "seat_map_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "deck" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "vehicle_type_id" TEXT NOT NULL,
    "seat_map_id" TEXT,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_amenities" (
    "vehicle_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,

    CONSTRAINT "vehicle_amenities_pkey" PRIMARY KEY ("vehicle_id","amenity_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_maps_operator_id_name_key" ON "seat_maps"("operator_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_maps_id_operator_id_key" ON "seat_maps"("id", "operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_seat_map_id_code_key" ON "seats"("seat_map_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "seats_seat_map_id_deck_row_column_key" ON "seats"("seat_map_id", "deck", "row", "column");

-- CreateIndex
CREATE INDEX "vehicles_operator_id_status_idx" ON "vehicles"("operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_operator_id_plate_number_key" ON "vehicles"("operator_id", "plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_id_operator_id_key" ON "vehicles"("id", "operator_id");

-- AddForeignKey
ALTER TABLE "seat_maps" ADD CONSTRAINT "seat_maps_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_seat_map_id_operator_id_fkey" FOREIGN KEY ("seat_map_id", "operator_id") REFERENCES "seat_maps"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operator_profiles"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_type_id_fkey" FOREIGN KEY ("vehicle_type_id") REFERENCES "vehicle_types"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_seat_map_id_operator_id_fkey" FOREIGN KEY ("seat_map_id", "operator_id") REFERENCES "seat_maps"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_amenities" ADD CONSTRAINT "vehicle_amenities_vehicle_id_operator_id_fkey" FOREIGN KEY ("vehicle_id", "operator_id") REFERENCES "vehicles"("id", "operator_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "vehicle_amenities" ADD CONSTRAINT "vehicle_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- ── Invariant Prisma không sinh ──
ALTER TABLE "seat_maps" ADD CONSTRAINT "seat_maps_seat_count_positive" CHECK ("seat_count" >= 1);
ALTER TABLE "seats" ADD CONSTRAINT "seats_position_positive"
  CHECK ("deck" >= 1 AND "row" >= 1 AND "column" >= 1);
-- Biển số đã chuẩn hoá (giả định A1): đường ghi khác service (Admin, script) viết `51b-123.45` sẽ bị chặn
-- thay vì lọt qua unique `(operator_id, plate_number)` dưới một dạng khác.
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_plate_number_normalized"
  CHECK ("plate_number" ~ '^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$');

-- ── RLS tenant (mẫu `employee_accounts`, add_tenant_rls): chỉ đọc/ghi row của đúng Operator ──
-- FORCE: áp cả owner không phải superuser. RLS là lớp chặn cuối — service vẫn lọc `operator_id`.
ALTER TABLE "seat_maps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seat_maps" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "seat_maps"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "seats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seats" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "seats"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "vehicles"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));

ALTER TABLE "vehicle_amenities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_amenities" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "vehicle_amenities"
  USING (app_rls_allows("operator_id"))
  WITH CHECK (app_rls_allows("operator_id"));
