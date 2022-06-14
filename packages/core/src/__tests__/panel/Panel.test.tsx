import { render } from "@testing-library/react";
import { Panel } from "@jpmorganchase/uitk-core";

describe("GIVEN a Panel", () => {
  const text = "Lorem Ipsum";

  describe("children prop", () => {
    describe("AND a string is passed as a child", () => {
      it("THEN should display children", () => {
        const { getByText } = render(<Panel>{text}</Panel>);
        expect(getByText(text)).toBeDefined();
      });
    });

    describe("AND a node is passed as a child", () => {
      const node = <div data-testid="test"></div>;

      it("THEN should display children", () => {
        const { getByTestId } = render(<Panel>{node}</Panel>);
        expect(getByTestId("test")).toBeDefined();
      });
    });
  });

  describe("emphasis prop", () => {
    describe('WHEN the "high" emphasis is selected', () => {
      it('THEN should display "high" emphasis', () => {
        const { getByText } = render(
          <Panel className="uitkEmphasisHigh">{text}</Panel>
        );
        expect(getByText(text)).toHaveClass("uitkEmphasisHigh");
      });
    });
  });
});
