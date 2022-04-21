import { screen, render } from "@testing-library/react";

import { Badge } from "../../badge";
import { ClockIcon } from "@jpmorganchase/uitk-icons";

describe("GIVEN a Badge", () => {
  it("THEN can render a Badge with badge number larger than max", () => {
    render(<Badge badgeContent={100} max={99} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("THEN can render a Badge with badge number equal to max", () => {
    render(<Badge badgeContent={99} max={99} />);
    expect(screen.getByText("99")).toBeInTheDocument();
  });

  it("THEN can render a Badge with badge number smaller than max", () => {
    render(<Badge badgeContent={98} max={99} />);
    expect(screen.getByText("98")).toBeInTheDocument();
  });

  it("THEN can render a Badge with default icon", () => {
    render(<Badge badgeContent={98} />);
    expect(screen.getByTestId(/MessageIcon/i)).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
  });

  it("THEN can render with a custom text child", () => {
    render(<Badge badgeContent={1}>Lorem Ipsum</Badge>);
    expect(screen.getByText("Lorem Ipsum")).toBeInTheDocument();
  });

  it("THEN can render with a custom icon", () => {
    render(
      <Badge badgeContent={1}>
        <ClockIcon />
      </Badge>
    );
    expect(screen.getByTestId(/ClockIcon/i)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("THEN can render a badge with the default info variant", () => {
    render(<Badge data-testid="badge" />);
    expect(screen.getByTestId("badge")).toHaveClass("uitkBadge-info");
  });

  it("THEN can render a badge with the success variant", () => {
    render(<Badge data-testid="badge" variant="success" />);
    expect(screen.getByTestId("badge")).toHaveClass("uitkBadge-success");
  });

  it("THEN can render a badge with the error variant", () => {
    render(<Badge data-testid="badge" variant="error" />);
    expect(screen.getByTestId("badge")).toHaveClass("uitkBadge-error");
  });

  describe("Accessibility", () => {
    it("SHOULD reference the child and badge content with aria-labelledby", () => {
      render(
        <Badge badgeContent="BADGE_CONTENT">
          <div data-testid="badgeChild" />
        </Badge>
      );
      expect(screen.getByRole("img")).toHaveAttribute(
        "aria-labelledby",
        `${screen.getByTestId("badgeChild").id} ${
          screen.getByText("BADGE_CONTENT").id
        }`
      );
    });
  });
});
