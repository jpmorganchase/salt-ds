import { RadioButton } from "@jpmorganchase/uitk-core";

describe("GIVEN a RadioButton component", () => {
  describe("WHEN RadioButton is given a default checked", () => {
    it("SHOULD render with the specified defaultChecked", () => {
      cy.mount(<RadioButton defaultChecked />);

      cy.findByRole("radio").should("be.checked");
    });
  });

  describe("WHEN RadioButton is given a value", () => {
    it("SHOULD render with the specified value", () => {
      cy.mount(<RadioButton value="some value" />);

      cy.findByRole("radio").should("have.value", "some value");
    });
  });

  describe("WHEN RadioButton is set to checked", () => {
    it("SHOULD render checked", () => {
      cy.mount(<RadioButton checked />);

      cy.findByRole("radio").should("be.checked");
    });
  });

  describe("WHEN RadioButton is disabled", () => {
    it("SHOULD render disabled", () => {
      cy.mount(<RadioButton disabled />);

      cy.findByRole("radio").should("be.disabled");
    });
  });
});
