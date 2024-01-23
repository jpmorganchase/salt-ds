import { composeStories } from "@storybook/react";
import * as dialogStories from "@stories/dialog/dialog.stories";

const composedStories = composeStories(dialogStories);

const { Default, InfoStatus } = composedStories;

describe("GIVEN a Dialog", () => {
  describe("WHEN no props are provided", () => {
    it("THEN it should display a dialog by default", () => {
      cy.mount(<Default />);

      cy.get(".saltButton").click();

      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltDialogTitle").should("be.visible");
      cy.get(".saltDialogContent").should("be.visible");
      cy.get(".saltDialogActions").should("be.visible");
    });

    it("THEN it should add the accent class to the title component", () => {
      cy.mount(<Default />);
      cy.get(".saltButton").click();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltDialogTitle-withAccent").should("exist");
    });

    it("THEN it should display animations by default", () => {
      cy.mount(<Default />);

      cy.get(".saltButton").click();

      cy.findByRole("dialog").should("have.class", "saltDialog-enterAnimation");
    });

    it(
      "THEN it should display medium size by default",
      {
        viewportHeight: 900,
        viewportWidth: 1921,
      },
      () => {
        cy.mount(<Default />);

        cy.get(".saltButton").click();

        cy.findByRole("dialog").should("have.class", "saltDialog-medium-xl");
      }
    );
  });

  describe("WHEN a size is provided", () => {
    it(
      "THEN it should display the correct size for the respective breakpoint",
      {
        viewportHeight: 900,
        viewportWidth: 1921,
      },
      () => {
        cy.mount(<Default size={"large"} />);

        cy.get(".saltButton").click();

        cy.findByRole("dialog").should("have.class", "saltDialog-large-xl");
      }
    );

    it(
      "THEN it should display the correct size for the respective breakpoint",
      {
        viewportHeight: 900,
        viewportWidth: 600,
      },
      () => {
        cy.mount(<Default size={"small"} />);

        cy.get(".saltButton").click();

        cy.get(".saltDialog").should("have.class", "saltDialog-small-xs");
      }
    );
  });

  describe("WHEN a Dialog is open", () => {
    it("THEN it should close when the close button is clicked", () => {
      cy.mount(<Default />);

      cy.get(".saltButton").click();

      cy.findByRole("dialog").should("be.visible");

      cy.findByLabelText("Close dialog").click();

      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should close when the ESC key is pressed", () => {
      cy.mount(<Default />);

      cy.get(".saltButton").click();

      cy.get(".saltDialog").should("be.visible");

      cy.realPress("Escape");

      cy.get(".saltDialog").should("not.exist");
    });

    it("THEN it should close when clicking outside the dialog", () => {
      cy.mount(<InfoStatus />);
      cy.get(".saltButton").click();
      cy.get(".saltDialog").should("be.visible");
      cy.get(".saltScrim").click("left");
      cy.get(".saltDialog").should("not.exist");
    });

    it("THEN it should trap focus inside the Dialog", () => {
      cy.mount(<Default />);
      cy.get(".saltButton").click();
      cy.get(".saltDialog").should("be.visible");
      cy.findAllByRole("button").eq(0).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button").eq(1).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button").eq(2).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button")
        .eq(3)
        .should("be.focused")
        .should("have.attr", "aria-label", "Close dialog");
      cy.realPress("Tab");
      //back to the first button
      cy.findAllByRole("button").eq(0).should("be.focused");
    });
  });
});
