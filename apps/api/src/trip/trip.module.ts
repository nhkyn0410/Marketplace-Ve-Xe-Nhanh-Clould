import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { IamModule } from "../iam/iam.module";
import { TripController } from "./trip.controller";
import { TripService } from "./trip.service";

/** TASK-TRN-003 — chuyến + điểm dừng + ghế theo chuyến của nhà xe (DOMAIN-MAP `trip/`). */
@Module({
  imports: [DatabaseModule, IamModule],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
