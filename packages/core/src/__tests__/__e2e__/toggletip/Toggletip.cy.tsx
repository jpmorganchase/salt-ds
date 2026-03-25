import { Toggletip, ToggletipPanel, ToggletipTrigger } from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import * as toggletipStories from "@stories/toggletip/toggletip.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const composedStories = composeStories(toggletipStories);

const { Default, InteractiveContent } = composedStories;

describe("GIVEN a Toggletip", () => {
  checkAccessibility(composedStories);

  it("lets a keyboard user tab from the previous control into a text-only toggletip and back out to the next control", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );

    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.focus",
    );

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

    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.focus",
    );

    cy.realPress("Space");
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress("Escape");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.focus",
    );
  });

  it("keeps keyboard focus flowing through interactive panel content and then back into page order", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <InteractiveContent />
        <button type="button">After</button>
      </div>,
    );

    cy.realPress("Tab");
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

    cy.realPress("Tab");
    cy.findByRole("dialog").should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Link" }).should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "After" }).should("have.focus");
  });

  it("lets a pointer user open the toggletip, exposes dialog semantics, and dismisses it on outside click", () => {
    const onOpenChangeSpy = cy.stub().as("onOpenChangeSpy");
    cy.mount(
      <div>
        <Toggletip onOpenChange={onOpenChangeSpy}>
          <ToggletipTrigger aria-label="Locked content help">
            <HelpCircleIcon aria-hidden />
          </ToggletipTrigger>
          <ToggletipPanel>Managed elsewhere</ToggletipPanel>
        </Toggletip>
        <button type="button">Outside</button>
      </div>,
    );

    cy.findByRole("button", { name: "Locked content help" }).realClick();
    cy.get("@onOpenChangeSpy").should("have.been.calledWith", true);

    cy.findByRole("dialog", { name: "Locked content help" })
      .should("be.visible")
      .should("contain.text", "Managed elsewhere")
      .should("have.focus");

    cy.findByRole("button", { name: "Outside" }).realClick();
    cy.findByRole("dialog").should("not.exist");
    cy.get("@onOpenChangeSpy").should("have.been.calledWith", false);
  });

  it("renders through the configured floating component after the user opens the toggletip", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <Default />
      </CustomFloatingComponentProvider>,
    );

    cy.findByRole("button", {
      name: "More info about locked content",
    }).realClick();
    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });

  it("sets aria-haspopup, aria-expanded, and aria-controls on the trigger", () => {
    cy.mount(<Default />);

    cy.findByRole("button", { name: "More info about locked content" })
      .should("have.attr", "aria-haspopup", "dialog")
      .and("have.attr", "aria-expanded", "false");

    cy.findByRole("button", {
      name: "More info about locked content",
    }).realClick();

    cy.findByRole("button", { name: "More info about locked content" })
      .should("have.attr", "aria-expanded", "true")
      .then(($trigger) => {
        const controlsId = $trigger.attr("aria-controls");
        expect(controlsId).to.be.a("string").and.not.be.empty;
        cy.findByRole("dialog").should("have.attr", "id", controlsId);
      });

    cy.realPress("Escape");
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.attr",
      "aria-expanded",
      "false",
    );
  });

  it("closes the toggletip when the trigger is clicked a second time", () => {
    const onOpenChangeSpy = cy.stub().as("onOpenChangeSpy");
    cy.mount(
      <Toggletip onOpenChange={onOpenChangeSpy}>
        <ToggletipTrigger aria-label="Toggle info">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>Some content</ToggletipPanel>
      </Toggletip>,
    );

    cy.findByRole("button", { name: "Toggle info" }).realClick();
    cy.findByRole("dialog").should("be.visible");
    cy.get("@onOpenChangeSpy").should("have.been.calledOnceWith", true);

    cy.findByRole("button", { name: "Toggle info" }).realClick();
    cy.findByRole("dialog").should("not.exist");
    cy.get("@onOpenChangeSpy").should("have.been.calledWith", false);
  });

  it("does not dismiss when clicking inside the container", () => {
    cy.mount(
      <div>
        <InteractiveContent />
        <button type="button">Outside</button>
      </div>,
    );

    cy.findByRole("button", { name: "Help info" }).realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("dialog").realClick();
    cy.findByRole("dialog").should("be.visible");

    cy.findByRole("link", { name: "Link" }).realClick();
    cy.findByRole("dialog").should("be.visible");
  });

  it("closes the toggletip when Shift+Tab moves focus before the trigger", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <Default />
        <button type="button">After</button>
      </div>,
    );

    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.focus",
    );

    cy.realPress("Enter");
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "More info about locked content" }).should(
      "have.focus",
    );
    cy.findByRole("dialog").should("be.visible");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Before" }).should("have.focus");
    cy.findByRole("dialog").should("not.exist");
  });

  it("closes the toggletip and returns focus to the trigger when Escape is pressed from an interactive element inside", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <InteractiveContent />
        <button type="button">After</button>
      </div>,
    );

    cy.findByRole("button", { name: "Help info" }).realClick();
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress("Tab");
    cy.findByRole("link", { name: "Link" }).should("have.focus");

    cy.realPress("Escape");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");
  });

  it("closes the toggletip when Escape is pressed while the trigger has focus and the container is open", () => {
    cy.mount(
      <div>
        <button type="button">Before</button>
        <InteractiveContent />
        <button type="button">After</button>
      </div>,
    );

    cy.findByRole("button", { name: "Help info" }).realClick();
    cy.findByRole("dialog").should("be.visible").should("have.focus");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Help info" }).should("have.focus");
    cy.findByRole("dialog").should("be.visible");

    cy.realPress("Escape");
    cy.findByRole("dialog").should("not.exist");
    cy.findByRole("button", { name: "Help info" }).should("have.focus");
  });

  it("respects a controlled open prop", () => {
    cy.mount(
      <Toggletip open>
        <ToggletipTrigger aria-label="Controlled test">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>Controlled content</ToggletipPanel>
      </Toggletip>,
    );

    cy.findByRole("dialog")
      .should("be.visible")
      .should("contain.text", "Controlled content");
    cy.findByRole("button", { name: "Controlled test" }).should(
      "have.attr",
      "aria-expanded",
      "true",
    );
  });

  it("renders through the configured floating component after the user opens the toggletip", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <Default />
      </CustomFloatingComponentProvider>,
    );

    cy.findByRole("button", {
      name: "More info about locked content",
    }).realClick();
    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });
});
