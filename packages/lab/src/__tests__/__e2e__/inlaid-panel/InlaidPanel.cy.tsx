import { InlaidPanel } from "@salt-ds/lab";
import * as inlaidPanel from "@stories/inlaid-panel/inlaid-panel.stories";
import { composeStories } from "@storybook/react-vite";

const { Left, Right, Top, Bottom } = composeStories(inlaidPanel);

describe("GIVEN an InlaidPanel", () => {
  it("WHEN the Left panel is opened and closed via Close button, THEN should open and close correctly", () => {
    cy.mount(<Left />);

    cy.findByRole("button", { name: "Open Left Panel" }).click();

    cy.findByRole("region", {
      name: "Section Title",
    }).should("be.visible");
    cy.findByRole("region").should("have.class", "saltInlaidPanel-left");

    cy.findByRole("button", { name: "Close" }).click();

    cy.get(".saltInlaidPanel").should("not.exist");
  });

  it("WHEN each position variant is opened and closed via Close button, THEN each panel shows the correct position class and is fully removed on close", () => {
    cy.mount(<Right />);
    cy.findByRole("button", { name: "Open Right Panel" }).click();
    cy.findByRole("region").should("have.class", "saltInlaidPanel-right");
    cy.findByRole("button", { name: "Close" }).click();
    cy.get(".saltInlaidPanel").should("not.exist");

    cy.mount(<Top />);
    cy.findByRole("button", { name: "Open top panel" }).click();
    cy.findByRole("region").should("have.class", "saltInlaidPanel-top");
    cy.findByRole("button", { name: "Close" }).click();
    cy.get(".saltInlaidPanel").should("not.exist");

    cy.mount(<Bottom />);
    cy.findByRole("button", { name: "Open bottom panel" }).click();
    cy.findByRole("region").should("have.class", "saltInlaidPanel-bottom");
    cy.findByRole("button", { name: "Close" }).click();
    cy.get(".saltInlaidPanel").should("not.exist");
  });

  it("WHEN the Left panel is opened and the user tabs through fields then presses Escape, THEN focus is managed correctly throughout", () => {
    cy.mount(<Left />);

    cy.findByRole("button", { name: "Open Left Panel" }).click();

    cy.focused().should("have.text", "Close");

    cy.realPress("Tab");
    cy.findByRole("region").should("be.visible");

    cy.realPress("Tab");
    cy.findByRole("region").should("be.visible");

    cy.realPress("Tab");
    cy.findByRole("region").should("be.visible");

    cy.realPress("Escape");

    cy.get(".saltInlaidPanel").should("not.exist");
    cy.focused().should("have.text", "Open Left Panel");
  });

  it("WHEN the Left panel is dismissed with Escape and the trigger is clicked again, THEN the panel re-opens fresh", () => {
    cy.mount(<Left />);

    cy.findByRole("button", { name: "Open Left Panel" }).click();
    cy.findByRole("region").should("be.visible");

    cy.realPress("Escape");
    cy.get(".saltInlaidPanel").should("not.exist");
    cy.focused().should("have.text", "Open Left Panel");

    cy.findByRole("button", { name: "Open Left Panel" }).click();
    cy.findByRole("region").should("be.visible");
    cy.findByRole("region").should("have.attr", "role", "region");
  });

  it("WHEN the Left panel is open, THEN it has correct ARIA attributes and onOpenChange fires with false on Escape", () => {
    const onOpenChange = cy.spy().as("onOpenChange");
    cy.mount(
      <InlaidPanel
        open={true}
        onOpenChange={onOpenChange}
        aria-label="Test panel"
      >
        Content
      </InlaidPanel>,
    );

    cy.findByRole("region").should("be.visible");
    cy.findByRole("region").should("have.attr", "aria-label", "Test panel");

    cy.realPress("Escape");

    cy.get("@onOpenChange").should("have.been.calledWith", false);
  });
});
