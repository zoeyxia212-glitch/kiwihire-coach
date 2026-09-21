import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CoverLetterBuilder from "./CoverLetterBuilder";

describe("CoverLetterBuilder", () => {
  it("marks edits as unsaved and restores the saved draft", () => {
    render(
      <CoverLetterBuilder
        company="Xero"
        roleTitle="Graduate Developer"
        candidateName="Zoey Xia"
        contactPerson="Aroha Smith"
        evidenceItems={[]}
        initialDraft="Saved cover letter"
        onSave={vi.fn()}
      />,
    );

    const editor = screen.getByLabelText(/Editable draft/);
    fireEvent.change(editor, { target: { value: "Unsaved cover letter" } });

    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restore saved draft" }));

    expect(editor).toHaveValue("Saved cover letter");
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("saves the edited draft and clears the unsaved state", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CoverLetterBuilder
        company="Xero"
        roleTitle="Graduate Developer"
        candidateName="Zoey Xia"
        contactPerson=""
        evidenceItems={[]}
        initialDraft="Original draft"
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Editable draft/), {
      target: { value: "Updated draft" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Updated draft"));
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("pre-fills the hiring manager from the application contact", () => {
    render(
      <CoverLetterBuilder
        company="Xero"
        roleTitle="Graduate Developer"
        candidateName="Zoey Xia"
        contactPerson="Aroha Smith"
        evidenceItems={[]}
        initialDraft=""
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Hiring manager (optional)"))
      .toHaveValue("Aroha Smith");
    expect(screen.getByText(/Pre-filled from this application/))
      .toBeInTheDocument();
  });
});
