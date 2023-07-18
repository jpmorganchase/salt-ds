import { Pill } from "../../../pill";
import { CallIcon } from "@salt-ds/icons";

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
      cy.findByRole("button").should("have.attr", "tabindex", "0");
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
        cy.findByRole("button").should("have.attr", "aria-disabled", "true");
        cy.findByRole("button").should("have.attr", "tabindex", "-1");
        cy.findByRole("button").click();
        cy.findByRole("button").focus().realPress("{enter}").realPress(" ");
        cy.get("@clickSpy").should("have.callCount", 0);
      });
    });
  });

  describe("GIVEN an icon prop", () => {
    it("THEN should render an icon given icon component", () => {
      cy.mount(<Pill icon={<CallIcon />}>label</Pill>);
      cy.findByTestId(/CallIcon/i).should("exist");
    });
  });

  it("SHOULD have no a11y violations on load", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<Pill onClick={clickSpy}>Closable Pill</Pill>);
    cy.checkAxeComponent();
  });
});
