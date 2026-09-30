-- TASK-TRN-006: vòng đời bán chuyến (chưa có vé) + khóa ghế thủ công. Khóa ghế dùng `trip_seats.status = 'BLOCKED'`
-- đã có; migration này chỉ thêm cột cho thời điểm ngừng bán online (AS-20) và lý do đổi trạng thái.

-- Số phút trước giờ khởi hành thì ngừng bán online. Chuyến cũ nhận mặc định 60 phút.
ALTER TABLE "trips" ADD COLUMN "online_sale_cutoff_minutes" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "trips" ADD CONSTRAINT "trips_online_sale_cutoff_range"
  CHECK ("online_sale_cutoff_minutes" BETWEEN 0 AND 1440);

-- Lý do lần đổi trạng thái gần nhất (lịch sử đầy đủ ở audit Mongo). Chuyến hủy phải có lý do (SRS §17.3) —
-- giữ ở DB để mọi đường hủy về sau (Admin, TRN-008) cũng không bỏ sót.
ALTER TABLE "trips" ADD COLUMN "status_reason" TEXT;
ALTER TABLE "trips" ADD CONSTRAINT "trips_cancel_requires_reason"
  CHECK ("status" <> 'CANCELLED' OR "status_reason" IS NOT NULL);
