import * as React from "react";
import { render, screen } from "@testing-library/react";
import { App } from "../App";

test("renders learn react link", () => {
  render(<App />);
  const uitkThemeButton = screen.getByText(/USE UITK THEME/i);
  expect(uitkThemeButton).toBeInTheDocument();
});
