import { FormField, FormFieldLabel } from "@salt-ds/core";
import * as selectablePillStories from "@stories/pill/selectable-pill.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Default,
  ControlledGroup,
  WithDisabledPill,
  UncontrolledGroup,
  WithDisabledFormField,
} = composeStories(selectablePillStories);

describe("GIVEN a PillGroup", () => {
  it("THEN should render pills unchecked by default", () => {
    cy.mount(<Default />);

    cy.findByRole("listbox");
    cy.findAllByRole("option").should("have.length", 3);
    cy.findByRole("option", { name: "Pill 1" }).should(
      "have.attr",
      "aria-checked",
      "false",
    );
    cy.findByRole("option", { name: "Pill 2" }).should(
      "have.attr",
      "aria-checked",
      "false",
    );
    cy.findByRole("option", { name: "Pill 3" }).should(
      "have.attr",
      "aria-checked",
      "false",
    );
  });

  it("SHOULD allow selection with a keyboard and fire onSelectionChange", () => {
    const selectionSpy = cy.stub().as("selectionSpy");
    cy.mount(<Default onSelectionChange={selectionSpy} />);
    cy.realPress("Tab");
    cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
    cy.realPress("Space");
    cy.findByRole("option", { name: "Pill 1" }).should(
      "have.attr",
      "aria-checked",
      "true",
    );
    cy.get("@selectionSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["one"],
    );
  });

  it("SHOULD render a disabled pill", () => {
    cy.mount(<WithDisabledPill />);
    cy.findByRole("option", { name: "Pill 1" })
      .should("be.disabled")
      .and("have.attr", "aria-checked", "false");
  });

  describe("GIVEN a PillGroup with selectable Pills", () => {
    it("THEN should allow selecting and deselecting Pills", () => {
      const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
      cy.mount(<Default onSelectionChange={selectionChangeSpy} />);

      cy.findByText("Pill 1").click();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["one"],
      );

      cy.findByText("Pill 2").click();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["one", "two"],
      );

      cy.findByText("Pill 1").click();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["two"],
      );
    });
  });

  describe("WHEN using Tab and Arrow keys to navigate", () => {
    it("SHOULD focus the first pill when none are checked", () => {
      cy.mount(<Default />);

      cy.realPress("Tab");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
    });

    it("SHOULD focus the first selected pill when multiple are checked", () => {
      cy.mount(<Default selected={["two", "three"]} />);

      cy.realPress("Tab");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
    });

    it("SHOULD move focus forward when pressing ArrowRight and not wrap", () => {
      cy.mount(
        <>
          <Default />
          <button>end</button>
        </>,
      );

      cy.realPress("Tab");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      cy.realPress("ArrowRight");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
      cy.realPress("ArrowRight");
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      // Repeat to ensure no wrap at the end
      cy.realPress("ArrowRight");
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "end" }).should("be.focused");
    });

    it("SHOULD move focus forward when pressing ArrowDown and not wrap", () => {
      cy.mount(
        <>
          <Default />
          <button>end</button>
        </>,
      );

      cy.realPress("Tab");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      // Repeat to ensure no wrap at the end
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "end" }).should("be.focused");
    });

    it("SHOULD move focus backwards when pressing ArrowLeft and not wrap", () => {
      cy.mount(
        <>
          <button>start</button>
          <Default />
          <button>end</button>
        </>,
      );

      cy.findByRole("button", { name: "end" }).click();
      cy.findByRole("button", { name: "end" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      cy.realPress("ArrowLeft");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
      cy.realPress("ArrowLeft");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      // Repeat to ensure no wrap
      cy.realPress("ArrowLeft");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "start" }).should("be.focused");
    });

    it("SHOULD move focus backwards when pressing ArrowUp and not wrap", () => {
      cy.mount(
        <>
          <button>start</button>
          <Default />
          <button>end</button>
        </>,
      );

      cy.findByRole("button", { name: "end" }).click();
      cy.findByRole("button", { name: "end" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("option", { name: "Pill 3" }).should("be.focused");
      cy.realPress("ArrowUp");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
      cy.realPress("ArrowUp");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      // Repeat to ensure no wrap
      cy.realPress("ArrowUp");
      cy.findByRole("option", { name: "Pill 1" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "start" }).should("be.focused");
    });

    it("SHOULD skip disabled pills", () => {
      cy.mount(<WithDisabledPill />);

      cy.realPress("Tab");
      cy.findByRole("option", { name: "Pill 2" }).should("be.focused");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultSelected", () => {
      cy.mount(<UncontrolledGroup defaultSelected={["one"]} />);
      cy.findByRole("option", { name: "Pill 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("option", { name: "Pill 2" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
      cy.findByRole("option", { name: "Pill 3" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle pills", () => {
        cy.mount(<UncontrolledGroup />);

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("option", { name: "Pill 1" }).click();
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.findByRole("option", { name: "Pill 1" }).click();
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("option", { name: "Pill 1" }).click();
        cy.findByRole("option", { name: "Pill 2" }).click();
        cy.findByRole("option", { name: "Pill 3" }).click();
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });

      it("SHOULD call onSelectionChange when clicking a pill", () => {
        const selectionSpy = cy.stub().as("selectionSpy");
        cy.mount(<UncontrolledGroup onSelectionChange={selectionSpy} />);
        cy.findByRole("option", { name: "Pill 2" }).click();
        cy.get("@selectionSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["two"],
        );
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle pills when using the Space key", () => {
        cy.mount(<UncontrolledGroup />);

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.realPress("Space");
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.realPress("ArrowRight");
        cy.realPress("Space");

        cy.realPress("ArrowRight");
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });

      it("SHOULD call onSelectionChange when activating with keyboard", () => {
        const selectionSpy = cy.stub().as("selectionSpy");
        cy.mount(<UncontrolledGroup onSelectionChange={selectionSpy} />);
        cy.realPress("Tab");
        cy.realPress("ArrowRight");
        cy.realPress("Space");
        cy.get("@selectionSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["two"],
        );
      });

      it("SHOULD toggle pills using the Enter key", () => {
        cy.mount(<UncontrolledGroup />);
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect selected", () => {
      cy.mount(<ControlledGroup />);
      cy.findByRole("option", { name: "Pill 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("option", { name: "Pill 2" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
      cy.findByRole("option", { name: "Pill 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle pills", () => {
        cy.mount(<ControlledGroup />);

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 1" }).click();
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 2" }).click();
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle pills when using the Space key", () => {
        cy.mount(<ControlledGroup />);

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.realPress("Space");
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.realPress("ArrowRight");
        cy.realPress("Space");

        cy.realPress("ArrowRight");
        cy.realPress("Space");

        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("option", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("option", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
      });

      it("SHOULD toggle pills using the Enter key", () => {
        cy.mount(<ControlledGroup />);
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("option", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
      });
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(<WithDisabledFormField />);
      cy.findAllByRole("option").each((pill) => {
        cy.wrap(pill).should("be.disabled");
      });
    });

    it("THEN should have the correct aria labelling", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Default selected={["one"]} />
        </FormField>,
      );

      cy.findAllByRole("option").eq(0).should("have.accessibleName", "Pill 1");
    });
  });
});
