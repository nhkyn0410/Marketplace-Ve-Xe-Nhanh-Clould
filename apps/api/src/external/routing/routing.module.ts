import { Logger, Module } from "@nestjs/common";
import { APP_CONFIG, type AppConfig } from "../../config/env.config";
import { EstimateRoutingProvider } from "./estimate-routing-provider";
import { GoongRoutingProvider } from "./goong/goong-routing-provider";
import { ROUTING_PROVIDER, type RoutingProvider } from "./routing-provider";

/**
 * Chọn adapter routing theo config (mẫu NotificationModule): có `GOONG_API_KEY` → Goong; không có →
 * ước lượng đường chim bay (chỉ dev/test — env đã bắt buộc key ở production).
 */
@Module({
  providers: [
    {
      provide: ROUTING_PROVIDER,
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig): RoutingProvider => {
        if (config.GOONG_API_KEY) {
          return new GoongRoutingProvider(config.GOONG_API_KEY);
        }
        new Logger("RoutingModule").warn(
          "Chưa đặt GOONG_API_KEY — route dùng khoảng cách ước lượng (ESTIMATE), không phải số Goong.",
        );
        return new EstimateRoutingProvider();
      },
    },
  ],
  exports: [ROUTING_PROVIDER],
})
export class RoutingModule {}
