import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import SuggestSelect from "./SuggestSelect";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <SuggestSelect
        value={value}
        onChange={setValue}
        options={["Auckland", "Wellington"]}
        placeholder="City"
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("SuggestSelect", () => {
  it("picks a listed option", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Wellington" },
    });
    expect(screen.getByTestId("value")).toHaveTextContent("Wellington");
    expect(screen.queryByPlaceholderText("City")).toBeNull();
  });

  it("lets the user type their own value", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "__other__" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "Napier" },
    });
    expect(screen.getByTestId("value")).toHaveTextContent("Napier");
  });

  it("shows the text box for a saved value that is not in the list", () => {
    render(<Harness initial="Napier" />);
    expect(screen.getByPlaceholderText("City")).toHaveValue("Napier");
  });
});
