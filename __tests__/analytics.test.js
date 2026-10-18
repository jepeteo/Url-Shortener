import { describe, expect, it, vi } from "vitest";
import { EVENTS, analyticsProperties, trackEvent } from "../lib/analytics";

describe("analyticsProperties", () => {
  it("keeps plan and interval only", () => {
    expect(
      analyticsProperties({
        plan: "pro",
        interval: "annual",
        email: "person@example.com",
        userId: "user-1",
        url: "https://example.com",
      })
    ).toEqual({ plan: "pro", interval: "annual" });
  });

  it("drops unknown plan and interval values", () => {
    expect(analyticsProperties({ plan: "Pro", interval: "weekly" })).toEqual({});
    expect(analyticsProperties(null)).toEqual({});
  });
});

describe("trackEvent", () => {
  it("sends a signup without personal fields", async () => {
    const track = vi.fn().mockResolvedValue(undefined);
    const result = await trackEvent(
      EVENTS.signup,
      { plan: "free", email: "person@example.com" },
      track
    );

    expect(result.tracked).toBe(true);
    expect(track).toHaveBeenCalledWith("signup", { plan: "free" });
  });

  it("does not call the tracker for an unknown event", async () => {
    const track = vi.fn();
    const result = await trackEvent("page_view", { plan: "free" }, track);
    expect(result.tracked).toBe(false);
    expect(track).not.toHaveBeenCalled();
  });

  it("reports failure when the tracker throws", async () => {
    const track = vi.fn().mockRejectedValue(new Error("network"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await trackEvent(EVENTS.linkCreated, { plan: "business" }, track);
    expect(result.tracked).toBe(false);
    expect(result.properties).toEqual({ plan: "business" });
    error.mockRestore();
  });
});
