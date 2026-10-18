import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { hashCreatorToken } from "../lib/creatorToken";

const updateReturning = vi.fn();
const findFirst = vi.fn();

vi.mock("next-auth/next", () => ({
  getServerSession: async () => ({ user: { id: "user-1" } }),
}));

vi.mock("../app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("../lib/csrf", () => ({
  validateCsrf: () => true,
}));

vi.mock("../lib/db", () => ({
  getDb: () => ({
    query: {
      urls: { findFirst: (...args) => findFirst(...args) },
    },
    update: () => ({
      set: () => ({
        where: () => ({
          returning: updateReturning,
        }),
      }),
    }),
  }),
  urls: {
    id: "id",
    shortCode: "shortCode",
    userId: "userId",
    isAnonymous: "isAnonymous",
    archivedAt: "archivedAt",
  },
}));

function claimRequest(cookie) {
  const headers = { "content-type": "application/json" };
  if (cookie) {
    headers.cookie = cookie;
  }
  return new NextRequest("http://localhost/api/claim", {
    method: "POST",
    headers,
    body: JSON.stringify({ shortCode: "public-code" }),
  });
}

describe("POST /api/claim", () => {
  beforeEach(() => {
    updateReturning.mockReset();
    findFirst.mockReset();
  });

  it("rejects a logged-in user who only knows the short code", async () => {
    const token = "a".repeat(64);
    findFirst.mockResolvedValue({
      id: "url-1",
      shortCode: "public-code",
      userId: null,
      isAnonymous: true,
      creatorTokenHash: hashCreatorToken(token),
      archivedAt: null,
    });

    const { POST } = await import("../app/api/claim/route");
    const response = await POST(claimRequest());

    expect(response.status).toBe(404);
    expect(updateReturning).not.toHaveBeenCalled();
  });

  it("claims the link when the creator cookie matches", async () => {
    const { generateCreatorToken, CREATOR_COOKIE_NAME, appendCreatorToken } = await import(
      "../lib/creatorToken"
    );
    const token = generateCreatorToken();
    findFirst.mockResolvedValue({
      id: "url-1",
      shortCode: "public-code",
      userId: null,
      isAnonymous: true,
      creatorTokenHash: hashCreatorToken(token),
      archivedAt: null,
    });
    updateReturning.mockResolvedValue([{ id: "url-1" }]);

    const { POST } = await import("../app/api/claim/route");
    const response = await POST(
      claimRequest(`${CREATOR_COOKIE_NAME}=${appendCreatorToken(null, token)}`)
    );

    expect(response.status).toBe(200);
    expect(updateReturning).toHaveBeenCalled();
  });
});
