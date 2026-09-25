import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { IamModule } from "../iam/iam.module";
import { SeatMapController } from "./seat-map.controller";
import { SeatMapService } from "./seat-map.service";
import { VehicleController } from "./vehicle.controller";
import { VehicleService } from "./vehicle.service";

/** TASK-TRN-001 — Vehicle + SeatMap/Seat của nhà xe (DOMAIN-MAP `vehicle/`). IamModule cho `@Authorize`. */
@Module({
  imports: [DatabaseModule, IamModule],
  controllers: [VehicleController, SeatMapController],
  providers: [VehicleService, SeatMapService],
})
export class VehicleModule {}
