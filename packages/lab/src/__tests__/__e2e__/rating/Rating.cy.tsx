// shows correct labels - done
// has correct aria attributes - done
// respects max prop - done
// uses correct value and default value - done
// onChange returns the correct value
// getLabel and getVisibleLabel functions work correctly
// supports keyboard navigation - done
// supports mouse interactions - done
// supports read-only state - done
// supports disabled state - done
// supports form fields - done
// supports custom icons
// focus wraps with arrow key navigation - done
// support up / down and left / right arrow key navigation - done
// single tab stop into the rating component, then arrow keys to change value, then tab to move focus out of the component - done
// tab moves focus to the selected rating, if any, otherwise the first rating - done
// visual reg for label placement
// name?

import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";

describe("GIVEN a Rating component", () => {
  it("SHOULD have the correct accessibility attributes", () => {
    cy.mount(<Rating aria-label="rating label" />);

    cy.findByRole("radiogroup", { name: "rating label" }).should("be.visible");
    cy.findAllByRole("radio").should("have.length", 5);
    cy.findAllByRole("radio").each((radio, index) => {
      const value = index + 1;
      cy.wrap(radio).should(
        "have.attr",
        "aria-label",
        `${value} Star${value > 1 ? "s" : ""}`,
      );
    });
  });

  it("SHOULD use user provided name", () => {
    cy.mount(<Rating name="custom-name" />);
    cy.findAllByRole("radio").should("have.attr", "name", "custom-name");
  });

  it("SHOULD respect the max prop", () => {
    cy.mount(<Rating max={10} />);
    cy.findAllByRole("radio").should("have.length", 10);
  });

  it("THEN should have a single tab stop and move focus out of the component with tab key", () => {
    cy.mount(
      <>
        <button>Before</button>
        <Rating />
        <button>After</button>
      </>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Before" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("radio", { name: /1 Star/i }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "After" }).should("be.focused");
  });

  it("THEN should move focus to the selected rating when tabbed into", () => {
    cy.mount(
      <>
        <button>Before</button>
        <Rating defaultValue={4} />
      </>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Before" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("radio", { name: /4 Stars/i }).should("be.focused");
  });

  describe("WHEN mounted as a controlled component", () => {
    it("SHOULD have correct value", () => {
      cy.mount(<Rating value={4} />);
      cy.findByRole("radio", {
        name: /4 Stars/i,
      })
        .should("be.checked")
        .and("have.value", "4");
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("SHOULD have correct default value", () => {
      cy.mount(<Rating defaultValue={3} />);

      cy.findByRole("radio", {
        name: /3 Stars/i,
      })
        .should("be.checked")
        .and("have.value", "3");
    });

    describe("AND using a mouse", () => {
      it("THEN should change value when clicked", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Rating onChange={onChangeSpy} />);
        cy.findByRole("radio", { name: /2 Stars/i }).realClick();
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "2" },
        });
      });

      describe("AND is disabled", () => {
        it("THEN should not change value when clicked", () => {
          const onChangeSpy = cy.stub().as("onChangeSpy");
          cy.mount(<Rating disabled onChange={onChangeSpy} />);
          cy.findByRole("radio", { name: /2 Stars/i }).realClick();
          cy.findByRole("radio", { name: /2 Stars/i }).should("not.be.checked");
          cy.get("@onChangeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should increase value with down and right arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Rating onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "2" },
        });
        cy.realPress("ArrowDown");
        cy.findByRole("radio", { name: /2 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "3" },
        });
      });

      it("THEN should decrease value with up and left arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Rating defaultValue={5} onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /5 Stars/i }).should("be.checked");
        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: /5 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /4 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "4" },
        });
        cy.realPress("ArrowUp");
        cy.findByRole("radio", { name: /4 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "3" },
        });
      });

      it("THEN should wrap around values with arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Rating onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /5 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "5" },
        });
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: /5 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.get("@onChangeSpy").should("have.been.calledWithMatch", {
          target: { value: "1" },
        });
      });
    });
  });

  describe("WHEN disabled", () => {
    it("SHOULD render disabled rating component", () => {
      cy.mount(<Rating disabled />);
      cy.findAllByRole("radio").should("be.disabled");
    });

    it("SHOULD not call onChange handler when clicked", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(<Rating disabled onChange={onChangeSpy} />);
      cy.findByRole("radio", { name: /1 Star/i }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
    });

    it("SHOULD not receive focus", () => {
      cy.mount(
        <>
          <button>Before</button>
          <Rating disabled />
          <button>After</button>
        </>,
      );

      cy.findByRole("button", { name: "Before" }).realClick();
      cy.realPress("Tab");
      cy.findByRole("radio").should("not.be.focused");
      cy.findByRole("button", { name: "After" }).should("be.focused");
    });
  });

  describe("WHEN read-only", () => {
    it("SHOULD be focusable", () => {
      const selectSpy = cy.stub().as("selectSpy");
      cy.mount(<Rating defaultValue={3} readOnly onChange={selectSpy} />);

      cy.findAllByRole("radio").should("have.attr", "readonly");
      cy.realPress("Tab");
      cy.findByRole("radio", { name: /3 Stars/i }).should("be.focused");

      cy.realPress("Enter");
      cy.get("@selectSpy").should("not.be.called");
      cy.realPress("Space");
      cy.get("@selectSpy").should("not.be.called");

      cy.realPress("ArrowRight");
      cy.get("@selectSpy").should("not.be.called");
      cy.findByRole("radio", { name: /4 Stars/i }).should("be.focused");
      cy.realPress("ArrowLeft");
      cy.get("@selectSpy").should("not.be.called");
      cy.findByRole("radio", { name: /3 Stars/i }).should("be.focused");
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      cy.mount(
        <FormField disabled>
          <FormFieldLabel>Label</FormFieldLabel>
          <Rating />
        </FormField>,
      );
      cy.findAllByRole("radio").should("be.disabled");
    });

    it("THEN should respect the context when read-only", () => {
      cy.mount(
        <FormField readOnly>
          <FormFieldLabel>Label</FormFieldLabel>
          <Rating />
        </FormField>,
      );
      cy.findAllByRole("radio").should("have.attr", "readonly");
    });

    it("THEN should have the correct aria labelling", () => {
      cy.mount(
        <FormField>
          <FormFieldLabel>Rating</FormFieldLabel>
          <Rating />
        </FormField>,
      );
      cy.findByRole("radiogroup", { name: "Rating" }).should("be.visible");
    });
  });

  //   describe("WHEN custom icons are provided", () => {});
});
