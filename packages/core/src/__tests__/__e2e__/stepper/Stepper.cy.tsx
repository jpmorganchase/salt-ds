import { Stepper, Step } from "@salt-ds/lab";

describe("<Stepper />", () => {
  it("shows NO expand buttons when NO nested steps present", () => {
    cy.mount(
      <Stepper orientation="vertical">
        <Step label="Step 1" />
        <Step label="Step 2" />
      </Stepper>,
    );

    cy.findAllByRole("button").should("have.length", 0);
  });

  it("allows focus only on top level expand buttons", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Stepper orientation="vertical">
          <Step label="Step 1">
            <Step label="Step 1.1">
              <Step label="Step 1.1.1" />
              <Step label="Step 1.1.2" />
            </Step>
          </Step>
        </Stepper>
        <button>end</button>
      </div>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("have.focus");
    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("have.focus");
  });

  it("allows focus top level and expanded expand buttons ", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Stepper orientation="vertical">
          <Step label="Step 1">
            <Step label="Step 1.1">
              <Step label="Step 1.1.1" />
              <Step label="Step 1.1.2" />
            </Step>
          </Step>
        </Stepper>
        <button>end</button>
      </div>,
    );

    cy.findByRole("button", { expanded: false }).realClick();
    cy.findByRole("button", { name: "start" }).focus();
    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("have.focus");
  });

  it("allows for custom ids on stepper and step", () => {
    cy.mount(
      <Stepper id="stepper-1" orientation="vertical">
        <Step id="step-1" label="Step 1" expanded>
          <Step id="step-1-1" label="Step 1.1" expanded>
            <Step id="step-1-1-1" label="Step 1.1.1" />
            <Step id="step-1-1-2" label="Step 1.1.2" />
          </Step>
        </Step>
      </Stepper>,
    );

    cy.findAllByRole("list").should("have.length", 3);
    cy.findAllByRole("listitem").should("have.length", 4);
  });

  it("has accessible aria attributes", () => {
    cy.mount(
      <Stepper id="stepper-1" orientation="vertical">
        <Step id="step-1" label="Step 1" stage="completed" />
        <Step id="step-2" label="Step 2" stage="active" />
      </Stepper>,
    );

    cy.get("#step-2").should("have.attr", "aria-current", "step");
  });
});
