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

    describe("GIVEN an onClose prop", () => {
      it("THEN should render two buttons, on for a `closable` Pill and the default wrapper", () => {
        const clickSpy = cy.stub().as("clickSpy");
        const deleteSpy = cy.stub().as("deleteSpy");
        cy.mount(
          <Pill onClick={clickSpy} onClose={deleteSpy}>
            Closable Pill
          </Pill>
        );
        cy.findAllByRole("button").should("have.length", 2);
        cy.findAllByRole("button").eq(0).should("have.text", "Closable Pill");
        cy.findAllByRole("button")
          .eq(1)
          .should("have.attr", "aria-label", "Close Pill");
      });
      it("THEN the close button should NOT be focusable", () => {
        const clickSpy = cy.stub().as("clickSpy");
        const deleteSpy = cy.stub().as("deleteSpy");
        cy.mount(
          <Pill onClick={clickSpy} onClose={deleteSpy}>
            Closable Pill
          </Pill>
        );
        cy.findByRole("button", { name: "Close Pill" }).should(
          "have.attr",
          "tabindex",
          "-1"
        );
      });
      it("THEN call the onClose when the user presses {Backspace} when focused on the Pill", () => {
        const clickSpy = cy.stub().as("clickSpy");
        const deleteSpy = cy.stub().as("deleteSpy");
        cy.mount(
          <Pill onClick={clickSpy} onClose={deleteSpy}>
            Closable Pill
          </Pill>
        );
        cy.findByRole("button", { name: "Closable Pill" })
          .focus()
          .realPress("{backspace}");

        cy.get("@deleteSpy").should("have.callCount", 1);
      });

      describe("GIVEN user clicks the close button", () => {
        it("THEN calls the onClose callback", () => {
          const clickSpy = cy.stub().as("clickSpy");
          const deleteSpy = cy.stub().as("deleteSpy");
          cy.mount(
            <Pill onClick={clickSpy} onClose={deleteSpy}>
              Closable Pill
            </Pill>
          );
          cy.findByRole("button", { name: "Close Pill" }).click();

          cy.get("@deleteSpy").should("have.callCount", 1);
        });
        it("THEN should NOT call onClick callback", () => {
          const clickSpy = cy.stub().as("clickSpy");
          const deleteSpy = cy.stub().as("deleteSpy");
          cy.mount(
            <Pill onClick={clickSpy} onClose={deleteSpy}>
              Closable Pill
            </Pill>
          );
          cy.findByRole("button", { name: "Close Pill" }).click();

          cy.get("@deleteSpy").should("have.callCount", 1);
          cy.get("@clickSpy").should("have.callCount", 0);
        });
      });

      describe("GIVEN user hovers the close button", () => {
        it("THEN should apply a nestedHover class on the Pill", () => {
          const clickSpy = cy.stub().as("clickSpy");
          const deleteSpy = cy.stub().as("deleteSpy");
          cy.mount(
            <Pill onClick={clickSpy} onClose={deleteSpy}>
              Closable Pill
            </Pill>
          );
          cy.findByRole("button", { name: "Close Pill" }).realHover();

          cy.findByRole("button", { name: "Closable Pill" }).should(
            "have.class",
            "saltPill-nestedHover"
          );
        });
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
    const deleteSpy = cy.stub().as("deleteSpy");
    cy.mount(
      <Pill onClick={clickSpy} onClose={deleteSpy}>
        Closable Pill
      </Pill>
    );
    cy.checkAxeComponent();
  });
});
