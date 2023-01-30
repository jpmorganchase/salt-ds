import { composeStories } from "@storybook/testing-react";
import * as flexStories from "@stories/flex-layout.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { SaltProvider } from "@salt-ds/core";

const composedStories = composeStories(flexStories);
const { DefaultFlexLayout, FlexLayoutNested } = composedStories;

describe("GIVEN a Flex", () => {
  checkAccessibility(composedStories);

  describe("WHEN no props are provided", () => {
    it("THEN it should render with flex direction row", () => {
      cy.mount(<DefaultFlexLayout />);

      cy.get(".saltFlexLayout").should("have.css", "flex-direction", "row");
    });

    it("THEN it should render with flex wrap", () => {
      cy.mount(<DefaultFlexLayout />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
    });

    it("THEN it should render with a default gap", () => {
      cy.mount(<DefaultFlexLayout />);

      cy.get(".saltFlexLayout").should("have.css", "column-gap", "24px");

      cy.get(".saltFlexLayout").should("have.css", "row-gap", "24px");
    });

    it("THEN nested items should not inherit css variables from parent", () => {
      cy.mount(<FlexLayoutNested />);

      cy.get(".saltFlexLayout").eq(0).should("have.css", "flex-wrap", "wrap");
      cy.get(".saltFlexLayout")
        .eq(0)
        .should("have.css", "justify-content", "space-between");
      cy.get(".saltFlexLayout").eq(0).should("have.css", "row-gap", "48px");

      cy.get(".saltFlexLayout").eq(1).should("have.css", "flex-wrap", "nowrap");
      cy.get(".saltFlexLayout")
        .eq(1)
        .should("have.css", "justify-content", "flex-start");
      cy.get(".saltFlexLayout").eq(1).should("have.css", "row-gap", "24px");
    });
  });

  describe("WHEN wrap is set to false", () => {
    it("THEN it should render with no flex wrap", () => {
      cy.mount(<DefaultFlexLayout wrap={false} />);

      cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
    });
  });

  describe("WHEN responsive values are provided", () => {
    const wrap = {
      xs: true,
      sm: true,
      md: true,
      lg: false,
      xl: false,
    };

    it(
      "THEN it should not wrap on xl viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1921,
      },
      () => {
        cy.mount(<DefaultFlexLayout wrap={wrap} />);

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
      }
    );

    it(
      "THEN it should wrap on md viewport",
      {
        viewportHeight: 900,
        viewportWidth: 961,
      },
      () => {
        cy.mount(<DefaultFlexLayout wrap={wrap} />);

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );

    it(
      "THEN it should wrap on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 700,
      },
      () => {
        cy.mount(<DefaultFlexLayout wrap={wrap} />);

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );

    it(
      "THEN it should wrap on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 600,
      },
      () => {
        cy.mount(<DefaultFlexLayout wrap={wrap} />);

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );
  });

  describe("WHEN custom breakpoints are provided", () => {
    const wrap = {
      xs: true,
      sm: true,
      md: true,
      lg: false,
      xl: false,
    };

    const breakpoints = {
      xs: 0,
      sm: 500,
      md: 860,
      lg: 1180,
      xl: 1820,
    };

    it(
      "THEN it should not wrap on xl viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1821,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <DefaultFlexLayout wrap={wrap} />
          </SaltProvider>
        );

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "nowrap");
      }
    );

    it(
      "THEN it should wrap on md viewport",
      {
        viewportHeight: 900,
        viewportWidth: 1101,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <DefaultFlexLayout wrap={wrap} />
          </SaltProvider>
        );

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );

    it(
      "THEN it should wrap on sm viewport",
      {
        viewportHeight: 900,
        viewportWidth: 741,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <DefaultFlexLayout wrap={wrap} />
          </SaltProvider>
        );

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );

    it(
      "THEN it should wrap on xs viewport",
      {
        viewportHeight: 900,
        viewportWidth: 499,
      },
      () => {
        cy.mount(
          <SaltProvider breakpoints={breakpoints}>
            <DefaultFlexLayout wrap={wrap} />
          </SaltProvider>
        );

        cy.get(".saltFlexLayout").should("have.css", "flex-wrap", "wrap");
      }
    );
  });
});
