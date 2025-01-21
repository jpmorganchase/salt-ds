import { RangeSlider } from "@salt-ds/lab";

describe("Given a Range Slider", () => {
  it("should have ARIA roles and attributes", () => {
    cy.mount(
      <RangeSlider
        style={{ width: "400px" }}
        min={5}
        max={125}
        step={5}
        defaultValue={[50, 100]}
      />,
    );

    // TODO Finish tests

    cy.findAllByRole("slider")
      .should("have.attr", "aria-valuemin", "5")
      .and("have.attr", "aria-valuemax", "125");
  });
});
