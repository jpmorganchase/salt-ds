import { Tooltip } from "@jpmorganchase/uitk-lab";

describe("GIVEN a Tooltip", () => {
  it('should not have the aria role "tooltip"', () => {
    cy.mount(
      <Tooltip open>
        <button>Hover</button>
      </Tooltip>
    );
    cy.findByRole("tooltip").should("not.exist");
  });

  it("should not display if a title is not supplied", () => {
    cy.mount(
      // @ts-ignore
      <Tooltip data-testid={"tooltip"} open>
        <button>Hover</button>
      </Tooltip>
    );

    cy.findByTestId("tooltip").should("not.exist");
  });

  describe("When the tooltip is shown by focus", () => {
    it("should be dismissible with Escape", () => {
      const closeSpy = cy.stub().as("closeSpy");
      cy.mount(
        // @ts-ignore
        <Tooltip
          data-testid={"tooltip"}
          onClose={closeSpy}
          title="Tooltip title"
        >
          <button>Hover</button>
        </Tooltip>
      );

      cy.findByRole("button").focus();

      cy.findByTestId("tooltip").should("be.visible");

      cy.realPress("Escape");
      cy.get("@closeSpy").should("have.callCount", 1);
      cy.findByTestId("tooltip").should("not.exist");
    });
  });

  it("should stay open if the popper element is hovered", () => {
    cy.mount(
      // @ts-ignore
      <Tooltip data-testid={"tooltip"} title="Tooltip title">
        <button>Hover</button>
      </Tooltip>
    );

    cy.findByRole("button").realHover();

    cy.findByTestId("tooltip").should("be.visible");

    cy.findByTestId("tooltip").realHover();

    cy.findByTestId("tooltip").should("be.visible");
  });
});
