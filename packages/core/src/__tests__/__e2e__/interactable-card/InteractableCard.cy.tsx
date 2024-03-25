import { composeStories } from "@storybook/react";
import * as cardStories from "@stories/interactable-card/interactable-card.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import {
  InteractableCardGroupProps,
  InteractableCardValue,
  InteractableCardGroup,
  InteractableCard,
} from "@salt-ds/core";
import { useState, SyntheticEvent } from "react";

const composedStories = composeStories(cardStories);
const { Default, AccentVariations } = composedStories;

const ControlledGroup = ({
  onChange,
  disabled,
  multiSelect,
}: InteractableCardGroupProps) => {
  const [controlledValues, setControlledValues] =
    useState<InteractableCardValue>();

  const handleChange = (
    event: SyntheticEvent<HTMLDivElement>,
    value: InteractableCardValue
  ) => {
    setControlledValues(value);
    onChange?.(event, value);
  };
  return (
    <InteractableCardGroup
      disabled={disabled}
      value={controlledValues}
      defaultChecked
      onChange={handleChange}
      multiSelect={multiSelect}
    >
      <InteractableCard value="one">One</InteractableCard>
      <InteractableCard value="two">Two</InteractableCard>
      <InteractableCard value="three">Three</InteractableCard>
    </InteractableCardGroup>
  );
};

