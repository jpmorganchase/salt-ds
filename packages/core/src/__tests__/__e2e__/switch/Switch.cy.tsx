import * as switchStories from "@stories/switch/switch.stories";
import { composeStories } from "@storybook/react";
import type { ChangeEvent } from "react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(switchStories);
const { Default, Disabled, Controlled, WithFormField, Readonly } =
  composedStories;

describe("GIVEN a Switch", () => {
  checkAccessibility(composedStories);

  it("SHOULD support data attribute on inputProps", () => {
    cy.mount(<Default inputProps={{ "data-testid": "customInput" }} checked />);
    cy.findByTestId("customInput").should("be.checked");
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("THEN should be checked if defaultChecked is true", () => {
      cy.mount(<Default defaultChecked />);
      cy.findByRole("switch").should("be.checked");
    });

    describe("AND using a mouse", () => {
      it("SHOULD handle selection", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(<Default onChange={handleChange} />);
        cy.findByRole("switch").should("not.be.checked");

        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("be.checked");
        cy.get("@changeSpy")
          .should("have.callCount", 1)
          .and("have.been.calledWithMatch", {
            target: { checked: true },
          });

        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("not.be.checked");
        cy.get("@changeSpy")
          .should("have.callCount", 2)
          .and("have.been.calledWithMatch", {
            target: { checked: false },
          });
      });
    });

    describe("AND using a keyboard", () => {
      it("SHOULD handle selection", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };

        cy.mount(<Default onChange={handleChange} />);

        cy.realPress("Tab");
        cy.findByRole("switch").should("not.be.checked").and("be.focused");

        // Enter key should not toggle the switch
        cy.realPress("Enter");
        cy.findByRole("switch").should("not.be.checked");
        cy.get("@changeSpy").should("not.have.been.called");

        cy.realPress("Space");
        cy.findByRole("switch").should("be.checked").and("be.focused");
        cy.get("@changeSpy")
          .should("have.callCount", 1)
          .and("have.been.calledWithMatch", {
            target: { checked: true },
          });

        cy.realPress("Space");
        cy.findByRole("switch").should("not.be.checked").and("be.focused");
        cy.get("@changeSpy")
          .should("have.callCount", 2)
          .and("have.been.calledWithMatch", {
            target: { checked: false },
          });
      });
    });
  });

  describe("WHEN mounted as a controlled component", () => {
    it("THEN should be checked if checked is true", () => {
      cy.mount(<Default checked />);
      cy.findByRole("switch").should("be.checked");
    });

    describe("AND using a mouse", () => {
      it("THEN should allow selection", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          onChangeSpy(event);
        };

        cy.mount(<Controlled onChange={handleChange} />);

        cy.findByRole("switch").should("not.be.checked");
        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("be.checked");
        cy.get("@onChangeSpy")
          .should("have.callCount", 1)
          .and("have.been.calledWithMatch", {
            target: { checked: true },
          });

        cy.findByRole("switch").realClick();
        cy.findByRole("switch").should("not.be.checked");
        cy.get("@onChangeSpy")
          .should("have.callCount", 2)
          .and("have.been.calledWithMatch", {
            target: { checked: false },
          });
      });
    });

    describe("AND using a keyboard", () => {
      it("THEN should allow selection", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          onChangeSpy(event);
        };

        cy.mount(<Controlled onChange={handleChange} />);
        cy.realPress("Tab");
        cy.findByRole("switch").should("not.be.checked").and("be.focused");

        // Enter key should not toggle the switch
        cy.realPress("Enter");
        cy.findByRole("switch").should("not.be.checked");
        cy.get("@onChangeSpy").should("not.have.been.called");

        cy.realPress("Space");
        cy.findByRole("switch").should("be.checked");
        cy.get("@onChangeSpy")
          .should("have.callCount", 1)
          .and("have.been.calledWithMatch", {
            target: { checked: true },
          });

        cy.realPress("Space");
        cy.findByRole("switch").should("not.be.checked");
        cy.get("@onChangeSpy")
          .should("have.callCount", 2)
          .and("have.been.calledWithMatch", {
            target: { checked: false },
          });
      });
    });
  });

  describe("WHEN disabled", () => {
    it("THEN should not be interactive", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<Disabled onChange={changeSpy} />);
      cy.findByRole("switch").should("be.disabled").and("not.be.checked");

      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");

      cy.findByLabelText("Disabled").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");
    });

    it("THEN should not be focusable", () => {
      cy.mount(
        <>
          <button>Before</button>
          <Disabled />
          <button>After</button>
        </>,
      );
      cy.realPress("Tab");
      cy.findByRole("button", { name: "Before" }).should("be.focused");
      cy.realPress("Tab");
      cy.findByRole("switch").should("not.be.focused");
      cy.findByRole("button", { name: "After" }).should("be.focused");
    });
  });

  describe("WHEN used without label", () => {
    it("THEN should NOT render label", () => {
      cy.mount(<Default label={undefined} />);
      cy.findByLabelText("Default").should("not.exist");

      cy.findByRole("switch").should("not.have.attr", "aria-describedby");
      cy.findByRole("switch").should("not.have.attr", "aria-labelledby");
    });
  });

  describe("WHEN readOnly is true", () => {
    it("THEN should not be selectable", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<Readonly onChange={changeSpy} />);
      cy.findByRole("switch").should("have.attr", "aria-readonly", "true");

      cy.realPress("Tab");
      cy.findByRole("switch").should("not.be.checked").and("be.focused");

      cy.realPress("Space");
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");

      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");

      cy.findByLabelText("Read-only").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");
    });
  });

  describe("WHEN wrapped in a form field", () => {
    it("THEN should respect form field accessibility attributes and allow selection", () => {
      const changeSpy = cy.stub().as("changeSpy");

      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        // React 16 backwards compatibility
        event.persist();
        changeSpy(event);
      };

      cy.mount(<WithFormField onChange={handleChange} />);
      cy.findByRole("switch").should("have.accessibleName", "Label");
      cy.findByRole("switch").should(
        "have.accessibleDescription",
        "Helper text",
      );

      cy.findByLabelText("Label").realClick();
      cy.findByRole("switch").should("be.focused").and("be.checked");
      cy.get("@changeSpy")
        .should("have.callCount", 1)
        .and("have.been.calledWithMatch", {
          target: { checked: true },
        });

      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("be.focused").and("not.be.checked");
      cy.get("@changeSpy")
        .should("have.callCount", 2)
        .and("have.been.calledWithMatch", {
          target: { checked: false },
        });
    });

    it("THEN should respect form field disabled state", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<WithFormField disabled onChange={changeSpy} />);
      cy.findByRole("switch").should("have.accessibleName", "Label");
      cy.findByRole("switch").should(
        "have.accessibleDescription",
        "Helper text",
      );
      cy.findByRole("switch").should("be.disabled").and("not.be.checked");

      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");

      cy.findByLabelText("Label").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");
    });

    it("THEN should respect form field readOnly state", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<WithFormField readOnly onChange={changeSpy} />);
      cy.findByRole("switch").should("have.accessibleName", "Label");
      cy.findByRole("switch").should(
        "have.accessibleDescription",
        "Helper text",
      );
      cy.findByRole("switch").should("have.attr", "aria-readonly", "true");
      cy.findByRole("switch").should("not.be.checked");

      cy.findByRole("switch").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");

      cy.findByLabelText("Label").realClick();
      cy.findByRole("switch").should("not.be.checked");
      cy.get("@changeSpy").should("not.have.been.called");
    });
  });
});
