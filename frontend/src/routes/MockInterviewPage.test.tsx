import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResumeReview } from "../types/resumeReview";
import {
  getResumeReviewById,
  updateMockInterviewSessions,
  updateResumeReviewAnswers,
} from "../utils/api";
import MockInterviewPage from "./MockInterviewPage";

vi.mock("../utils/api", () => ({
  getResumeReviewById: vi.fn(),
  updateMockInterviewSessions: vi.fn(),
  updateResumeReviewAnswers: vi.fn(),
}));

const review: ResumeReview = {
  id: 7,
  applicationId: 4,
  resumeId: 2,
  company: "Kiwi Tech",
  roleTitle: "Junior Developer",
  resumeName: "Java CV",
  score: 78,
  matched: [],
  transferable: [],
  missing: [],
  suggestions: [],
  suggestionStatuses: [],
  questions: [{
    question: "Tell us about a difficult bug you fixed.",
    reason: "Tests practical debugging and communication.",
    answerGuide: "Use a clear STAR example.",
    relatedSkill: "Debugging",
  }],
  answers: [""],
  answerStatuses: ["Not started"],
  mockInterviewSessions: [],
  helpful: null,
  feedbackComment: null,
  workflowIntent: null,
  createdAt: "2026-09-07T10:00:00",
};

function renderPage() {
  render(
    <MemoryRouter initialEntries={["/reviews/7/mock-interview"]}>
      <Routes>
        <Route path="/reviews/:id/mock-interview" element={<MockInterviewPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("MockInterviewPage", () => {
  beforeEach(() => {
    vi.mocked(getResumeReviewById).mockReset();
    vi.mocked(updateResumeReviewAnswers).mockReset();
    vi.mocked(updateMockInterviewSessions).mockReset();
  });

  it("loads a role-specific interview question", async () => {
    vi.mocked(getResumeReviewById).mockResolvedValue(review);
    renderPage();

    expect(await screen.findByText(review.questions[0].question))
      .toBeInTheDocument();
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
  });

  it("saves answer progress without creating a completed session", async () => {
    vi.mocked(getResumeReviewById).mockResolvedValue(review);
    vi.mocked(updateResumeReviewAnswers).mockResolvedValue({
      ...review,
      answers: ["I reproduced the API error and checked the server logs."],
    });
    renderPage();

    fireEvent.change(await screen.findByLabelText("Your answer"), {
      target: {
        value: "I reproduced the API error and checked the server logs.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save progress" }));

    await waitFor(() => expect(updateResumeReviewAnswers).toHaveBeenCalledWith(
      7,
      ["I reproduced the API error and checked the server logs."],
    ));
    expect(updateMockInterviewSessions).not.toHaveBeenCalled();
    expect(await screen.findByText(/not counted as a completed session/i))
      .toBeInTheDocument();
  });

  it("warns before exiting with an unsaved answer", async () => {
    vi.mocked(getResumeReviewById).mockResolvedValue(review);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();

    fireEvent.change(await screen.findByLabelText("Your answer"), {
      target: { value: "An answer that has not been saved yet." },
    });
    fireEvent.click(screen.getByRole("link", { name: "Exit practice" }));

    expect(confirmSpy).toHaveBeenCalledWith(
      "You have unsaved answer changes. Exit without saving?",
    );
    confirmSpy.mockRestore();
  });

  it("asks before finishing with unanswered questions", async () => {
    vi.mocked(getResumeReviewById).mockResolvedValue(review);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage();

    fireEvent.click(await screen.findByRole("button", {
      name: "Finish interview",
    }));

    expect(confirmSpy).toHaveBeenCalledWith(
      "You have answered 0 of 1 questions. Finish this session anyway?",
    );
    expect(screen.queryByText("Self-review")).not.toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("prevents duplicate session saves and can start another session", async () => {
    vi.mocked(getResumeReviewById).mockResolvedValue(review);
    vi.mocked(updateResumeReviewAnswers).mockResolvedValue({
      ...review,
      answers: ["I checked the logs and reproduced the failure."],
    });
    vi.mocked(updateMockInterviewSessions).mockResolvedValue({
      ...review,
      answers: ["I checked the logs and reproduced the failure."],
      mockInterviewSessions: [{
        completedAt: "2026-09-07T11:00:00",
        questionCount: 1,
        confidence: 3,
        improvementNotes: "Add a clearer result.",
      }],
    });
    renderPage();

    fireEvent.change(await screen.findByLabelText("Your answer"), {
      target: { value: "I checked the logs and reproduced the failure." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Finish interview" }));
    fireEvent.click(screen.getByRole("button", { name: "Save session" }));

    const savedButton = await screen.findByRole("button", { name: "Session saved" });
    expect(savedButton).toBeDisabled();
    expect(updateMockInterviewSessions).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Start another session" }));
    expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
  });
});
