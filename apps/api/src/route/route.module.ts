import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { RoutingModule } from "../external/routing/routing.module";
import { IamModule } from "../iam/iam.module";
import { RouteController } from "./route.controller";
import { RouteService } from "./route.service";

/** TASK-TRN-002 — tuyến + điểm dừng của nhà xe (DOMAIN-MAP `route/`), số liệu chặng qua RoutingModule. */
@Module({
  imports: [DatabaseModule, IamModule, RoutingModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
