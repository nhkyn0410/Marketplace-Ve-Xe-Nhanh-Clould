import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { DatabaseModule } from "../database/database.module";
import { IamModule } from "../iam/iam.module";
import { FareController } from "./fare.controller";
import { FareService } from "./fare.service";

/** TASK-TRN-005 — bảng giá theo tuyến (DOMAIN-MAP `fare/`); lịch sử giá ghi vào audit Mongo. */
@Module({
  imports: [DatabaseModule, IamModule, AuditModule],
  controllers: [FareController],
  providers: [FareService],
})
export class FareModule {}
