import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResumeEditor from "./ResumeEditor";
import { getResumes } from "../utils/api";

vi.mock("../utils/api", () => ({
  createResume: vi.fn(),
  deleteResume: vi.fn(),
  getResumes: vi.fn(),
  updateResume: vi.fn(),
}));

describe("ResumeEditor", () => {
  beforeEach(() => {
    vi.mocked(getResumes).mockResolvedValue([
      {
        id: 1,
        name: "Backend resume",
        purpose: "Java roles",
        content: "Saved resume content",
        createdAt: "2026-09-07T10:00:00",
        updatedAt: "2026-09-07T10:00:00",
      },
    ]);
  });

  it("keeps the current draft when switching resumes is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <MemoryRouter>
        <ResumeEditor />
      </MemoryRouter>,
    );

    await screen.findByText("Backend resume");
    const editor = screen.getByLabelText("Resume text");
    fireEvent.change(editor, { target: { value: "My unsaved draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        "Discard your unsaved resume changes?",
      );
    });
    expect(editor).toHaveValue("My unsaved draft");
  });
});
