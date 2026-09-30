import { BadRequestException, HttpException, ServiceUnavailableException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { buildProblemDetails } from "./problem-details.filter";

const request = {
  originalUrl: "/v1/test",
  url: "/test"
};

describe("buildProblemDetails", () => {
  it("maps Nest HTTP exceptions to RFC 7807 problem details", () => {
    const problem = buildProblemDetails(
      new ServiceUnavailableException("Redis is unavailable."),
      request
    );

    expect(problem).toMatchObject({
      type: "about:blank",
      title: "Service Unavailable",
      status: 503,
      detail: "Redis is unavailable.",
      instance: "/v1/test",
      code: "SERVICE_UNAVAILABLE"
    });
  });

  it("keeps custom problem fields when an endpoint provides them", () => {
    const problem = buildProblemDetails(
      new HttpException(
        {
          type: "https://docs.vexenhanh.vn/errors/validation-failed",
          title: "Validation failed",
          detail: "The request body is invalid.",
          code: "VALIDATION_FAILED"
        },
        400
      ),
      request
    );

    expect(problem).toMatchObject({
      type: "https://docs.vexenhanh.vn/errors/validation-failed",
      title: "Validation failed",
      status: 400,
      detail: "The request body is invalid.",
      code: "VALIDATION_FAILED"
    });
  });

  it("joins validation message arrays into a stable detail string", () => {
    const problem = buildProblemDetails(
      new BadRequestException(["name is required", "email is invalid"]),
      request
    );

    expect(problem.detail).toBe("name is required; email is invalid");
    expect(problem.code).toBe("BAD_REQUEST");
  });

  it("keeps the `reasons` extension only when it is an array of strings", () => {
    const withReasons = buildProblemDetails(
      new HttpException({ code: "TRIP_NOT_READY_FOR_SALE", detail: "x", reasons: ["VEHICLE_MISSING", "FARE_MISSING"] }, 422),
      request
    );
    expect(withReasons.reasons).toEqual(["VEHICLE_MISSING", "FARE_MISSING"]);

    const withObject = buildProblemDetails(
      new HttpException({ code: "X", detail: "x", reasons: [{ internal: "secret" }] }, 422),
      request
    );
    expect(withObject).not.toHaveProperty("reasons");
    expect(buildProblemDetails(new ServiceUnavailableException("down"), request)).not.toHaveProperty("reasons");
  });

  it("does not leak unknown exception messages", () => {
    const problem = buildProblemDetails(new Error("database password leaked"), request);

    expect(problem).toMatchObject({
      title: "Internal Server Error",
      status: 500,
      detail: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR"
    });
  });
});
