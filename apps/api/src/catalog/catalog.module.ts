import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

/** TASK-CAT-001 — catalog chuẩn Platform, API đọc công khai (DOMAIN-MAP `catalog/`). */
@Module({
  imports: [DatabaseModule],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
