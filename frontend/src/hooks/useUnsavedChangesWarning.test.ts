import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";

describe("useUnsavedChangesWarning", () => {
  it("only prevents leaving when changes are unsaved", () => {
    const { rerender } = renderHook(
      ({ isDirty }) => useUnsavedChangesWarning(isDirty),
      { initialProps: { isDirty: false } },
    );

    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    rerender({ isDirty: true });

    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });

  it("lets the user cancel an internal link navigation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHook(() => useUnsavedChangesWarning(true));
    const link = document.createElement("a");
    link.href = "/applications";
    document.body.append(link);

    const click = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    link.dispatchEvent(click);

    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Leave this page?",
    );
    expect(click.defaultPrevented).toBe(true);
    link.remove();
  });
});
