import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "../../button";

describe("Given a Button", () => {
  const text = "Text";

  test("text as children is rendered", () => {
    render(<Button>{text}</Button>);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("should be focusable when disabled and focusableWhenDisabled", () => {
    const { container } = render(
      <Button disabled focusableWhenDisabled>
        {text}
      </Button>
    );
    expect(container.firstChild).toHaveAttribute("tabIndex", "0");
  });
});
