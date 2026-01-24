import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { createRequireStaffRole } from "../../../middlewares/requireStaffRole";
import { UserRole, StaffRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../../../constants/messages";

describe("requireStaffRole Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock }) as jest.Mock;

    mockReq = {
      user: {
        userId: "user-123",
        role: UserRole.customer,
      },
      staffRole: undefined,
    };

    mockRes = {
      status: statusMock as unknown as Response["status"],
    };

    mockNext = jest.fn() as jest.Mock;
  });

  describe("createRequireStaffRole('manager')", () => {
    const requireManager = createRequireStaffRole("manager");

    it("should allow owner to bypass", () => {
      mockReq.user = { userId: "owner-123", role: UserRole.owner };

      requireManager(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow manager to access", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = StaffRole.manager;

      requireManager(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should deny staff access to manager+ route", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = StaffRole.staff;

      requireManager(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
      });
    });

    it("should deny access when no staffRole is set", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = undefined;

      requireManager(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.ACCESS_DENIED,
      });
    });
  });

  describe("createRequireStaffRole('staff')", () => {
    const requireStaff = createRequireStaffRole("staff");

    it("should allow owner to bypass", () => {
      mockReq.user = { userId: "owner-123", role: UserRole.owner };

      requireStaff(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow manager to access staff+ route", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = StaffRole.manager;

      requireStaff(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should allow staff to access staff+ route", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = StaffRole.staff;

      requireStaff(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it("should deny access when no staffRole is set", () => {
      mockReq.user = { userId: "user-123", role: UserRole.customer };
      mockReq.staffRole = undefined;

      requireStaff(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.ACCESS_DENIED,
      });
    });
  });
});
