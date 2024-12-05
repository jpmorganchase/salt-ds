import { Step, SteppedTracker } from "@salt-ds/lab";
import { composeStories } from "@storybook/react";

import * as steppedTrackerStories from "@stories/stepped-tracker/stepped-tracker.stories";

const { VerticalDepth1, VerticalDepth2 } = composeStories(
  steppedTrackerStories,
);

describe("<SteppedTracker />", () => {
  it("should expand/collapse when trigger is clicked (depth 1)", () => {
    cy.mount(<VerticalDepth1 />);

    cy.get("#step-1").should("be.visible");
    cy.get("#step-1-1").should("not.be.visible");

    cy.get("#step-1-expand-trigger").should(
      "have.attr",
      "aria-expanded",
      "false",
    );

    cy.get("#step-1-expand-trigger").click();

    cy.get("#step-1-expand-trigger").should(
      "have.attr",
      "aria-expanded",
      "true",
    );

    cy.get("#step-1-1").should("be.visible");

    cy.get("#step-1-expand-trigger").click();

    cy.get("#step-1-expand-trigger").should(
      "have.attr",
      "aria-expanded",
      "false",
    );

    cy.get("#step-1-1").should("not.be.visible");
  });

  it("should expand/collapse when trigger is clicked (depth 2)", () => {
    cy.mount(<VerticalDepth2 />);

    cy.get("#step-2").should("be.visible");
    cy.get("#step-2-1").should("not.be.visible");
    cy.get("#step-2-2").should("not.be.visible");
    cy.get("#step-2-2-1").should("not.be.visible");
    cy.get("#step-2-2-2").should("not.be.visible");
    cy.get("#step-2-2-3").should("not.be.visible");

    cy.get("#step-2-expand-trigger").click();

    cy.get("#step-2-1").should("be.visible");
    cy.get("#step-2-2").should("be.visible");

    cy.get("#step-2-2-expand-trigger").click();

    cy.get("#step-2-2-1").should("be.visible");
    cy.get("#step-2-2-2").should("be.visible");
    cy.get("#step-2-2-3").should("be.visible");

    cy.get("#step-2-expand-trigger").click();

    cy.get("#step-2").should("be.visible");
    cy.get("#step-2-1").should("not.be.visible");
    cy.get("#step-2-2").should("not.be.visible");
    cy.get("#step-2-2-1").should("not.be.visible");
    cy.get("#step-2-2-2").should("not.be.visible");
    cy.get("#step-2-2-3").should("not.be.visible");
  });

  it("a11y/aria properties (depth 0)", () => {
    cy.mount(
      <SteppedTracker id="stepped-tracker-1" orientation="vertical">
        <Step
          id="step-1"
          label="Step 1"
          description="Description Text 1"
          stage="completed"
        />
        <Step
          id="step-2"
          label="Step 2"
          description="Description Text 2"
          stage="active"
        />
        <Step id="step-3" label="Step 3" stage="pending" />
      </SteppedTracker>,
    );

    cy.findAllByRole("list").should("have.length", 1);
    cy.findAllByRole("listitem").should("have.length", 3);

    cy.get("#stepped-tracker-1").should("exist");

    cy.get("#step-1").should("not.have.attr", "aria-current");
    cy.get("#step-2").should("have.attr", "aria-current", "step");
    cy.get("#step-3").should("not.have.attr", "aria-current");

    cy.get("#step-1-label")
      .should("contain.text", "Step 1")
      .should("contain.text", "completed");
    cy.get("#step-2-label").should("have.text", "Step 2");
    cy.get("#step-3-label")
      .should("contain.text", "Step 3")
      .should("contain.text", "pending");

    cy.get("#step-1-label-elucidation").should("have.text", "completed");
    cy.get("#step-2-label-elucidation").should("not.exist");
    cy.get("#step-3-label-elucidation").should("have.text", "pending");

    cy.get("#step-1-description").should("exist");
    cy.get("#step-2-description").should("exist");
    cy.get("#step-3-description").should("not.exist");

    cy.get("#step-1-expand-trigger").should("not.exist");
    cy.get("#step-2-expand-trigger").should("not.exist");
    cy.get("#step-3-expand-trigger").should("not.exist");

    cy.get("#step-1-nested-stepped-tracker").should("not.exist");
    cy.get("#step-2-nested-stepped-tracker").should("not.exist");
    cy.get("#step-3-nested-stepped-tracker").should("not.exist");
  });

  it("a11y/aria properties (depth 1)", () => {
    cy.mount(
      <SteppedTracker id="stepped-tracker-1" orientation="vertical">
        <Step
          id="step-1"
          label="Step 1"
          description="Description Text 1"
          stage="completed"
        />
        <Step
          id="step-2"
          label="Step 2"
          description="Description Text 2"
          stage="inprogress"
          expanded
        >
          <Step id="step-2-1" label="Step 2.1" stage="completed" />
          <Step id="step-2-2" label="Step 2.2" stage="active" />
          <Step id="step-2-3" label="Step 2.3" stage="pending" />
        </Step>
        <Step id="step-3" label="Step 3" stage="pending" />
      </SteppedTracker>,
    );

    cy.findAllByRole("list").should("have.length", 2);
    cy.findAllByRole("listitem").should("have.length", 6);

    cy.get("#stepped-tracker-1").should("exist");

    cy.get("#step-1").should("not.have.attr", "aria-current");
    cy.get("#step-2").should("not.have.attr", "aria-current");
    cy.get("#step-3").should("not.have.attr", "aria-current");
    cy.get("#step-2-1").should("not.have.attr", "aria-current");
    cy.get("#step-2-2").should("have.attr", "aria-current", "step");
    cy.get("#step-2-3").should("not.have.attr", "aria-current");

    cy.get("#step-1-label")
      .should("contain.text", "Step 1")
      .should("contain.text", "completed");
    cy.get("#step-2-label")
      .should("contain.text", "Step 2")
      .should("contain.text", "inprogress");
    cy.get("#step-2-1-label")
      .should("contain.text", "Step 2.1")
      .should("contain.text", "completed");
    cy.get("#step-2-2-label").should("have.text", "Step 2.2");
    cy.get("#step-2-3-label")
      .should("contain.text", "Step 2.3")
      .should("contain.text", "pending");
    cy.get("#step-3-label")
      .should("contain.text", "Step 3")
      .should("contain.text", "pending");

    cy.get("#step-1-label-elucidation").should("have.text", "completed");
    cy.get("#step-2-label-elucidation").should("have.text", "inprogress");
    cy.get("#step-2-1-label-elucidation").should("have.text", "completed");
    cy.get("#step-2-2-label-elucidation").should("not.exist");
    cy.get("#step-2-3-label-elucidation").should("have.text", "pending");
    cy.get("#step-3-label-elucidation").should("have.text", "pending");

    cy.get("#step-1-description").should("exist");
    cy.get("#step-2-description").should("exist");
    cy.get("#step-2-1-description").should("not.exist");
    cy.get("#step-2-2-description").should("not.exist");
    cy.get("#step-2-3-description").should("not.exist");
    cy.get("#step-3-description").should("not.exist");

    cy.get("#step-1-expand-trigger").should("not.exist");
    cy.get("#step-2-expand-trigger")
      .should("have.attr", "aria-expanded", "true")
      .should("have.attr", "aria-labelledby", "step-2-label")
      .should("have.attr", "aria-controls", "step-2-nested-stepped-tracker");
    cy.get("#step-3-expand-trigger").should("not.exist");

    cy.get("#step-1-nested-stepped-tracker").should("not.exist");
    cy.get("#step-2-nested-stepped-tracker")
      .should("have.attr", "aria-hidden", "false")
      .should("have.attr", "aria-label", "Step 2 substeps");
    cy.get("#step-3-nested-stepped-tracker").should("not.exist");
  });
});
