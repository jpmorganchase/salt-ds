import { composeStories } from "@storybook/react";
import * as interactableCardStories from "@stories/interactable-card/interactable-card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import {
  InteractableCardGroup,
  InteractableCard,
  InteractableCardValue,
} from "@salt-ds/lab";
import { ChangeEvent, SyntheticEvent } from "react";

const composedStories = composeStories(interactableCardStories);
const { Default } = composedStories;

describe("Given an Interactable Card", () => {
  // checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Sustainable investing products").should("be.visible");
    cy.findByText(
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values."
    ).should("be.visible");
  });
});

describe("GIVEN a multiselect InteractableCardGroup", () => {
  it("THEN should render InteractableCards", () => {
    cy.mount(
      <InteractableCardGroup selectionVariant="multiselect">
        <InteractableCard value="one">One</InteractableCard>
        <InteractableCard value="two">Two</InteractableCard>
        <InteractableCard value="three">Three</InteractableCard>
      </InteractableCardGroup>
    );

    cy.findAllByRole("checkbox").should("have.length", 3);
    cy.get('[role="checkbox"][data-value="one"]').should("exist");
    cy.get('[role="checkbox"][data-value="two"]').should("exist");
    cy.get('[role="checkbox"][data-value="three"]').should("exist");
  });

  describe("WHEN using Tab to navigate", () => {
    it("SHOULD focus the first InteractableCard when none are checked", () => {
      cy.mount(
        <InteractableCardGroup selectionVariant="multiselect">
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="one"]').should("be.focused");
    });

    it("SHOULD focus the next InteractableCard when one is checked", () => {
      cy.mount(
        <InteractableCardGroup
          selectionVariant="multiselect"
          defaultValue={["one"]}
        >
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="two"]').should("be.focused");
    });

    it("SHOULD move focus when pressing Tab and not wrap", () => {
      cy.mount(
        <>
          <InteractableCardGroup selectionVariant="multiselect">
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
          <button>end</button>
        </>
      );

      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="one"]').should("be.focused");
      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="two"]').should("be.focused");
      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="three"]').should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "end" }).should("be.focused");
    });

    it("SHOULD move focus backwards when pressing Shift+Tab and not wrap", () => {
      cy.mount(
        <>
          <button>start</button>
          <InteractableCardGroup selectionVariant="multiselect">
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
          <button>end</button>
        </>
      );

      cy.findByRole("button", { name: "end" }).realClick();
      cy.findByRole("button", { name: "end" }).should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.get('[role="checkbox"][data-value="three"]').should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.get('[role="checkbox"][data-value="two"]').should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.get('[role="checkbox"][data-value="one"]').should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "start" }).should("be.focused");
    });

    it("SHOULD skip disabled InteractableCards", () => {
      cy.mount(
        <InteractableCardGroup selectionVariant="multiselect">
          <InteractableCard value="one" disabled />
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.get('[role="checkbox"][data-value="two"]').should("be.focused");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultValue", () => {
      cy.mount(
        <InteractableCardGroup
          selectionVariant="multiselect"
          defaultValue={["one"]}
        >
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );
      cy.get('[role="checkbox"][data-value="one"]').should(
        "have.attr",
        "aria-checked",
        "true"
      );
      cy.get('[role="checkbox"][data-value="two"]').should(
        "have.attr",
        "aria-checked",
        "false"
      );
      cy.get('[role="checkbox"][data-value="three"]').should(
        "have.attr",
        "aria-checked",
        "false"
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle InteractableCards", () => {
        cy.mount(
          <InteractableCardGroup selectionVariant="multiselect">
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        );

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
        cy.get('[role="checkbox"][data-value="two"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
        cy.get('[role="checkbox"][data-value="three"]').should(
          "not.be.checked"
        );

        cy.get('[role="checkbox"][data-value="one"]').realClick();
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );

        cy.get('[role="checkbox"][data-value="one"]').realClick();
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );

        cy.get('[role="checkbox"][data-value="one"]').realClick();
        cy.get('[role="checkbox"][data-value="two"]').realClick();
        cy.get('[role="checkbox"][data-value="three"]').realClick();
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
        cy.get('[role="checkbox"][data-value="two"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
        cy.get('[role="checkbox"][data-value="three"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
      });

      it("SHOULD call onChange", () => {
        const changeSpy = cy.stub().as("changeSpy");

        const handleChange = (
          event: SyntheticEvent<HTMLDivElement>,
          value: InteractableCardValue
        ) => {
          event.persist();
          changeSpy(value);
        };

        cy.mount(
          <InteractableCardGroup
            selectionVariant="multiselect"
            onChange={handleChange}
          >
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        );

        cy.get('[role="checkbox"][data-value="two"]').realClick();

        cy.get("@changeSpy").should("have.been.calledWith", ["two"]);
      });

      describe("AND an InteractableCard is disabled", () => {
        it("SHOULD not toggle the InteractableCard", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(
            <InteractableCardGroup
              selectionVariant="multiselect"
              onChange={changeSpy}
            >
              <InteractableCard value="one" disabled />
              <InteractableCard value="two">Two</InteractableCard>
              <InteractableCard value="three">Three</InteractableCard>
            </InteractableCardGroup>
          );

          cy.get('[role="checkbox"][data-value="one"]')
            .should("have.attr", "aria-disabled", "true")
            .and("not.be.checked");
          cy.get('[role="checkbox"][data-value="one"]').realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    //   describe("AND using a keyboard", () => {
    //     it("SHOULD toggle InteractableCards when using the Space key", () => {
    //       cy.mount(
    //     <InteractableCardGroup selectionVariant="multiselect">
    //           <InteractableCard value="one">One</InteractableCard>
    //           <InteractableCard value="two">Two</InteractableCard>
    //           <InteractableCard value="three">Three</InteractableCard>
    //         </InteractableCardGroup>
    //       );

    //      cy.get('[role="checkbox"][data-value="one"]').should(
    //         "not.be.checked"
    //       );
    //      cy.get('[role="checkbox"][data-value="two"]').should(
    //         "not.be.checked"
    //       );
    //      cy.get('[role="checkbox"][data-value="three"]').should(
    //         "not.be.checked"
    //       );

    //       cy.realPress("Tab");
    //       cy.realPress("Space");

    //      cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
    //       cy.realPress("Space");

    //      cy.get('[role="checkbox"][data-value="one"]').should(
    //         "not.be.checked"
    //       );

    //       cy.realPress("Space");
    //      cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');

    //       cy.realPress("Tab");
    //       cy.realPress("Space");

    //       cy.realPress("Tab");
    //       cy.realPress("Space");

    //      cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
    //      cy.get('[role="checkbox"][data-value="two"]').should('have.attr', 'aria-checked', 'true');
    //      cy.get('[role="checkbox"][data-value="three"]').should(
    //         "be.checked"
    //       );
    //     });

    //     it("SHOULD call onChange", () => {
    //       const changeSpy = cy.stub().as("changeSpy");

    //       const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    //         // React 16 backwards compatibility
    //         event.persist();
    //         changeSpy(event);
    //       };

    //       cy.mount(
    //         <InteractableCardGroup selectionVariant="multiselect" onChange={handleChange}>
    //           <InteractableCard value="one">One</InteractableCard>
    //           <InteractableCard value="two">Two</InteractableCard>
    //           <InteractableCard value="three">Three</InteractableCard>
    //         </InteractableCardGroup>
    //       );

    //       cy.realPress("Tab");
    //       cy.realPress("Tab");

    //       cy.realPress("Space");
    //       cy.get("@changeSpy").should("be.calledWithMatch", {
    //         target: { value: "two" },
    //       });
    //     });

    //     it("SHOULD not toggle InteractableCards using the Enter key", () => {
    //       cy.mount(
    //     <InteractableCardGroup selectionVariant="multiselect">
    //           <InteractableCard value="one">One</InteractableCard>
    //           <InteractableCard value="two">Two</InteractableCard>
    //           <InteractableCard value="three">Three</InteractableCard>
    //         </InteractableCardGroup>
    //       );

    //      cy.get('[role="checkbox"][data-value="one"]').should(
    //         "not.be.checked"
    //       );
    //       cy.realPress("Tab");
    //       cy.realPress("Enter");
    //      cy.get('[role="checkbox"][data-value="one"]').should(
    //         "not.be.checked"
    //       );
    //     });
    //   });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should respect defaultValue", () => {
      cy.mount(
        <InteractableCardGroup  selectionVariant="multiselect" defaultValue={["one"]}>
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );
     cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
     cy.get('[role="checkbox"][data-value="two"]').should(
        "not.be.checked"
      );
     cy.get('[role="checkbox"][data-value="three"]').should(
        "not.be.checked"
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD toggle InteractableCards", () => {
        cy.mount(<ControlledGroup />);

       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );
       cy.get('[role="checkbox"][data-value="two"]').should(
          "not.be.checked"
        );
       cy.get('[role="checkbox"][data-value="three"]').should(
          "not.be.checked"
        );

       cy.get('[role="checkbox"][data-value="one"]').realClick();
       cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');

       cy.get('[role="checkbox"][data-value="one"]').realClick();
       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );

       cy.get('[role="checkbox"][data-value="one"]').realClick();
       cy.get('[role="checkbox"][data-value="two"]').realClick();
       cy.get('[role="checkbox"][data-value="three"]').realClick();
       cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
       cy.get('[role="checkbox"][data-value="two"]').should('have.attr', 'aria-checked', 'true');
       cy.get('[role="checkbox"][data-value="three"]').should(
          "be.checked"
        );
      });

      describe("AND an InteractableCard is disabled", () => {
        it("SHOULD not toggle the InteractableCard", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(<ControlledGroup onChange={changeSpy} disabled />);

         cy.get('[role="checkbox"][data-value="one"]')
            .should('have.attr', 'aria-disabled', 'true')
            .and("not.be.checked");
         cy.get('[role="checkbox"][data-value="one"]').realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle InteractableCards when using the Space key", () => {
        cy.mount(<ControlledGroup />);

       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );
       cy.get('[role="checkbox"][data-value="two"]').should(
          "not.be.checked"
        );
       cy.get('[role="checkbox"][data-value="three"]').should(
          "not.be.checked"
        );

        cy.realPress("Tab");
        cy.realPress("Space");

       cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
        cy.realPress("Space");

       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );

        cy.realPress("Space");
       cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.realPress("Tab");
        cy.realPress("Space");

       cy.get('[role="checkbox"][data-value="one"]').should('have.attr', 'aria-checked', 'true');
       cy.get('[role="checkbox"][data-value="two"]').should('have.attr', 'aria-checked', 'true');
       cy.get('[role="checkbox"][data-value="three"]').should(
          "be.checked"
        );
      });

      it("SHOULD not toggle InteractableCards using the Enter key", () => {
        cy.mount(<ControlledGroup />);

       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
       cy.get('[role="checkbox"][data-value="one"]').should(
          "not.be.checked"
        );
      });
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <InteractableCardGroup  selectionVariant="multiselect" defaultValue={["one"]}>
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two" disabled />
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        </FormField>
      );

      cy.findAllByRole("checkbox").should("have.attr", "disabled");
    });

    it("THEN should respect the context when read-only", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <InteractableCardGroup  selectionVariant="multiselect" defaultValue={["one"]}>
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two" readOnly />
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        </FormField>
      );

      cy.findAllByRole("checkbox").should("have.attr", "readonly");
    });

    it("THEN should have the correct aria labelling", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Label</FormFieldLabel>
          <InteractableCardGroup  selectionVariant="multiselect" defaultValue={["one"]}>
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two" readOnly />
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        </FormField>
      );

      cy.findAllByRole("InteractableCard")
        .eq(0)
        .should("have.accessibleName", "one");
    });
  });
});
