import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { IamModule } from "../iam/iam.module";
import { StopPointProposalController } from "./stop-point-proposal.controller";
import { StopPointProposalService } from "./stop-point-proposal.service";
import { StopPointController } from "./stop-point.controller";
import { StopPointService } from "./stop-point.service";

/** TASK-TRN-002 — điểm đón/trả riêng + đề xuất catalog của nhà xe (DOMAIN-MAP `stop-point/`). */
@Module({
  imports: [DatabaseModule, IamModule],
  controllers: [StopPointController, StopPointProposalController],
  providers: [StopPointService, StopPointProposalService],
})
export class StopPointModule {}
