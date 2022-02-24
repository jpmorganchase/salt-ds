import { render, screen } from "@testing-library/react";
import { Card } from "../../card";

describe("GIVEN a Card", () => {
  describe("WHEN nested dom elements are passed", () => {
    it("THEN should render", () => {
      render(
        <Card>
          <>
            <h1>This is header</h1>
            <span>This is content</span>
          </>
        </Card>
      );
      expect(screen.getByText("This is header")).toBeInTheDocument();
    });
  });
});
