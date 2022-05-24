import * as React from "react";
import { render, screen } from "@testing-library/react";

test("true is not false", () => {
  render(<div>Hello world</div>);
  expect(screen.getByText("Hello world")).toBeInTheDocument();
});
