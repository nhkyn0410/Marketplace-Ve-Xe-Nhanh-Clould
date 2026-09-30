# DOMAIN-MAP

Mapping between marketplace business concepts (SRS) and codebase artifacts. This file defines the **target module layout** for the `Marketplace-Ve-Xe-Nhanh` build. The project is positioned as a fresh build; any files already present under `apps/backend/src/modules/` from the prior `Ve_Xe_Nhanh_NestJS_NextJs_ReactNative` codebase are out of scope and must not be relied upon when designing v1.

References:

- `@SDLC/01-srs-he-thong-dat-ve-xe-khach` — SRS, sections §4, §7, §9, §10, §13
- `@context/GLOSSARY` — terminology

## 1. Three layers ↔ Backend module groups (target state)

| Layer                | Backend module group (target)                                                                                                                              | Primary SRS sections                        | Primary FR group                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------- |
| Marketplace layer    | `iam/`, `marketplace/`, `booking/`, `payment/`, `ticket/`, `notification/`, `support/`, `review/`, `dispute/`, `loyalty/`                                              | §10.1 IAM, §10.2 MKT, §10.3 BTP, §10.9 NSR, §10.11 LOY  | `FR-IAM-*`, `FR-MKT-*`, `FR-BTP-*`, `FR-NSR-*`, `FR-DSP-*`, `FR-LOY-*` |
| Operator OS layer    | `operator/`, `vehicle/`, `route/`, `stop-point/`, `trip/`, `fare/`, `promotion/`, `employee/`, `manifest/`, `finance/` (escrow + payout view)              | §10.4 OPR, §10.5 OPS, §10.6 PROM, §10.7 EMP | `FR-OPR-*`, `FR-OPS-*`, `FR-PROM-*`, `FR-EMP-*`            |
| Platform admin layer | `admin/`, `catalog/`, `policy/`, `commission/`, `payout/`, `audit/`, `reporting/`, `search/`, `content/`                                                               | §10.8 ADM, §10.9 NSR (admin parts)          | `FR-ADM-*`                                                 |
| Cross-cutting        | `common/` (guards, interceptors, pipes), `database/` (Prisma + Mongoose), `redis/`, `external/` (payment, notification, routing, storage, payout adapters) | §11 NFR, §8 dependencies                    | `NFR-*`                                                    |

Notes:

- Each business module follows the NestJS pattern: `module.ts` + `controller.ts` + `service.ts` + `repository.ts` + `schema.ts` + `dto/`.
- Cross-cutting concerns (auth guard, tenant guard, rate limiter, audit interceptor) live in `common/`.
- External integrations are abstracted under `external/<provider>/` adapters so swapping VNPay, SMS provider or storage is non-breaking.

## 2. Entity groups (SRS §9.2) ↔ Target modules

