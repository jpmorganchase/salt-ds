import * as ratingStories from "@stories/rating/rating.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(ratingStories);
const {
  Default,
  ReadOnly,
  Disabled,
  CustomIcons,
  Controlled,
  FormFieldSupport,
} = composedStories;

describe("GIVEN a Rating component", () => {
  checkAccessibility(composedStories);

  it("SHOULD have the correct accessibility attributes", () => {
    cy.mount(<Default aria-label="rating label" name="custom-name" max={10} />);

    cy.findByRole("radiogroup", { name: "rating label" }).should("be.visible");
    cy.findAllByRole("radio")
      .should("have.length", 10)
      .and("not.be.checked")
      .and("have.attr", "name", "custom-name");
    cy.findAllByRole("radio").each((radio, index) => {
      const value = index + 1;
      cy.wrap(radio).should(
        "have.attr",
        "aria-label",
        `${value} Star${value > 1 ? "s" : ""}`,
      );
    });
  });

  it("THEN should have correct tab order", () => {
    cy.mount(
      <>
        <button>Before</button>
        <Default defaultValue={4} />
        <button>After</button>
      </>,
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Before" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("radio", { name: "4 Stars" })
      .should("be.focused")
      .and("be.checked");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "After" }).should("be.focused");
  });

  it("THEN should handle max value of 0", () => {
    cy.mount(<Default max={0} />);
    cy.findAllByRole("radio").should("have.length", 0);
  });

  describe("WHEN mounted as a controlled component", () => {
    it("SHOULD have correct value", () => {
      cy.mount(<Default value={4} />);
      cy.findByRole("radio", {
        name: "4 Stars",
      })
        .should("be.checked")
        .and("have.value", "4");
    });

    describe("AND using a mouse", () => {
      it("THEN should handle selection", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Controlled onChange={onChangeSpy} value={4} />);
        cy.findAllByRole("radio").should("not.be.checked");
        cy.findByRole("radio", { name: "2 Stars" }).realClick();
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.findByRole("radio", { name: "4 Stars" }).realClick();
        cy.findByRole("radio", { name: "4 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          4,
        );
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should handle selection", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Controlled onChange={onChangeSpy} />);

        cy.findAllByRole("radio").should("not.be.checked");
        cy.realPress("Tab");
        cy.findByRole("radio", { name: "1 Star" }).should("not.be.checked");

        // Enter key should not select a rating, only space should
        cy.realPress("Enter");
        cy.findByRole("radio", { name: "1 Star" }).should("not.be.checked");
        cy.get("@onChangeSpy").should("not.be.called");

        cy.realPress("Space");
        cy.findByRole("radio", { name: "1 Star" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          1,
        );

        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.realPress("ArrowDown");
        cy.findByRole("radio", { name: "3 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          3,
        );

        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.realPress("ArrowUp");
        cy.findByRole("radio", { name: "1 Star" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          1,
        );
      });
    });
  });

  describe("WHEN mounted as an uncontrolled component", () => {
    describe("AND using a mouse", () => {
      it("THEN should change value when clicked", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default defaultValue={3} onChange={onChangeSpy} />);

        cy.findByRole("radio", {
          name: "3 Stars",
        })
          .should("be.checked")
          .and("have.value", "3");

        cy.findByRole("radio", { name: "2 Stars" }).realClick();
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.findByRole("radio", { name: "4 Stars" }).realClick();
        cy.findByRole("radio", { name: "4 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          4,
        );
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should handle selection", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default onChange={onChangeSpy} />);

        cy.findAllByRole("radio").should("not.be.checked");
        cy.realPress("Tab");
        cy.findByRole("radio", { name: "1 Star" }).should("not.be.checked");

        // Enter key should not select a rating, only space should
        cy.realPress("Enter");
        cy.findByRole("radio", { name: "1 Star" }).should("not.be.checked");
        cy.get("@onChangeSpy").should("not.be.called");

        cy.realPress("Space");
        cy.findByRole("radio", { name: "1 Star" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          1,
        );

        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.realPress("ArrowDown");
        cy.findByRole("radio", { name: "3 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          3,
        );

        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: "2 Stars" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );

        cy.realPress("ArrowUp");
        cy.findByRole("radio", { name: "1 Star" }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          1,
        );
      });

      it("THEN should wrap around values with arrow keys", () => {
        const onChangeSpy = cy.stub().as("onChangeSpy");
        cy.mount(<Default onChange={onChangeSpy} />);

        cy.realPress("Tab");
        cy.findByRole("radio", { name: "1 Star" })
          .should("be.focused")
          .and("not.be.checked");
        cy.realPress("ArrowLeft");
        cy.findByRole("radio", { name: "5 Stars" })
          .should("be.focused")
          .and("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          5,
        );
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: "1 Star" })
          .should("be.focused")
          .and("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          1,
        );
      });
    });
  });

  describe("WHEN disabled", () => {
    it("SHOULD not be interactive", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(<Disabled onChange={onChangeSpy} />);

      cy.findAllByRole("radio").should("be.disabled");
      cy.findByRole("radio", { name: "1 Star" }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
      cy.findByRole("radio", { name: "1 Star" }).should("not.be.checked");
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
      cy.findByRole("radio", { name: "3 Stars" }).should("be.focused");
      cy.realPress("ArrowRight");
      cy.get("@selectSpy").should("not.be.called");
      cy.findByRole("radio", { name: "4 Stars" }).should("be.focused");
      cy.realPress("ArrowLeft");
      cy.get("@selectSpy").should("not.be.called");
      cy.findByRole("radio", { name: "3 Stars" }).should("be.focused");
    });

    it("SHOULD not update visible label on hover when read-only", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(
        <ReadOnly
          defaultValue={2}
          getVisibleLabel={(value, max) => `${value}/${max}`}
          onChange={onChangeSpy}
        />,
      );

      cy.findByText("2/5").should("be.visible");
      cy.findByRole("radio", { name: "4 Stars" }).realHover();
      cy.findByText("2/5").should("be.visible");
      cy.findByRole("radio", { name: "4 Stars" }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
      cy.findByText("2/5").should("be.visible");
    });
  });

  describe("WHEN wrapped in a FormField", () => {
    it("THEN should respect the context when disabled", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(<FormFieldSupport disabled onChange={onChangeSpy} />);
      cy.findByRole("radiogroup", { name: "Form field label" }).should(
        "be.visible",
      );
      cy.findAllByRole("radio").should("be.disabled");
      cy.findByRole("radio", { name: "Poor" }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
    });

    it("THEN should respect the context when read-only", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(<FormFieldSupport onChange={onChangeSpy} readOnly />);
      cy.findByRole("radiogroup", { name: "Form field label" }).should(
        "be.visible",
      );
      cy.findAllByRole("radio").should("have.attr", "readonly");
      cy.findByRole("radio", { name: "Poor" }).realClick();
      cy.get("@onChangeSpy").should("not.be.called");
    });
  });

  describe("WHEN custom icons are provided", () => {
    it("THEN should render the custom icons", () => {
      cy.mount(<CustomIcons />);
      cy.findAllByTestId("LikeSolidIcon").should("have.length", 3);
      cy.findAllByTestId("LikeIcon").should("have.length", 2);
    });
  });

  describe("WHEN getVisibleLabel and getLabel are provided", () => {
    it("THEN should update visible label on hover and selection", () => {
      const onChangeSpy = cy.stub().as("onChangeSpy");
      cy.mount(
        <Default
          getLabel={(value) => `Level ${value}`}
          getVisibleLabel={(value, max) => `${value}/${max}`}
          onChange={onChangeSpy}
        />,
      );

      cy.findByText("0/5").should("be.visible");

      cy.findByRole("radio", { name: "Level 2" }).realHover();
      cy.findByText("2/5").should("be.visible");

      cy.findByRole("radio", { name: "Level 3" }).realHover();
      cy.findByText("3/5").should("be.visible");

      cy.findByRole("radio", { name: "Level 4" }).realClick();
      cy.get("@onChangeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        4,
      );
      cy.findByRole("radio", { name: "Level 4" }).should("be.checked");
      cy.findByText("4/5").should("be.visible");

      cy.findByRole("radiogroup").trigger("mouseout");
      cy.findByText("4/5").should("be.visible");
    });
  });
});
