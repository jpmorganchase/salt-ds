import * as React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders theme editor welcome page", () => {
  render(<App />);
  const themeEditor = screen.getByText(/USE UITK THEME/i);
  expect(themeEditor).toBeInTheDocument();
});