| Entity group             | Target module(s)                                              | Notes                                                                                                |
| ------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Identity & Access        | `iam/` (split: `auth/`, `user/`, `session/`, `role/`)         | Owns User, Admin, Operator account, Employee account, Role, Session.                                 |
| Operator Profile & KYC   | `operator/` + `operator-kyc/`                                 | Owns OperatorApplication (pre-tenant registration, BR-75), OperatorProfile, KycDocument, BankAccount, OperatorStatusHistory.                               |
| Location & Catalog       | `catalog/`                                                    | Province, Ward, StopPoint, VehicleType, Amenity, ContentPage.                                        |
| Transport Resource       | `vehicle/`, `route/`, `stop-point/`                           | Vehicle, SeatMap, Seat, Route, RouteStop.                                                            |
| Trip & Inventory         | `trip/`, `fare/`, `seat-hold/`                                | Trip, TripStop, TripSeat, SeatHold, Fare, FareRule.                                                  |
| Booking & Ticket         | `booking/`, `ticket/`                                         | Booking, PassengerInfo, Ticket, TicketQrToken, BookingStatusHistory.                                 |
| Promotion & Campaign     | `promotion/`                                                  | Promotion, PromotionRule, PromotionRedemption, PromotionUsageLimit, UserVoucher (voucher wallet).                                  |
| Loyalty (VXN Plus)       | `loyalty/`                                                    | LoyaltyAccount, PointTransaction (append-only ledger), MembershipTier (enum; thresholds/multipliers in `PolicyVersion`). Platform-level, no `operatorId`. |
| Content                  | `content/`                                                    | Article, ArticleCategory (Khám phá page). `ContentPage` (static pages) stays in `catalog/`.          |
| Payment, Escrow & Payout | `payment/`, `refund/`, `escrow/`, `payout/`, `commission/`    | Payment, Refund, EscrowLedger, CommissionRule, Payout, ReconciliationRecord.                         |
| Operation & Check-in     | `manifest/`, `check-in/`, `journey-log/`, `incident/`         | CheckInEvent, JourneyLog, IncidentReport, EmployeeAssignment.                                        |
| Support & Trust          | `support/`, `complaint/`, `review/`, `dispute/`, `scorecard/` | SupportTicket, Complaint, Review, DisputeCase, OperatorScorecard.                                    |
| Notification & Audit     | `notification/`, `audit/`, `policy/`                          | Notification, NotificationDelivery, NotificationPreference, AuditLog, PolicyVersion, PolicySnapshot. |

## 3. Actor ↔ Client app

| Actor            | Primary client                                                         | Notes                                                              |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| User (Passenger) | `apps/marketplace` (web) + `apps/passenger_mobile`                     | Search, booking, ticket, profile, review, complaint.               |
| Guest            | `apps/marketplace` (web) + `apps/passenger_mobile` (guest session)     | Search, hold seat, book, pay, lookup ticket; no long-term history. |
| Operator         | `apps/operator-os` (web, CSR sau auth)                                 | Operator OS layer entry.                                           |
| Employee         | `apps/employee_mobile` (mobile only)                                   | Check-in, manifest, status update, journey log, incident. No Operator OS access — login `/auth/employee/login` (ADR-017 amend 28/09/2026). |
| Admin            | `apps/admin` (web)                                                     | Platform admin layer entry; no mobile app for v1.                  |

> **Folder naming — Flutter apps use `snake_case` (decided 14/09/2026).** `apps/passenger_mobile`,
> `apps/employee_mobile` and `packages/mobile_shared`, `packages/api_client_dart` — **not** kebab-case.
> Reason: a Dart package name must be `snake_case`, so keeping the folder name identical to the package
> name removes the `flutter create --project-name` trap entirely (a kebab folder makes `flutter create`
> fail outright). This is the one place in the repo where folders are `snake_case`; Node workspaces
> (`apps/operator-os`, `packages/api-client`) stay kebab-case. Any glob over these folders must use
> `apps/*_mobile`, not `apps/*-mobile` — `.dockerignore` and CI path filters depend on it.

## 4. External system actors (SRS §7.6) ↔ Adapter location

All 15 tech-selection layers are closed (ADR-002, ADR-009..022; routing Layer 14 uses ADR-027 superseding ADR-021). The adapter ports below are mandated by `ADR-006` (ports & adapters) so vendors stay swappable.

| External actor           | Backend adapter (target)                       | Decision reference                                                                                         |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Cổng thanh toán VNPay    | `external/payment/vnpay/`                      | `ADR-019` (VNPay primary, re-close `OQ-05`)                                                                |
| Cổng thanh toán MoMo     | `external/payment/momo/`                       | `ADR-019` (phương thức 2 v1, đa phương thức)                                                               |
| Dịch vụ email            | `external/notification/email/`                 | `ADR-020` (Resend, re-close `OQ-09`)                                                                       |
| Dịch vụ SMS              | `external/notification/sms/`                   | `ADR-020` (defer v1 — chỉ adapter port + LocalLoggerAdapter; kích hoạt v1.x)                               |
| Push notification        | `external/notification/push/`                  | `ADR-020` / `ADR-028` (FCM + APNs trực tiếp — TRONG phạm vi v1)                                            |
| OAuth provider           | Better Auth built-in (Google, Facebook, Apple) | `ADR-020` (Passenger-only; Operator/Platform không OAuth per `ADR-017`)                                    |
| Dịch vụ định tuyến + map | `external/routing/goong/`                      | `ADR-027` (Goong Direction + Distance Matrix + Maps); `external/routing/osrm/` = escape-hatch self-host    |
| Object storage           | `external/storage/`                            | `ADR-018` (Cloudflare R2, 2 bucket public/private; KYC production location defer `OQ-21`)                  |
| Bank payout channel      | `external/payout/`                             | `ADR-022` (manual admin-confirm + batch, `ManualPayoutAdapter`; auto-disbursement defer v1.x tied `OQ-22`) |

