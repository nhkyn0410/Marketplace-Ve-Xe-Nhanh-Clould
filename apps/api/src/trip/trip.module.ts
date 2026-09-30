import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { DatabaseModule } from "../database/database.module";
import { IamModule } from "../iam/iam.module";
import { TripController } from "./trip.controller";
import { TripService } from "./trip.service";

/**
 * TASK-TRN-003 — chuyến + điểm dừng + ghế theo chuyến của nhà xe (DOMAIN-MAP `trip/`); TASK-TRN-006 — trạng thái bán
 * + khóa ghế, ghi audit Mongo.
 */
@Module({
  imports: [DatabaseModule, IamModule, AuditModule],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
