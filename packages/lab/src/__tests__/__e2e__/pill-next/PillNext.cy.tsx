import { PillNext } from "../../../pill-next";
import { CallIcon } from "@salt-ds/icons";

describe("GIVEN a Pill", () => {
  it("THEN should render a `standard` Pill", () => {
    cy.mount(<PillNext>Pill text</PillNext>);
    cy.findByText("Pill text");
  });

  describe("GIVEN an onClick handler", () => {
    it("THEN should render a clickable Pill", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<PillNext onClick={clickSpy}>Clickable Pill</PillNext>);
      cy.findByRole("button").should("have.text", "Clickable Pill");
    });

    it("THEN should call onClick when Pill is clicked", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<PillNext onClick={clickSpy}>label</PillNext>);
      cy.findByRole("button").click();
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    it("THEN should call onClick when Enter is pressed", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<PillNext onClick={clickSpy}>label</PillNext>);
      cy.findByRole("button").focus();
      cy.realPress("{enter}");
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    it("THEN should call onClick when Space is pressed", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<PillNext onClick={clickSpy}>label</PillNext>);
      cy.findByRole("button").focus();
      cy.realPress(" ");
      cy.get("@clickSpy").should("have.callCount", 1);
    });

    describe("GIVEN a disabled prop", () => {
      it("THEN should render a `disabled` Pill", () => {
        const clickSpy = cy.stub().as("clickSpy");
        cy.mount(
          <PillNext onClick={clickSpy} disabled>
            Pill disabled
          </PillNext>
        );
        cy.findByRole("button").should("have.attr", "disabled");
      });
    });
  });

  describe("GIVEN an icon prop", () => {
    it("THEN should render an icon given icon component", () => {
      cy.mount(<PillNext icon={<CallIcon />}>label</PillNext>);
      cy.findByTestId(/CallIcon/i).should("exist");
    });
  });

  describe("GIVEN a closable pill", () => {
    it("THEN should not trigger close by clicking the pill", () => {
      const clickSpy = cy.stub().as("clickSpy");
      const closeSpy = cy.stub().as("closeSpy");
      cy.mount(
        <PillNext onClick={clickSpy} onClose={closeSpy}>
          Closable Pill
        </PillNext>
      );
      cy.findByTestId("pill").realClick();
      cy.get("@clickSpy").should("have.callCount", 1);
      cy.get("@closeSpy").should("have.callCount", 0);
    });
    it("THEN should close the pill on clicking the close button", () => {
      const clickSpy = cy.stub().as("clickSpy");
      const closeSpy = cy.stub().as("closeSpy");
      cy.mount(
        <PillNext onClick={clickSpy} onClose={closeSpy}>
          Closable Pill
        </PillNext>
      );
      cy.findByTestId("pill-close-button").realClick();
      cy.get("@clickSpy").should("have.callCount", 0);
      cy.get("@closeSpy").should("have.callCount", 1);
    });
    it("WHEN interacting via keyboard", () => {
      it("THEN should close on backspace", () => {
        const closeSpy = cy.stub().as("closeSpy");
        cy.mount(<PillNext onClose={closeSpy}>Closable Pill 1</PillNext>);
        cy.findByRole("button", { name: "Closable Pill" }).focus();
        cy.realPress("Tab");
        cy.realPress("Backspace");
        cy.findByTestId("pill-close-button").should("have.length", 0);
        cy.get("@closeSpy").should("have.callCount", 1);
      });
      it("THEN should close on delete", () => {
        const closeSpy = cy.stub().as("closeSpy");
        cy.mount(<PillNext onClose={closeSpy}>Closable Pill 1</PillNext>);
        cy.findByRole("button", { name: "Closable Pill" }).focus();
        cy.realPress("Tab");
        cy.realPress("Delete");
        cy.findByTestId("pill-close-button").should("have.length", 0);
        cy.get("@closeSpy").should("have.callCount", 1);
      });
      it("THEN should close on enter", () => {
        const closeSpy = cy.stub().as("closeSpy");
        cy.mount(<PillNext onClose={closeSpy}>Closable Pill 1</PillNext>);
        cy.findByRole("button", { name: "Closable Pill" }).focus();
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByTestId("pill-close-button").should("have.length", 0);
        cy.get("@closeSpy").should("have.callCount", 1);
      });
      it("THEN should close on space", () => {
        const closeSpy = cy.stub().as("closeSpy");
        cy.mount(<PillNext onClose={closeSpy}>Closable Pill 1</PillNext>);
        cy.findByRole("button", { name: "Closable Pill" }).focus();
        cy.realPress("Tab");
        cy.realPress(" ");
        cy.findByTestId("pill-close-button").should("have.length", 0);
        cy.get("@closeSpy").should("have.callCount", 1);
      });
    });
  });

  it("SHOULD have no a11y violations on load", () => {
    const clickSpy = cy.stub().as("clickSpy");
    cy.mount(<PillNext onClick={clickSpy}>Pill</PillNext>);
    cy.checkAxeComponent();
  });
});
