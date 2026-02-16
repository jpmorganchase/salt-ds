import * as dialogStories from "@stories/dialog/dialog.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(dialogStories);

const {
  Default,
  Preheader,
  LongContent,
  LongContentWithAriaLabel,
  DialogContentAriaLabelledByOverride,
} = composedStories;

describe("GIVEN a Dialog", () => {
  describe("WHEN only header is provided", () => {
    it("THEN it should display a dialog by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltDialogHeader").should("be.visible");
      cy.get(".saltDialogContent").should("be.visible");
      cy.get(".saltDialogActions").should("be.visible");
    });

    it("THEN it should display the header", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltDialogHeader-header").should("be.visible");
    });

    it("THEN it should add the accent class to the title component", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltDialogHeader-withAccent").should("exist");
    });

    it("THEN it should display animations by default", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

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

        cy.findByRole("button", { name: "Open dialog" }).realClick();

        cy.findByRole("dialog").should("have.class", "saltDialog-medium-xl");
      },
    );
  });

  describe("WHEN preheader is provided", () => {
    it("THEN it should display the preheader", () => {
      cy.mount(<Preheader />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

      cy.get(".saltDialogHeader-header").contains("I am a preheader");
    });
  });

  describe("WHEN no header is provided", () => {
    it("THEN it should not have aria-labelledby attribute on the dialog", () => {
      cy.mount(<LongContentWithAriaLabel />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("dialog").should("not.have.attr", "aria-labelledby");
    });
  });

  describe("WHEN disableScrim is provided", () => {
    it("THEN it should not display the scrim", () => {
      cy.mount(<Default disableScrim />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltScrim").should("not.exist");
    });
  });

  describe("WHEN disableDismiss is provided", () => {
    it("THEN it should not close when clicking outside the dialog", () => {
      cy.mount(<Default disableDismiss />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltScrim").click("left", { force: true });
      cy.findByRole("dialog").should("exist");
    });
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

        cy.findByRole("button", { name: "Open dialog" }).realClick();

        cy.findByRole("dialog").should("have.class", "saltDialog-large-xl");
      },
    );

    it(
      "THEN it should display the correct size for the respective breakpoint",
      {
        viewportHeight: 900,
        viewportWidth: 600,
      },
      () => {
        cy.mount(<Default size={"small"} />);

        cy.findByRole("button", { name: "Open dialog" }).realClick();

        cy.findByRole("dialog").should("have.class", "saltDialog-small-sm");
      },
    );
  });

  describe("WHEN a Dialog is open", () => {
    it("THEN it should close when the close button is clicked", () => {
      cy.spy(console, "log").as("consoleSpy");

      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

      cy.findByRole("dialog").should("be.visible");

      cy.get("@consoleSpy").then((spy) => {
        // biome-ignore lint/suspicious/noExplicitAny: Cypress types
        const callCount = (spy as any).callCount;

        cy.findByLabelText("Close dialog").click();
        cy.findByRole("dialog").should("not.exist");

        cy.get("@consoleSpy").should("have.callCount", callCount + 1); // Test unmount regression #3153
      });
    });

    it("THEN it should close when the ESC key is pressed", () => {
      cy.mount(<Default />);

      cy.findByRole("button", { name: "Open dialog" }).realClick();

      cy.findByRole("dialog").should("be.visible");

      cy.realPress("Escape");

      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should close when clicking outside the dialog", () => {
      cy.mount(<Default />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.get(".saltScrim").click("left", { force: true });
      cy.findByRole("dialog").should("not.exist");
    });

    it("THEN it should trap focus inside the Dialog", () => {
      cy.mount(<Default />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findAllByRole("button", { name: "Close dialog" }).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button", { name: "Cancel" }).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button", { name: "Previous" }).should("be.focused");
      cy.realPress("Tab");
      cy.findAllByRole("button", { name: "Next" }).should("be.focused");
      cy.realPress("Tab");
      //back to the first button
      cy.findAllByRole("button", { name: "Close dialog" }).should("be.focused");
    });

    it("THEN should support initialFocus being set", () => {
      cy.mount(<Default initialFocus={3} />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("button", { name: "Next" }).should("be.focused");
    });

    it("THEN its content should not have role region, tabIndex 0 or labelledby by dialog by default", () => {
      cy.mount(<Default />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");

      cy.findByRole("dialog")
        .find("div.saltDialogContent-inner")
        .should("not.have.attr", "role", "region")
        .and("not.have.attr", "tabIndex", "0")
        .and("not.have.attr", "aria-labelledby");
    });

    it("THEN should have correct accessible name", () => {
      cy.mount(<Default />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog").should("be.visible");
      cy.findByRole("dialog", {
        name: "Congratulations! You have created a Dialog.",
      }).should("be.visible");
    });
  });

  describe("WHEN vertically overflowing content is detected", () => {
    it("THEN it should add padding to the right of the scroll bar", () => {
      cy.mount(<LongContent />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog")
        .find("div.saltDialogContent-overflow")
        .should("exist");
    });
  });

  it("THEN should allow user to override dialog id", () => {
    cy.mount(<Default id="user-provided-id" />);
    cy.findByRole("button", { name: "Open dialog" }).realClick();

    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("dialog").should("have.attr", "id", "user-provided-id");
  });

  it("THEN should use idProp as header id and aria-labelledby", () => {
    cy.mount(<Default idProp="user-provided-header-id" />);
    cy.findByRole("button", { name: "Open dialog" }).realClick();

    cy.findByRole("dialog").should(
      "have.attr",
      "aria-labelledby",
      "user-provided-header-id",
    );

    cy.findByRole("dialog")
      .find("h2.saltDialogHeader-header")
      .should("have.attr", "id", "user-provided-header-id");
  });
});

describe("GIVEN a Dialog with scrollable content", () => {
  it("THEN it should have role region, tabIndex 0 and labelledby by dialog by default", () => {
    cy.mount(<LongContent />);
    cy.findByRole("button", { name: "Open dialog" }).realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("dialog")
      .findByRole("region", {
        name: "Congratulations! You have created a Dialog.",
      })
      .and("have.attr", "tabIndex", "0")
      .and("have.attr", "aria-labelledby");
  });

  it("THEN should use user provided aria-label for the content region name", () => {
    cy.mount(<LongContentWithAriaLabel />);
    cy.findByRole("button", { name: "Open dialog" }).realClick();

    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("dialog", { name: "Aria labelled dialog" }).should(
      "be.visible",
    );
    cy.findByRole("region", { name: "Aria labelled dialog" }).should(
      "be.visible",
    );
  });

  it("THEN should allow user to override content aria-labelledby", () => {
    cy.mount(<DialogContentAriaLabelledByOverride />);
    cy.findByRole("button", { name: "Open dialog" }).realClick();
    cy.findByRole("dialog").should("be.visible");
    cy.findByRole("region").should(
      "have.attr",
      "aria-labelledby",
      "user-provided-aria-labelledby",
    );
  });
});
