import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  API_BASE_URL,
  createApplication,
  deleteApplication,
  getApplicationById,
  getApplicationsForUser,
  registerUser,
  updateApplication,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("registerUser", () => {
  it("sends registration details and returns the created user", async () => {
    const request = {
      email: "zoey@example.com",
      password: "password123",
    };
    const user = {
      id: 1,
      email: "zoey@example.com",
      createdAt: "2026-07-26T15:30:00",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await registerUser(request);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );
    expect(result).toEqual(user);
  });

  it("shows the backend message when the email already exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => "An account already exists for this email.",
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      registerUser({
        email: "zoey@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(
      "An account already exists for this email.",
    );
  });
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

describe("getApplicationsForUser", () => {
  it("requests and returns the user's applications", async () => {
    const applications = [
      {
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
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => applications,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await getApplicationsForUser(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/applications/user/1`,
    );
    expect(result).toEqual(applications);
  });

  it("throws when the applications request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getApplicationsForUser(99),
    ).rejects.toThrow("Failed to load applications.");
  });
});

describe("createApplication", () => {
  it("sends a POST request and returns the created application", async () => {
    const request = {
      userId: 1,
      company: "Xero",
      roleTitle: "Junior Software Developer",
      location: "Auckland",
      status: "Saved" as const,
      jobDescription: "Java and React role",
      closingDate: "2026-08-01",
    };
    const application = {
      id: 1,
      ...request,
      createdAt: "2026-07-24T10:00:00",
      userEmail: "zoey.xia@example.com",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => application,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await createApplication(request);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/applications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );
    expect(result).toEqual(application);
  });

  it("throws when the create request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      createApplication({
        userId: 1,
        company: "Xero",
        roleTitle: "Junior Software Developer",
        location: "Auckland",
        status: "Saved",
        jobDescription: "Java and React role",
        closingDate: "2026-08-01",
      }),
    ).rejects.toThrow("Failed to create application.");
  });
});

describe("updateApplication", () => {
  it("sends a PUT request and returns the updated application", async () => {
    const request = {
      company: "Xero",
      roleTitle: "Software Developer",
      location: "Wellington",
      status: "First Interview" as const,
      jobDescription: "Updated job description",
      closingDate: "2026-08-10",
    };
    const application = {
      id: 1,
      ...request,
      createdAt: "2026-07-24T10:00:00",
      userId: 1,
      userEmail: "zoey.xia@example.com",
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => application,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await updateApplication("1", request);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/applications/1`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );
    expect(result).toEqual(application);
  });

  it("throws when the update request fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateApplication("99", {
        company: "Xero",
        roleTitle: "Software Developer",
        location: "Wellington",
        status: "First Interview",
        jobDescription: "Updated job description",
        closingDate: "2026-08-10",
      }),
    ).rejects.toThrow("Failed to update application.");
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
