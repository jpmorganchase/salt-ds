import { Pill } from "../../../pill";

describe("GIVEN a Pill", () => {
  it("THEN should render a `standard` Pill", () => {
    cy.mount(<Pill>Pill text</Pill>);
    cy.findByText("Pill text");
  });

  describe("GIVEN an onClick handler", () => {
    it("THEN should render a clickable Pill", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Pill onClick={clickSpy}>Clickable Pill</Pill>);
      cy.findByRole("button").should("have.text", "Clickable Pill");
    });

    it("THEN should call onClick when Pill is clicked", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Pill onClick={clickSpy}>label</Pill>);
      cy.findByRole("button").click();
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    it("THEN should call onClick when Enter is pressed", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Pill onClick={clickSpy}>label</Pill>);
      cy.findByRole("button").focus();
      cy.realPress("{enter}");
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    it("THEN should call onClick when Space is pressed", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Pill onClick={clickSpy}>label</Pill>);
      cy.findByRole("button").focus();
      cy.realPress(" ");
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    describe("GIVEN a disabled prop", () => {
      it("THEN should render a `disabled` Pill", () => {
        const clickSpy = cy.stub().as("clickSpy");
        cy.mount(
          <Pill onClick={clickSpy} disabled>
            Pill disabled
          </Pill>
        );
        cy.findByRole("button").should("have.attr", "disabled");
      });
    });
  });

  it("SHOULD have no a11y violations on load", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Pill onClick={clickSpy}>Pill</Pill>);
    cy.checkAxeComponent();
  });
});
