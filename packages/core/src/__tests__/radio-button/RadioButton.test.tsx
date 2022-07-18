import { render } from "@testing-library/react";
import { RadioButton } from "../../radio-button";

describe("GIVEN a RadioButton component", () => {
  describe("WHEN RadioButton is given a default checked", () => {
    it("SHOULD render with the specified defaultChecked", () => {
      const { getByRole } = render(<RadioButton defaultChecked />);

      expect(getByRole("radio")).toBeChecked();
    });
  });

  describe("WHEN RadioButton is given a value", () => {
    it("SHOULD render with the specified value", () => {
      const { getByRole } = render(<RadioButton value="some value" />);

      expect(getByRole("radio")).toHaveAttribute("value", "some value");
    });
  });

  describe("WHEN RadioButton is set to checked", () => {
    it("SHOULD render checked", () => {
      const { getByRole } = render(<RadioButton checked />);

      expect(getByRole("radio")).toBeChecked();
    });
  });

  describe("WHEN RadioButton is disabled", () => {
    it("SHOULD render disabled", () => {
      const { getByRole } = render(<RadioButton disabled />);

      expect(getByRole("radio")).toBeDisabled();
    });
  });
});
