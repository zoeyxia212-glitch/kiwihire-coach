import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import Combobox from "./Combobox";

function Harness({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <Combobox
        value={value}
        onChange={setValue}
        options={["Xero", "Datacom", "Spark"]}
        placeholder="Company"
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("Combobox", () => {
  it("shows every option when the box is clicked", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("picks an option from the list", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Datacom" }));
    expect(screen.getByTestId("value")).toHaveTextContent("Datacom");
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("filters the list while typing", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sp" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: "Spark" })).toBeInTheDocument();
  });

  it("keeps a typed value that is not in the list", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Small Startup Ltd" },
    });
    expect(screen.getByTestId("value")).toHaveTextContent("Small Startup Ltd");
    expect(screen.queryByRole("option")).toBeNull();
  });
});
