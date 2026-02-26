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
    cy.findAllByRole("radio").should("have.length", 5).and("not.be.checked");
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

  it("THEN should handle max value of 0 or negative", () => {
    cy.mount(<Default max={0} />);
    cy.findAllByRole("radio").should("have.length", 0);
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
        cy.mount(<Controlled />);
        cy.findAllByRole("radio").should("not.be.checked");
        cy.findByRole("radio", { name: /2 Stars/i }).realClick();
        cy.findByRole("radio", { name: /2 Stars/i }).should("be.checked");
      });
    });

    describe("AND using keyboard", () => {
      it("THEN should call onChange when space is pressed", () => {
        cy.mount(<Controlled />);
        cy.findAllByRole("radio").should("not.be.checked");
        cy.realPress("Tab");
        cy.findByRole("radio", { name: /1 Star/i }).should("not.be.checked");
        cy.realPress("Space");
        cy.findByRole("radio", { name: /1 Star/i }).should("be.checked");
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
          "have.been.calledWith",
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
          "have.been.calledWith",
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
          "have.been.calledWith",
          Cypress.sinon.match.any,
          2,
        );
        cy.realPress("ArrowDown");
        cy.findByRole("radio", { name: /2 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
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
          "have.been.calledWith",
          Cypress.sinon.match.any,
          4,
        );
        cy.realPress("ArrowUp");
        cy.findByRole("radio", { name: /4 Stars/i }).should("not.be.checked");
        cy.findByRole("radio", { name: /3 Stars/i }).should("be.checked");
        cy.get("@onChangeSpy").should(
          "have.been.calledWith",
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
          "have.been.calledWith",
          Cypress.sinon.match.any,
          5,
        );
        cy.realPress("ArrowRight");
        cy.findByRole("radio", { name: /1 Star/i })
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

    it("SHOULD not update visible label on hover when read-only", () => {
      cy.mount(
        <ReadOnly
          defaultValue={2}
          getVisibleLabel={(value, max) => `${value}/${max}`}
        />,
      );

      cy.findByText("2/5").should("be.visible");
      cy.findByRole("radio", { name: /4 Stars/i }).realHover();
      cy.findByText("2/5").should("be.visible");
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

  describe("WHEN getLabel is provided", () => {
    it("THEN should use custom label for accessibility", () => {
      const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
      cy.mount(
        <Default getLabel={(value) => labels[value - 1]} defaultValue={3} />,
      );

      cy.findAllByRole("radio").each((radio, index) => {
        const value = index + 1;
        cy.wrap(radio).should("have.attr", "aria-label", labels[value - 1]);
      });
    });

    it("THEN should update aria-label for each rating value", () => {
      cy.mount(<Default getLabel={(value) => `Rating: ${value} out of 5`} />);

      cy.findByRole("radio", { name: "Rating: 1 out of 5" }).should("exist");
      cy.findByRole("radio", { name: "Rating: 3 out of 5" }).should("exist");
      cy.findByRole("radio", { name: "Rating: 5 out of 5" }).should("exist");
    });

    it("THEN should work with different max values", () => {
      cy.mount(<Default getLabel={(value) => `Level ${value}`} max={10} />);

      cy.findByRole("radio", { name: "Level 1" }).should("exist");
      cy.findByRole("radio", { name: "Level 7" }).should("exist");
      cy.findByRole("radio", { name: "Level 10" }).should("exist");
    });
  });

  describe("WHEN getVisibleLabel is provided", () => {
    it("THEN should display visible label with current rating", () => {
      cy.mount(
        <Default
          defaultValue={3}
          getVisibleLabel={(value, max) => `${value}/${max}`}
        />,
      );

      cy.findByText("3/5").should("be.visible");
    });

    it("THEN should update visible label on hover", () => {
      cy.mount(
        <Default
          defaultValue={2}
          getVisibleLabel={(value, max) => `${value}/${max}`}
        />,
      );

      cy.findByText("2/5").should("be.visible");
      cy.findByRole("radio", { name: /4 Stars/i }).realHover();
      cy.findByText("4/5").should("be.visible");
    });

    it("THEN should show custom text labels", () => {
      const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
      cy.mount(
        <Default
          defaultValue={3}
          getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        />,
      );

      cy.findByText("Good").should("be.visible");
    });

    it("THEN should update visible label when hovering different ratings", () => {
      const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
      cy.mount(
        <Default
          defaultValue={1}
          getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        />,
      );

      cy.findByText("Poor").should("be.visible");
      cy.findByRole("radio", { name: /3 Stars/i }).realHover();
      cy.findByText("Good").should("be.visible");
      cy.findByRole("radio", { name: /5 Stars/i }).realHover();
      cy.findByText("Excellent").should("be.visible");
    });

    it("THEN should revert to selected value label when mouse leaves", () => {
      cy.mount(
        <Default
          defaultValue={2}
          getVisibleLabel={(value, max) => `${value}/${max}`}
        />,
      );

      cy.findByText("2/5").should("be.visible");
      cy.findByRole("radio", { name: /4 Stars/i }).realHover();
      cy.findByText("4/5").should("be.visible");
      cy.findByRole("radiogroup").trigger("mouseout");
      cy.findByText("2/5").should("be.visible");
    });

    it("THEN should show 'No rating' for unselected state", () => {
      cy.mount(
        <Default
          defaultValue={0}
          getVisibleLabel={(value) =>
            value === 0 ? "No rating" : `${value} selected`
          }
        />,
      );

      cy.findByText("No rating").should("be.visible");
    });

    it("THEN should update label after selection", () => {
      cy.mount(<Default getVisibleLabel={(value, max) => `${value}/${max}`} />);

      cy.findByText("0/5").should("be.visible");
      cy.findByRole("radio", { name: /3 Stars/i }).realClick();
      cy.findByText("3/5").should("be.visible");
    });
  });

  describe("WHEN both getLabel and getVisibleLabel are provided", () => {
    it("THEN should use getLabel for accessibility and getVisibleLabel for display", () => {
      const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
      cy.mount(
        <Default
          defaultValue={3}
          getLabel={(value) => labels[value - 1]}
          getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        />,
      );

      cy.findByRole("radio", { name: "Good" }).should("be.checked");
      cy.findByText("Good").should("be.visible");
    });
  });
});
