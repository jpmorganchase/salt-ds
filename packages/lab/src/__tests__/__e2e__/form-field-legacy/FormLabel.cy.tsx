import { FormLabel } from "@salt-ds/lab";

const labelText = "label text";

describe("GIVEN a FormLabel", () => {
  describe("WHEN label is given", () => {
    it("THEN label is rendered", () => {
      cy.mount(<FormLabel label="label text" />);
      cy.findByText(labelText).should("exist");
    });
  });

  describe("WHEN required is true", () => {
    it("THEN Required is rendered if displayedNecessity is set to required", () => {
      cy.mount(
        <FormLabel label="label text" required displayedNecessity="required" />
      );
      cy.findByText(/Required/).should("exist");
    });

    it("THEN Required is NOT rendered if displayedNecessity is not set", () => {
      cy.mount(<FormLabel label="label text" required />);
      cy.findByText(/Required/).should("not.exist");
    });

    it("THEN Required is NOT rendered if displayedNecessity is set to optional", () => {
      cy.mount(
        <FormLabel label="label text" required displayedNecessity="optional" />
      );
      cy.findByText(/Required/).should("not.exist");
    });
  });

  describe("WHEN required is false", () => {
    it("THEN Optional is rendered if displayedNecessity is set to optional", () => {
      cy.mount(
        <FormLabel
          label="label text"
          required={false}
          displayedNecessity="optional"
        />
      );
      cy.findByText(/Optional/).should("exist");
    });

    it("THEN Optional is NOT rendered if displayedNecessity is not set", () => {
      cy.mount(<FormLabel label="label text" required={false} />);
      cy.findByText(/Optional/).should("not.exist");
    });

    it("THEN Optional is NOT rendered if displayedNecessity is set to required", () => {
      cy.mount(
        <FormLabel
          label="label text"
          required={false}
          displayedNecessity="required"
        />
      );
      cy.findByText(/Optional/).should("not.exist");
    });
  });

  describe("WHEN show status indicator", () => {
    it("THEN info icon is rendered by default", () => {
      cy.mount(<FormLabel label="label text" hasStatusIndicator />);
      cy.findByTestId("InfoSolidIcon").should("exist");
    });

    it("THEN warning icon is rendered when validationStatus is warning", () => {
      cy.mount(
        <FormLabel
          label="label text"
          hasStatusIndicator
          validationStatus="warning"
        />
      );
      cy.findByTestId("WarningSolidIcon").should("exist");
    });

    it("THEN error icon is rendered when validationStatus is error", () => {
      cy.mount(
        <FormLabel
          label="label text"
          hasStatusIndicator
          validationStatus="error"
        />
      );
      cy.findByTestId("ErrorSolidIcon").should("exist");
    });
  });
});
