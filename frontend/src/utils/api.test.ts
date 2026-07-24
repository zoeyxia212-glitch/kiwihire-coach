import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  API_BASE_URL,
  deleteApplication,
  getApplicationById,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getApplicationById", () => {
  it("requests and returns an application", async () => {
    const application = {
      id: 1,
      company: "Xero",
      roleTitle: "Junior Software Developer",
      location: "Auckland",
      status: "Applied",
      jobDescription: "Java and React role",
      closingDate: "2026-08-01",
      createdAt: "2026-07-24T10:00:00",
      userId: 1,
      userEmail: "zoey.xia@example.com",
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => application,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getApplicationById("1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/applications/1`,
    );
    expect(result).toEqual(application);
  });

  it("throws when the request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getApplicationById("99"),
    ).rejects.toThrow("Failed to load application.");
  });
});

describe("deleteApplication", () => {
  it("sends a DELETE request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    await deleteApplication("1");

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/applications/1`,
      {
        method: "DELETE",
      },
    );
  });

  it("throws when the delete request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteApplication("99"),
    ).rejects.toThrow("Failed to delete application.");
  });
});
