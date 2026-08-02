import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "./ApplicationsPage";
import { getApplications } from "../utils/api";

vi.mock("../utils/api", () => ({
  getApplications: vi.fn(),
}));

function LocationDisplay() {
  const location = useLocation();

  return <p data-testid="location">{location.pathname}</p>;
}

describe("ApplicationsPage", () => {
  it("shows a loading message while applications are being fetched", () => {
    vi.mocked(getApplications).mockReturnValue(
      new Promise(() => {}),
    );

    render(
      <MemoryRouter>
        <ApplicationsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Loading applications..."),
    ).toBeInTheDocument();
  });

  it("shows applications after the API request succeeds", async () => {
    vi.mocked(getApplications).mockResolvedValue([
      {
        id: 1,
        company: "Xero",
        roleTitle: "Junior Software Developer",
        location: "Auckland",
        status: "Applied",
        jobDescription: "Java and React role",
        closingDate: "2026-08-01",
        createdAt: "2026-07-26T10:00:00",
        userId: 1,
        userEmail: "zoey.xia@example.com",
        source: "SEEK",
        workMode: "Hybrid",
        workRightsRequirement: "NZ work rights",
        salaryRange: "$70,000–$80,000",
        contactPerson: null,
        jobUrl: null,
        careerLevel: "Junior",
        employmentType: "Full-time",
        graduateFriendly: true,
        sponsorshipAvailable: false,
        industry: "Technology",
        archived: false,
      },
    ]);

    render(
      <MemoryRouter>
        <ApplicationsPage />
      </MemoryRouter>,
    );

    const applicationLink = await screen.findByRole("link", {
      name: /Xero/,
    });
    expect(
      within(applicationLink).getByText("Applied"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Loading applications..."),
    ).not.toBeInTheDocument();
  });

  it("shows an error message when the API request fails", async () => {
    vi.mocked(getApplications).mockRejectedValue(
      new Error("Network error"),
    );

    render(
      <MemoryRouter>
        <ApplicationsPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Failed to load applications."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Loading applications..."),
    ).not.toBeInTheDocument();
  });

  it("navigates to the application detail page when a card is clicked", async () => {
    vi.mocked(getApplications).mockResolvedValue([
      {
        id: 1,
        company: "Xero",
        roleTitle: "Junior Software Developer",
        location: "Auckland",
        status: "Applied",
        jobDescription: "Java and React role",
        closingDate: "2026-08-01",
        createdAt: "2026-07-26T10:00:00",
        userId: 1,
        userEmail: "zoey.xia@example.com",
        source: "SEEK",
        workMode: "Hybrid",
        workRightsRequirement: "NZ work rights",
        salaryRange: "$70,000–$80,000",
        contactPerson: null,
        jobUrl: null,
        careerLevel: "Junior",
        employmentType: "Full-time",
        graduateFriendly: true,
        sponsorshipAvailable: false,
        industry: "Technology",
        archived: false,
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/applications"]}>
        <ApplicationsPage />
        <LocationDisplay />
      </MemoryRouter>,
    );

    const applicationLink = await screen.findByRole("link", {
      name: /Xero/,
    });

    fireEvent.click(applicationLink);

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/applications/1",
    );
  });
});
