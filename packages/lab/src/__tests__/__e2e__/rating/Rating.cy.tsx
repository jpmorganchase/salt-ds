// getLabel and getVisibleLabel functions work correctly
// visual reg for label placement

import * as ratingStories from "@stories/rating/rating.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(ratingStories);
const {
  Default,
  ReadOnly,
  Disabled,
  CustomIcons,
  FormFieldSupport,
  Controlled,
} = composedStories;

describe("GIVEN a Rating component", () => {
  checkAccessibility(composedStories);

  it("SHOULD have the correct accessibility attributes", () => {
    cy.mount(<Default aria-label="rating label" />);

    cy.findByRole("radiogroup", { name: "rating label" }).should("be.visible");
    cy.findAllByRole("radio").should("have.length", 5);
    cy.findAllByRole("radio").should("not.be.checked");
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
    cy.mount(<Default name="custom-name" />);
    cy.findAllByRole("radio").should("have.attr", "name", "custom-name");
  });

  it("SHOULD respect the max prop", () => {
    cy.mount(<Default max={10} />);
    cy.findAllByRole("radio").should("have.length", 10);
  });

  it("THEN should have a single tab stop and move focus out of the component with tab key", () => {
    cy.mount(
      <>
        <button>Before</button>
        <Default />
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
        <Default defaultValue={4} />
      </>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Before" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("radio", { name: /4 Stars/i }).should("be.focused");
  });

  describe("WHEN mounted as a controlled component", () => {
    it("SHOULD have correct value", () => {
      cy.mount(<Default value={4} />);
      cy.findByRole("radio", {
        name: /4 Stars/i,
      })
        .should("be.checked")
        .and("have.value", "4");
    });

    describe("AND using a mouse", () => {
      it("THEN should call onChange when clicked", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Controlled onChange={onChangeSpy} />);
        cy.findByRole("radio", { name: /2 Stars/i }).realClick();
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          2,
        );
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should call onChange when space is pressed", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Controlled onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.realPress("Space");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          1,
        );
      });
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    it("SHOULD have correct default value", () => {
      cy.mount(<Default defaultValue={3} />);

      cy.findByRole("radio", {
        name: /3 Stars/i,
      })
        .should("be.checked")
        .and("have.value", "3");
    });

    describe("AND using a mouse", () => {
      it("THEN should change value when clicked", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default onChange={onChangeSpy} />);
        cy.findByRole("radio", { name: /2 Stars/i }).realClick();
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          2,
        );
      });

      describe("AND is disabled", () => {
        it("THEN should not change value when clicked", () => {
          const onChangeSpy = cy.stub().as("onChangeSpy");
          cy.mount(<Disabled onChange={onChangeSpy} />);
          cy.findByRole("radio", { name: /2 Stars/i }).realClick();
          cy.findByRole("radio", { name: /2 Stars/i }).should("not.be.checked");
          cy.get("@onChangeSpy").should("not.be.called");
        });
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should select with space", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        // Enter key should not select a rating, only space should
        cy.realPress("Enter");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.get("@onChangeSpy").should("not.be.called");

        cy.realPress("Space");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          1,
        );
      });

      it("THEN should increase value with down and right arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default defaultValue={1} onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          2,
        );
        cy.realPress("ArrowDown");
        cy.findByRole("radio", { name: /2 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          3,
        );
      });

      it("THEN should decrease value with up and left arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default defaultValue={5} onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /5 Stars/i }).should("be.checked");
        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: /5 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /4 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          4,
        );
        cy.realPress("ArrowUp");
        cy.findByRole("radio", { name: /4 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          3,
        );
      });

      it("THEN should wrap around values with arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i })
          .should("be.focused")
          .and("not.be.checked");
        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: /5 Stars/i })
          .should("be.focused")
          .and("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          5,
        );
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: /1 Star/i })
          .should("be.focused")
          .and("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWithMatch",
          Cypress.sinon.match.any,
          1,
        );
      });
    });
  });

  describe("WHEN disabled", () => {
    it("SHOULD render disabled rating component", () => {
      cy.mount(<Disabled />);
      cy.findAllByRole("radio").should("be.disabled");
    });

    it("SHOULD not call onChange handler when clicked", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(<Disabled onChange={onChangeSpy} />);
      cy.findByRole("radio", { name: /1 Star/i }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
    });

    it("SHOULD not receive focus", () => {
      cy.mount(
        <>
          <button>Before</button>
          <Disabled />
          <button>After</button>
        </>,
      );

      cy.findByRole("button", { name: "Before" }).realClick();
      cy.realPress("Tab");
      cy.findAllByRole("radio").should("not.be.focused");
      cy.findByRole("button", { name: "After" }).should("be.focused");
    });
  });

  describe("WHEN read-only", () => {
    it("SHOULD be focusable", () => {
      const selectSpy = cy.stub().as("selectSpy");
      cy.mount(<ReadOnly defaultValue={3} onChange={selectSpy} />);

      cy.findAllByRole("radio").should("have.attr", "readonly");
      cy.realPress("Tab");
      cy.findByRole("radio", { name: /3 Stars/i }).should("be.focused");
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
      cy.mount(<FormFieldSupport disabled />);
      cy.findAllByRole("radio").should("be.disabled");
    });

    it("THEN should respect the context when read-only", () => {
      cy.mount(<FormFieldSupport readOnly />);
      cy.findAllByRole("radio").should("have.attr", "readonly");
    });

    it("THEN should use form field label", () => {
      cy.mount(<FormFieldSupport />);
      cy.findByRole("radiogroup", { name: "Form field label" }).should(
        "be.visible",
      );
    });
  });

  describe("WHEN custom icons are provided", () => {
    it("THEN should render the custom icons", () => {
      cy.mount(<CustomIcons />);
      cy.findAllByTestId("LikeSolidIcon").should("have.length", 3);
      cy.findAllByTestId("LikeIcon").should("have.length", 2);
    });
  });
});
