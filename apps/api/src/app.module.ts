import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { SentryModule } from "@sentry/nestjs/setup";
import { ZodSerializerInterceptor } from "nestjs-zod";
import { AppController } from "./app.controller";
import { AuditModule } from "./audit/audit.module";
import { CatalogModule } from "./catalog/catalog.module";
import { AppConfigModule } from "./config/app-config.module";
import { DatabaseModule } from "./database/database.module";
import { MongoAuditModule } from "./database/mongo-audit.module";
import { IamModule } from "./iam/iam.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    AppConfigModule,
    DatabaseModule,
    MongoAuditModule,
    AuditModule,
    QueueModule,
    IamModule,
    CatalogModule
  ],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor }]
})
export class AppModule {}
