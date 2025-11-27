import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import * as pillGroupStories from "@stories/pill/pill-group.stories";
import { composeStories } from "@storybook/react-vite";

const {
  Default,
  ControlledSelectableGroup,
  SelectableGroupWithDisabledPill,
  SelectableGroup,
  WithDisabledFormField,
  Disabled,
  DisabledSelectableGroup,
} = composeStories(pillGroupStories);

describe("GIVEN a PillGroup", () => {
  it("THEN should render pills as buttons by default", () => {
    cy.mount(<Default />);

    cy.findAllByRole("button").should("have.length", 3);
  });

  it("THEN should render pills as checkboxes when selectionVariant is multiple", () => {
    cy.mount(<SelectableGroup />);

    cy.findAllByRole("checkbox").should("have.length", 3);
  });

  it("SHOULD allow selection with a keyboard and fire onSelectionChange", () => {
    const selectionSpy = cy.stub().as("selectionSpy");
    cy.mount(<SelectableGroup onSelectionChange={selectionSpy} />);
    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 1" }).should("be.focused");
    cy.realPress("Space");
    cy.findByRole("checkbox", { name: "Pill 1" }).should(
      "have.attr",
      "aria-checked",
      "true",
    );
    cy.get("@selectionSpy").should(
      "have.been.calledWith",
      Cypress.sinon.match.any,
      ["one"],
    );

    // Enter should not trigger selection changes
    cy.realPress("Enter");
    cy.findByRole("checkbox", { name: "Pill 1" }).should(
      "have.attr",
      "aria-checked",
      "true",
    );
    cy.get("@selectionSpy").should("have.callCount", 1);
  });

  it("SHOULD render a disabled pill", () => {
    cy.mount(<SelectableGroupWithDisabledPill />);
    cy.findByRole("checkbox", { name: "Pill 1" })
      .should("be.disabled")
      .and("have.attr", "aria-checked", "false");
  });

  it("SHOULD render a disabled PillGroup", () => {
    cy.mount(<Disabled />);
    cy.findAllByRole("button").should("be.disabled");
  });

  it("SHOULD render a disabled selectable PillGroup", () => {
    cy.mount(<DisabledSelectableGroup />);
    cy.findAllByRole("checkbox").should("be.disabled");
  });

  describe("GIVEN a PillGroup with selectable pills", () => {
    it("THEN should allow selecting and deselecting Pills", () => {
      const selectionChangeSpy = cy.stub().as("selectionChangeSpy");
      cy.mount(<SelectableGroup onSelectionChange={selectionChangeSpy} />);

      cy.findByText("Pill 1").realClick();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["one"],
      );

      cy.findByText("Pill 2").realClick();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["one", "two"],
      );

      cy.findByText("Pill 1").realClick();
      cy.get("@selectionChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        ["two"],
      );
    });
  });

  it("SHOULD allow navigation with the Tab key", () => {
    cy.mount(<SelectableGroup />);

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 1" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 2" }).should("be.focused");
  });

  it("SHOULD allow navigation with the Tab key when selectionVariant is multiple", () => {
    cy.mount(<SelectableGroup />);

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 1" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 2" }).should("be.focused");
  });

  it("SHOULD focus the first pill when group receives focus when selectionVariant is multiple and multiple are checked", () => {
    cy.mount(<SelectableGroup selected={["two", "three"]} />);

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 1" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("checkbox", { name: "Pill 2" }).should("be.focused");
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultSelected", () => {
      cy.mount(<SelectableGroup defaultSelected={["one"]} />);
      cy.findByRole("checkbox", { name: "Pill 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("checkbox", { name: "Pill 2" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
      cy.findByRole("checkbox", { name: "Pill 3" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle pills", () => {
        cy.mount(<SelectableGroup />);

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("checkbox", { name: "Pill 1" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.findByRole("checkbox", { name: "Pill 1" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("checkbox", { name: "Pill 1" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 2" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 3" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("checkbox", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });

      it("SHOULD call onSelectionChange when clicking a pill", () => {
        const selectionSpy = cy.stub().as("selectionSpy");
        cy.mount(<SelectableGroup onSelectionChange={selectionSpy} />);
        cy.findByRole("checkbox", { name: "Pill 2" }).realClick();
        cy.get("@selectionSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["two"],
        );
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle pills when using the Space key", () => {
        cy.mount(<SelectableGroup />);

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.realPress("Space");
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });

      it("SHOULD call onSelectionChange when activating with keyboard", () => {
        const selectionSpy = cy.stub().as("selectionSpy");
        cy.mount(<SelectableGroup onSelectionChange={selectionSpy} />);
        cy.realPress("Tab");
        cy.realPress("Space");
        cy.get("@selectionSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["one"],
        );
      });

      it("should NOT toggle pills using the Enter key", () => {
        cy.mount(<SelectableGroup />);
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect selected", () => {
      cy.mount(<ControlledSelectableGroup />);
      cy.findByRole("checkbox", { name: "Pill 1" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
      cy.findByRole("checkbox", { name: "Pill 2" }).should(
        "have.attr",
        "aria-checked",
        "false",
      );
      cy.findByRole("checkbox", { name: "Pill 3" }).should(
        "have.attr",
        "aria-checked",
        "true",
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle pills", () => {
        cy.mount(<ControlledSelectableGroup />);

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("checkbox", { name: "Pill 1" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );

        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 2" }).realClick();
        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle pills when using the Space key", () => {
        cy.mount(<ControlledSelectableGroup />);

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.findByRole("checkbox", { name: "Pill 2" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.findByRole("checkbox", { name: "Pill 3" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
        cy.realPress("Space");

        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );

        cy.realPress("Space");
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "false",
        );
      });

      it("should NOT toggle pills using the Enter key", () => {
        cy.mount(<ControlledSelectableGroup />);
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.findByRole("checkbox", { name: "Pill 1" }).should(
          "have.attr",
          "aria-checked",
          "true",
        );
      });
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(<WithDisabledFormField selectionVariant="multiple" />);
      cy.findAllByRole("checkbox").should("be.disabled");
    });

    it("THEN should have the correct aria labelling", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <Default />
          <FormFieldHelperText>Description</FormFieldHelperText>
        </FormField>,
      );

      cy.findByRole("group").should("have.accessibleName", "Label");
      cy.findByRole("group").should(
        "have.accessibleDescription",
        "Description",
      );
    });
  });
});
