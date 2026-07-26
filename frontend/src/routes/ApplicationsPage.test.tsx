import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "./ApplicationsPage";
import { getApplicationsForUser } from "../utils/api";

vi.mock("../utils/api", () => ({
  getApplicationsForUser: vi.fn(),
}));

function LocationDisplay() {
  const location = useLocation();

  return <p data-testid="location">{location.pathname}</p>;
}

describe("ApplicationsPage", () => {
  it("shows a loading message while applications are being fetched", () => {
    vi.mocked(getApplicationsForUser).mockReturnValue(
      new Promise(() => {}),
    );

    render(<ApplicationsPage />);

    expect(
      screen.getByText("Loading applications..."),
    ).toBeInTheDocument();
  });

  it("shows applications after the API request succeeds", async () => {
    vi.mocked(getApplicationsForUser).mockResolvedValue([
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
      },
    ]);

    render(
      <MemoryRouter>
        <ApplicationsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Xero")).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(
      screen.queryByText("Loading applications..."),
    ).not.toBeInTheDocument();
  });

  it("shows an error message when the API request fails", async () => {
    vi.mocked(getApplicationsForUser).mockRejectedValue(
      new Error("Network error"),
    );

    render(<ApplicationsPage />);

    expect(
      await screen.findByText("Failed to load applications."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Loading applications..."),
    ).not.toBeInTheDocument();
  });

  it("navigates to the application detail page when a card is clicked", async () => {
    vi.mocked(getApplicationsForUser).mockResolvedValue([
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
