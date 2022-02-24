import { render } from "@testing-library/react";

import { Panel } from "../../panel";

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
    it('THEN should display "low" emphasis by default', () => {
      const { getByText } = render(<Panel>{text}</Panel>);
      expect(getByText(text)).toHaveClass("uitkPanel-lowEmphasis");
    });

    describe('WHEN the "medium" emphasis is selected', () => {
      it('THEN should display "medium" emphasis', () => {
        const { getByText } = render(<Panel emphasis="medium">{text}</Panel>);
        expect(getByText(text)).toHaveClass("uitkPanel-mediumEmphasis");
      });
    });
  });
});
