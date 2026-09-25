import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * Item catalog (loại xe, tiện ích, tỉnh/phường) không tồn tại, đã ngừng dùng hoặc không khớp nhau
 * (phường khác tỉnh). Dùng chung cho mọi module Operator tham chiếu catalog (TRN-001, TRN-002).
 */
export function catalogItemUnavailable(): HttpException {
  return new HttpException(
    {
      code: "CATALOG_ITEM_UNAVAILABLE",
      detail: "Dữ liệu danh mục (loại xe, tiện ích, tỉnh/phường) không tồn tại hoặc đã ngừng sử dụng.",
      title: "Catalog error",
    },
    HttpStatus.UNPROCESSABLE_ENTITY,
  );
}