## 5. State enum alignment

Per `OQ-01..03` decisions, code state enums must align with SRS §17:

| Enum           | Target values (SRS §17)                                                                                                                  | Owning module |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Trip status    | DRAFT, OPEN_FOR_SALE, SOLD_OUT, LOCKED, BOARDING, DEPARTED, IN_PROGRESS, COMPLETED, CANCELLED, INCIDENT                                  | `trip/`       |
| Seat status    | AVAILABLE, HOLDING, BOOKED, CHECKED_IN, BLOCKED                                                                                          | `trip/`       |
| Booking status | PENDING_PAYMENT, PENDING_CONFIRMATION, PAID, CONFIRMED, PARTIALLY_CANCELLED, CANCELLED, EXPIRED, REFUND_PENDING, REFUNDED, REFUND_FAILED | `booking/`    |
| Ticket status  | VALID, CANCELLED, CHECKED_IN, NO_SHOW, USED, REFUNDED                                                                                    | `ticket/`     |
| Payment status | INITIATED, PROCESSING, SUCCESS, FAILED, EXPIRED, CANCELLED, RECONCILING                                                                  | `payment/`    |
| Refund status  | REQUESTED, APPROVED, PROCESSING, SUCCESS, FAILED, REJECTED                                                                               | `refund/`     |
| Dispute status | OPEN, WAITING_USER_EVIDENCE, WAITING_OPERATOR_RESPONSE, UNDER_REVIEW, ESCALATED, RESOLVED_REFUND, RESOLVED_NO_REFUND, CLOSED             | `dispute/`    |
| Membership tier | BRONZE, SILVER, GOLD, PLATINUM                                                                                                           | `loyalty/`    |
| Point transaction type | EARN, REDEEM, EXPIRE, ADJUST, REVERSAL (append-only, no lifecycle)                                                                | `loyalty/`    |
| User voucher status | AVAILABLE, RESERVED, USED, EXPIRED                                                                                                   | `promotion/`  |
| Article status | DRAFT, PUBLISHED, ARCHIVED                                                                                                                | `content/`    |
| Operator application status | DRAFT, SUBMITTED, NEEDS_INFO, APPROVED, REJECTED                                                                             | `operator-kyc/` |
| Operator status | ACTIVE, SUSPENDED                                                                                                                        | `operator/`   |

Code shared in `packages/types/` should expose these enums for **frontend (web) and backend**. Mobile (Flutter, ADR-028) cannot consume the Zod package — it gets the same enums through the Dart client generated from the OpenAPI 3.1 spec (`packages/api_client_dart/`).

## 6. Tenant boundary requirements

For every entity owned by an Operator (entity groups 4–11 above except platform catalog), the schema must carry `operatorId` and every query / mutation must enforce tenant filter via guard or repository layer. This is a cross-cutting requirement defined by `FR-OPR-11`, `FR-IAM-06` and `DM-01` (SRS §9.1).

Loyalty (`loyalty/`), the voucher wallet (`user_vouchers`) and articles (`content/`) are **Platform-level** data with no `operatorId`: loyalty and vouchers are owned by `userId` (checked in the service), and RLS blocks the `tenant` scope from reading them (SRS v1.21, `BR-65..74`).
