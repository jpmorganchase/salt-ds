import * as dialogStories from "@stories/dialog/dialog.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(dialogStories);

const { Default, Preheader, LongContent } = composedStories;

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
  });
  describe("WHEN overflowing content is detected", () => {
    it("THEN it should add padding to the right of the scroll bar", () => {
      cy.mount(<LongContent style={{ height: 300 }} />);
      cy.findByRole("button", { name: "Open dialog" }).realClick();
      cy.findByRole("dialog")
        .find("div.saltDialogContent-overflow")
        .should("exist");
    });
  });
});

// scrollable content should have role region, tabIndex 0 and labelledby by dialog by default
// non-scrollable content should not have role, tabIndex or labelledby by dialog by default
// Dialog content with aria-label and no aria-labelledby should keep aria-label regardless of overflow
// Dialog content should inherit accessible dialog name when dialog is labelled using aria-label
// Dialog content should prioritize user provided aria-labelledby regardless of overflow
// Dialog should prioritize user provided id over generated id for aria-labelledby
// TBC - Dialog name should not include close button/actions
