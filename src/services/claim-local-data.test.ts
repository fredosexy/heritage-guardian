import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimLocalDrafts: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getGuestIdentity: vi.fn(),
  resetGuestIdentity: vi.fn(),
}));

vi.mock("@/data", () => ({
  claimLocalDrafts: mocks.claimLocalDrafts,
  profilesRepo: {
    getProfile: mocks.getProfile,
    updateProfile: mocks.updateProfile,
  },
}));

vi.mock("@/core/identity/guestIdentity", () => ({
  getGuestIdentity: mocks.getGuestIdentity,
  resetGuestIdentity: mocks.resetGuestIdentity,
}));

import { claimLocalData } from "./claim-local-data";

describe("claimLocalData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getGuestIdentity.mockReturnValue({ id: "guest-id", firstName: "Guest" });
    mocks.claimLocalDrafts.mockResolvedValue(1);
    mocks.getProfile.mockResolvedValue(null);
  });

  it("preserves the guest identity when claiming drafts fails", async () => {
    mocks.claimLocalDrafts.mockRejectedValueOnce(new Error("Session expired"));

    await expect(claimLocalData("account-id")).resolves.toEqual({ claimedDossiers: 0 });

    expect(mocks.resetGuestIdentity).not.toHaveBeenCalled();
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("resets the guest identity after a successful claim attempt", async () => {
    await expect(claimLocalData("account-id")).resolves.toEqual({ claimedDossiers: 1 });

    expect(mocks.claimLocalDrafts).toHaveBeenCalledWith("guest-id", "account-id");
    expect(mocks.resetGuestIdentity).toHaveBeenCalledOnce();
  });
});
