-- TASK-TRN-005 (review): trần kỹ thuật giá khớp Zod `MAX_FARE_PRICE` (100.000.000 đồng). Không có trần này, một dòng
-- ghi thẳng DB (seed, script) vượt 2^53 làm `vndToJson` từ chối → xem bảng giá và chi tiết mọi chuyến của tuyến trả 500.
ALTER TABLE "fare_rules" ADD CONSTRAINT "fare_rules_price_max" CHECK ("price" <= 100000000);
