import { render, screen } from "@testing-library/react";
import { Link } from "../../link";

describe("GIVEN a link", () => {
  test("WHEN passed children node, THEN children should be rendered", () => {
    const testId = "children-testid";
    render(
      <Link href="#root">
        <strong data-testid={testId}>hello world</strong>
      </Link>
    );
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  test('WHEN passed target="_blank", THEN should render the Link with the tear out icon', () => {
    render(
      <Link href="#root" target="_blank">
        Action
      </Link>
    );

    expect(screen.getByTestId(/TearOutIcon/i)).toBeInTheDocument();
  });

  test("WHEN passed disabled prop, THEN should render the Link with disabled class", () => {
    const testid = "disabled-link";
    render(
      <Link disabled href="#root" data-testid={testid}>
        Action
      </Link>
    );

    expect(screen.getByTestId(testid)).toHaveClass("uitkLink-disabled");
  });
});