describe("Given an Interactable Card", () => {
  checkAccessibility(composedStories);

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
      <InteractableCardGroup multiSelect>
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
        <InteractableCardGroup multiSelect>
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
          multiSelect
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
          <InteractableCardGroup multiSelect>
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
          <InteractableCardGroup multiSelect>
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
        <InteractableCardGroup multiSelect>
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
          multiSelect
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
          <InteractableCardGroup multiSelect>
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
            multiSelect
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
              multiSelect
              onChange={changeSpy}
            >
              <InteractableCard value="one" disabled />
              <InteractableCard value="two">Two</InteractableCard>
              <InteractableCard value="three">Three</InteractableCard>
            </InteractableCardGroup>
          );

          cy.get('[role="checkbox"][data-value="one"]')
            .should("have.attr", "aria-disabled", "true")
            .and("have.attr", "aria-checked", "false");
          cy.get('[role="checkbox"][data-value="one"]').realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle InteractableCards when using the Space key", () => {
        cy.mount(
          <InteractableCardGroup multiSelect>
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

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
        cy.realPress("Space");

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );

        cy.realPress("Space");
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.realPress("Tab");
        cy.realPress("Space");

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
            multiSelect
            onChange={handleChange}
          >
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        );

        cy.realPress("Tab");
        cy.realPress("Tab");

        cy.realPress("Space");
        cy.get("@changeSpy").should("have.been.calledWith", ["two"]);
      });

      it("SHOULD not toggle InteractableCards using the Enter key", () => {
        cy.mount(
          <InteractableCardGroup multiSelect>
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
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    describe("THEN using a mouse", () => {
      it("SHOULD toggle InteractableCards", () => {
        cy.mount(<ControlledGroup multiSelect />);

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
          "have.attr",
          "aria-checked",
          "false"
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

      describe("AND an InteractableCardGroup is disabled", () => {
        it("SHOULD not toggle the InteractableCard", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(
            <ControlledGroup
              onChange={changeSpy}
              disabled
              multiSelect
            />
          );

          cy.get('[role="checkbox"][data-value="one"]')
            .should("have.attr", "aria-disabled", "true")
            .and("have.attr", "aria-checked", "false");
          cy.get('[role="checkbox"][data-value="one"]').realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD toggle InteractableCards when using the Space key", () => {
        cy.mount(<ControlledGroup multiSelect />);

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

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
        cy.realPress("Space");

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );

        cy.realPress("Space");
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );

        cy.realPress("Tab");
        cy.realPress("Space");

        cy.realPress("Tab");
        cy.realPress("Space");

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

      it("SHOULD not toggle InteractableCards using the Enter key", () => {
        cy.mount(<ControlledGroup multiSelect />);

        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
        cy.realPress("Tab");
        cy.realPress("Enter");
        cy.get('[role="checkbox"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
      });
    });
  });
});

describe("GIVEN a single selection InteractableCardGroup", () => {
  it("THEN should render InteractableCards", () => {
    cy.mount(
      <InteractableCardGroup >
        <InteractableCard value="one">One</InteractableCard>
        <InteractableCard value="two">Two</InteractableCard>
        <InteractableCard value="three">Three</InteractableCard>
      </InteractableCardGroup>
    );

    cy.findAllByRole("radio").should("have.length", 3);
    cy.get('[role="radio"][data-value="one"]').should("exist");
    cy.get('[role="radio"][data-value="two"]').should("exist");
    cy.get('[role="radio"][data-value="three"]').should("exist");
  });

  describe("WHEN using Tab to navigate", () => {
    it("SHOULD focus the first InteractableCard when none are checked", () => {
      cy.mount(
        <InteractableCardGroup >
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.get('[role="radio"][data-value="one"]').should("be.focused");
    });

    it("SHOULD move focus out of group when pressing Tab", () => {
      cy.mount(
        <>
          <InteractableCardGroup >
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
          <button>end</button>
        </>
      );

      cy.realPress("Tab");
      cy.get('[role="radio"][data-value="one"]').should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("button", { name: "end" }).should("be.focused");
    });

    it("SHOULD move focus backwards out of group when pressing Shift+Tab", () => {
      cy.mount(
        <>
          <button>start</button>
          <InteractableCardGroup >
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
      cy.get('[role="radio"][data-value="one"]').should("be.focused");
      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "start" }).should("be.focused");
    });

    it("SHOULD skip disabled InteractableCards", () => {
      cy.mount(
        <InteractableCardGroup >
          <InteractableCard value="one" disabled />
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.get('[role="radio"][data-value="two"]').should("be.focused");
    });
  });

  describe("WHEN using arrow keys to navigate", () => {
    it("SHOULD focus and select the next or previous InteractableCard with arrow keys", () => {
      cy.mount(
        <InteractableCardGroup >
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.realPress("ArrowDown");
      cy.get('[role="radio"][data-value="two"]')
        .should("be.focused")
        .and("have.attr", "aria-checked", "true");

      cy.realPress("ArrowUp");
      cy.get('[role="radio"][data-value="one"]')
        .should("be.focused")
        .and("have.attr", "aria-checked", "true");

      cy.realPress("ArrowRight");
      cy.get('[role="radio"][data-value="two"]')
        .should("be.focused")
        .and("have.attr", "aria-checked", "true");

      cy.realPress("ArrowLeft");
      cy.get('[role="radio"][data-value="one"]')
        .should("be.focused")
        .and("have.attr", "aria-checked", "true");
    });

    it("SHOULD select an InteractableCard on Space when none is selected initially", () => {
      cy.mount(
        <InteractableCardGroup >
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );

      cy.realPress("Tab");
      cy.realPress("Space");
      cy.get('[role="radio"][data-value="one"]')
        .should("be.focused")
        .and("have.attr", "aria-checked", "true");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should respect defaultValue", () => {
      cy.mount(
        <InteractableCardGroup defaultValue={"one"}>
          <InteractableCard value="one">One</InteractableCard>
          <InteractableCard value="two">Two</InteractableCard>
          <InteractableCard value="three">Three</InteractableCard>
        </InteractableCardGroup>
      );
      cy.get('[role="radio"][data-value="one"]').should(
        "have.attr",
        "aria-checked",
        "true"
      );
      cy.get('[role="radio"][data-value="two"]').should(
        "have.attr",
        "aria-checked",
        "false"
      );
      cy.get('[role="radio"][data-value="three"]').should(
        "have.attr",
        "aria-checked",
        "false"
      );
    });

    describe("AND using a mouse", () => {
      it("SHOULD select InteractableCards and unselect the others", () => {
        cy.mount(
          <InteractableCardGroup >
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        );

        cy.get('[role="radio"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
        cy.get('[role="radio"][data-value="two"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );
        cy.get('[role="radio"][data-value="three"]').should(
          "have.attr",
          "aria-checked",
          "false"
        );

        cy.get('[role="radio"][data-value="one"]').realClick();
        cy.get('[role="radio"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );

        cy.get('[role="radio"][data-value="two"]').realClick();
        cy.get('[role="radio"][data-value="two"]').should(
          "have.attr",
          "aria-checked",
          "true"
        );
        cy.get('[role="radio"][data-value="one"]').should(
          "have.attr",
          "aria-checked",
          "false"
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

            onChange={handleChange}
          >
            <InteractableCard value="one">One</InteractableCard>
            <InteractableCard value="two">Two</InteractableCard>
            <InteractableCard value="three">Three</InteractableCard>
          </InteractableCardGroup>
        );

        cy.get('[role="radio"][data-value="two"]').realClick();

        cy.get("@changeSpy").should("have.been.calledWith", "two");
      });

      describe("AND an InteractableCard is disabled", () => {
        it("SHOULD not select the InteractableCard", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(
            <InteractableCardGroup

              onChange={changeSpy}
            >
              <InteractableCard value="one" disabled />
              <InteractableCard value="two">Two</InteractableCard>
              <InteractableCard value="three">Three</InteractableCard>
            </InteractableCardGroup>
          );

          cy.get('[role="radio"][data-value="one"]')
            .should("have.attr", "aria-disabled", "true")
            .and("have.attr", "aria-checked", "false");
          cy.get('[role="radio"][data-value="one"]').realClick();
          cy.get("@changeSpy").should("not.be.called");
        });
      });
    });

    describe("WHEN mounted as a controlled component", () => {
      describe("THEN using a mouse", () => {
        it("SHOULD select InteractableCards", () => {
          cy.mount(<ControlledGroup />);

          cy.get('[role="radio"][data-value="one"]').should(
            "have.attr",
            "aria-checked",
            "false"
          );
          cy.get('[role="radio"][data-value="two"]').should(
            "have.attr",
            "aria-checked",
            "false"
          );
          cy.get('[role="radio"][data-value="three"]').should(
            "have.attr",
            "aria-checked",
            "false"
          );

          cy.get('[role="radio"][data-value="one"]').realClick();
          cy.get('[role="radio"][data-value="one"]').should(
            "have.attr",
            "aria-checked",
            "true"
          );

          cy.get('[role="radio"][data-value="two"]').realClick();
          cy.get('[role="radio"][data-value="one"]').should(
            "have.attr",
            "aria-checked",
            "false"
          );

          cy.get('[role="radio"][data-value="one"]').realClick();
          cy.get('[role="radio"][data-value="one"]').should(
            "have.attr",
            "aria-checked",
            "true"
          );
        });

        describe("AND an InteractableCardGroup is disabled", () => {
          it("SHOULD not select the InteractableCard", () => {
            const changeSpy = cy.stub().as("changeSpy");

            cy.mount(
              <ControlledGroup
                onChange={changeSpy}
                disabled

              />
            );

            cy.get('[role="radio"][data-value="one"]')
              .should("have.attr", "aria-disabled", "true")
              .and("have.attr", "aria-checked", "false");
            cy.get('[role="radio"][data-value="one"]').realClick();
            cy.get("@changeSpy").should("not.be.called");
          });
        });
      });
    });
  });
});
