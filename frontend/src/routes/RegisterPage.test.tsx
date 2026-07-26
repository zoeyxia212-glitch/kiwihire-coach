import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";
import { registerUser } from "../utils/api";

vi.mock("../utils/api", () => ({
  registerUser: vi.fn(),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.mocked(registerUser).mockReset();
  });

  it("submits the form and shows a success message", async () => {
    vi.mocked(registerUser).mockResolvedValue({
      id: 1,
      email: "zoey@example.com",
      createdAt: "2026-07-26T15:30:00",
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "zoey@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", {
      name: "Create account",
    }));

    expect(registerUser).toHaveBeenCalledWith({
      email: "zoey@example.com",
      password: "password123",
    });
    expect(
      await screen.findByText(/Account created for zoey@example.com/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue to login" }),
    ).toHaveAttribute("href", "/login");
  });

  it("shows an error when registration fails", async () => {
    vi.mocked(registerUser).mockRejectedValue(
      new Error("An account already exists for this email."),
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "zoey@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", {
      name: "Create account",
    }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "An account already exists for this email.",
    );
  });
});
