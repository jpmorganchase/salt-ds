import { render, screen } from "@testing-library/react";

import { Highlighter } from "../../list/internal/Highlighter";

describe("A highlighter", () => {
  it("should handle empty text", () => {
    render(
      <span data-testid="test-string">
        <Highlighter text="" />
      </span>
    );

    expect(screen.getByTestId("test-string")).toHaveTextContent("");
  });

  it("should not highlight anything with an invalid match regex", () => {
    render(
      <span>
        <Highlighter text="Lorem ipsum dolor sit amet" />
      </span>
    );

    expect(screen.getByText("Lorem ipsum dolor sit amet")).toBeInTheDocument();
  });

  describe("when using a string match", () => {
    it("should not highlight anything if there is no match", () => {
      render(
        <span>
          <Highlighter
            matchPattern="not found"
            text="Lorem ipsum dolor sit amet"
          />
        </span>
      );

      expect(
        screen.getByText("Lorem ipsum dolor sit amet")
      ).toBeInTheDocument();
    });

    it("should highlight matched text with correct style", () => {
      const { container } = render(
        <span data-testid="test-string">
          <Highlighter matchPattern="OR" text="Lorem ipsum dolor sit amet" />
        </span>
      );

      expect(
        container.querySelectorAll(`.uitkHighlighter-highlight`)
      ).toHaveLength(2);
      // And full text is returned
      expect(screen.getByTestId("test-string")).toHaveTextContent(
        "Lorem ipsum dolor sit amet"
      );
    });
  });

  describe("when using a regex match", () => {
    it("should not highlight anything if there is no match", () => {
      render(
        <span>
          <Highlighter
            matchPattern={/(not found)/gi}
            text="Lorem ipsum dolor sit amet"
          />
        </span>
      );

      expect(
        screen.getByText("Lorem ipsum dolor sit amet")
      ).toBeInTheDocument();
    });

    it("should highlight matched text with correct style", () => {
      render(
        <span data-testid="test-string">
          <Highlighter
            matchPattern={/(\w{1,2}m)/gi}
            text="Lorem ipsum dolor sit amet"
          />
        </span>
      );

      expect(screen.getByText("rem")).toHaveClass("uitkHighlighter-highlight");
      expect(screen.getByText("sum")).toHaveClass("uitkHighlighter-highlight");
      expect(screen.getByText("am")).toHaveClass("uitkHighlighter-highlight");

      // And full text is returned
      expect(screen.getByTestId("test-string")).toHaveTextContent(
        "Lorem ipsum dolor sit amet"
      );
    });
  });
});
