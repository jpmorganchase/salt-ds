import { Toggletip, ToggletipPanel, ToggletipTrigger } from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import * as toggletipStories from "@stories/toggletip/toggletip.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const composedStories = composeStories(toggletipStories);

const { Default, InteractiveContent, LongContent } = composedStories;

checkAccessibility(composedStories);

describe("GIVEN a Toggletip", () => {
  it("lets a keyboard user tab from the previous control into a text-only toggletip and back out to the next control", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );

    cy.findByRole("button", { name: "Before" }).should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");

    cy.realPress("Enter");
    cy.findByRole("dialog")
      .should("be.visible")
      .should("contain.text", "More info")
      .should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "After" }).should("have.focus");
  });

  it("returns focus to the trigger when a keyboard user closes the toggletip with Escape", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );

    cy.findByRole("button", { name: "Before" }).should("have.focus");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");

    cy.realPress("Space");
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress("Escape");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");
  });

  it("keeps keyboard focus flowing through interactive panel content and then back into page order", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <InteractiveContent />
        <button type="button">After</button>
      </div>,
    );

    cy.findByRole("button", { name: "Before" }).should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");

    cy.realPress("Enter");
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Link" }).should("have.focus");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("dialog").should("have.focus");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Help info" }).should("have.focus");
    cy.findByRole("dialog").should("be.visible");

    cy.realPress("Enter");
    cy.findByRole("dialog").should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Link" }).should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "After" }).should("have.focus");
  });

  it("lets a pointer user open the toggletip, exposes dialog semantics, and dismisses it on outside click", () => {
    cy.mount(
      <div>
        <Toggletip>
          <ToggletipTrigger aria-label="Locked content help">
            <HelpCircleIcon aria-hidden />
          </ToggletipTrigger>
          <ToggletipPanel>Managed elsewhere</ToggletipPanel>
        </Toggletip>
        <button type="button">Outside</button>
      </div>,
    );

    cy.findByRole("button", { name: "Locked content help" }).realClick();

    cy.findByRole("dialog", { name: "Locked content help" })
      .should("be.visible")
      .should("contain.text", "Managed elsewhere")
      .should("have.focus");

    cy.findByRole("button", { name: "Outside" }).realClick();
    cy.findByRole("dialog").should("not.exist");
  });

  it("keeps long panel content reachable after the user opens the toggletip", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <LongContent />
      </div>,
    );

    cy.findByRole("button", { name: "Before" }).should("have.focus");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");

    cy.realPress("Enter");
    cy.findByRole("dialog")
      .should("be.visible")
      .should(
        "contain.text",
        "This example text is intended to demonstrate layout and formatting",
      );
  });

  it("renders through the configured floating component after the user opens the toggletip", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <Default />
      </CustomFloatingComponentProvider>,
    );

    cy.findByRole("button", { name: "Help info" }).realClick();
    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });
});
