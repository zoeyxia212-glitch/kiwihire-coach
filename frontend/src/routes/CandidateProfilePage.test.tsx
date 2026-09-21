import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CandidateProfilePage from "./CandidateProfilePage";
import { getCandidateProfile, getEvidenceItems, saveCandidateProfile } from "../utils/api";

vi.mock("../utils/api", () => ({
  createEvidenceItem: vi.fn(),
  deleteEvidenceItem: vi.fn(),
  getCandidateProfile: vi.fn(),
  getEvidenceItems: vi.fn(),
  saveCandidateProfile: vi.fn(),
  updateEvidenceItem: vi.fn(),
}));

const profile = {
  id: 1,
  preferredName: "Zoey",
  targetRoles: "Graduate Developer",
  workRights: "Open work visa",
  preferredLocations: "Auckland",
  careerStage: "Graduate",
  technicalSkills: "Java, React",
  experienceSummary: "Built KiwiHire Coach",
  starExamples: "Delivered a tested REST API",
  updatedAt: "2026-09-07T10:00:00",
};

describe("CandidateProfilePage", () => {
  beforeEach(() => {
    vi.mocked(getCandidateProfile).mockResolvedValue(profile);
    vi.mocked(getEvidenceItems).mockResolvedValue([]);
  });

  it("uses the normalized profile returned by the server after saving", async () => {
    vi.mocked(saveCandidateProfile).mockResolvedValue({
      ...profile,
      preferredName: "Zoey Xia",
    });
    render(<CandidateProfilePage />);

    const nameInput = await screen.findByLabelText("Preferred name");
    fireEvent.change(nameInput, { target: { value: "  Zoey Xia  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    expect(saveCandidateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ preferredName: "  Zoey Xia  " }),
    );
    await waitFor(() => expect(nameInput).toHaveValue("Zoey Xia"));
    expect(screen.queryByText("Candidate Profile has unsaved changes"))
      .not.toBeInTheDocument();
  });
});
