import * as carouselStories from "@stories/carousel.stories";
import { composeStories } from "@storybook/react-vite";
import ClassNames from "embla-carousel-class-names";
import { type MutableRefObject, useRef } from "react";
import type { CarouselApi } from "../../index";

const composedStories = composeStories(carouselStories);
const { Default } = composedStories;

describe("Given a Carousel", () => {
  it("should render the carousel with four slides", () => {
    cy.mount(<Default />);
    cy.findByRole("region").should("exist");
    cy.get('[aria-label="carousel example"]').should("exist");
    cy.get('[aria-roledescription="slide"]').should("have.length", 4);
  });

  describe("WITH the current slide as slide 1", () => {
    let emblaApiRef: MutableRefObject<CarouselApi | undefined>;
    const TestComponent = () => {
      emblaApiRef = useRef<CarouselApi | undefined>(undefined);
      return (
        <Default
          emblaOptions={{ duration: 1 }}
          emblaPlugins={[ClassNames()]}
          emblaApiRef={emblaApiRef}
        />
      );
    };

    beforeEach(() => {
      cy.mount(<TestComponent />);
      cy.findByRole("region").should("exist");
      // Wait for emblaApi to be set
      cy.wrap(
        new Cypress.Promise((resolve) => {
          const checkEmblaApi = () => {
            if (emblaApiRef?.current) {
              resolve();
            } else {
              setTimeout(checkEmblaApi, 50);
            }
          };
          checkEmblaApi();
        }),
      );
    });

    it("should navigate forwards to each slide", () => {
      // should start from slide 1
      cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
        "have.text",
        "1",
      );

      const waitForSettle = (expectedSlideIndex: number) => {
        return new Cypress.Promise((resolve) => {
          const handleSettle = () => {
            const currentSlideIndex =
              emblaApiRef?.current?.selectedScrollSnap();
            if (currentSlideIndex === expectedSlideIndex) {
              resolve();
              emblaApiRef?.current?.off("settle", handleSettle);
            }
          };
          emblaApiRef?.current?.on("settle", handleSettle);
        });
      };

      // should navigate forwards to slide 2
      cy.findByTestId("ChevronRightIcon").parent().click();
      cy.wrap(waitForSettle(1)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "2",
        );
      });

      // should navigate forwards to slide 3
      cy.findByTestId("ChevronRightIcon").parent().click();
      cy.wrap(waitForSettle(2)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "3",
        );
      });

      // should navigate forwards to slide 4
      cy.findByTestId("ChevronRightIcon").parent().click();
      cy.wrap(waitForSettle(3)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "4",
        );
      });

      // should disable the next page navigation
      cy.findByTestId("ChevronRightIcon")
        .parent()
        .should("have.attr", "aria-disabled", "true");
    });
  });

  describe("WITH the current slide as slide 4", () => {
    let emblaApiRef: MutableRefObject<CarouselApi | undefined>;
    const TestComponent = () => {
      emblaApiRef = useRef<CarouselApi | undefined>(undefined);
      return (
        <Default
          emblaOptions={{ duration: 1, startIndex: 3 }}
          emblaPlugins={[ClassNames()]}
          emblaApiRef={emblaApiRef}
        />
      );
    };

    beforeEach(() => {
      cy.mount(<TestComponent />);
      cy.findByRole("region").should("exist");
      // Wait for emblaApi to be set
      cy.wrap(
        new Cypress.Promise((resolve) => {
          const checkEmblaApi = () => {
            if (emblaApiRef?.current) {
              resolve();
            } else {
              setTimeout(checkEmblaApi, 50);
            }
          };
          checkEmblaApi();
        }),
      );
    });

    it("should navigate backwards to each slide", () => {
      // should start from slide 4
      cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
        "have.text",
        "4",
      );

      const waitForSettle = (expectedSlideIndex: number) => {
        return new Cypress.Promise((resolve) => {
          const handleSettle = () => {
            const currentSlideIndex =
              emblaApiRef?.current?.selectedScrollSnap();
            if (currentSlideIndex === expectedSlideIndex) {
              resolve();
              emblaApiRef?.current?.off("settle", handleSettle);
            }
          };
          emblaApiRef?.current?.on("settle", handleSettle);
        });
      };

      // should navigate backwards to slide 3
      cy.findByTestId("ChevronLeftIcon").parent().click();
      cy.wrap(waitForSettle(2)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "3",
        );
      });
      // should navigate backwards to slide 2
      cy.findByTestId("ChevronLeftIcon").parent().click();
      cy.wrap(waitForSettle(1)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "2",
        );
      });
      // should navigate backwards to slide 1
      cy.findByTestId("ChevronLeftIcon").parent().click();
      cy.wrap(waitForSettle(0)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "1",
        );
      });
      // should disable the previous page navigation
      cy.findByTestId("ChevronLeftIcon")
        .parent()
        .should("have.attr", "aria-disabled", "true");
    });
  });

  describe("WITH the pagination controls", () => {
    let emblaApiRef: MutableRefObject<CarouselApi | undefined>;
    const TestComponent = () => {
      emblaApiRef = useRef<CarouselApi | undefined>(undefined);
      return (
        <Default
          emblaOptions={{ duration: 1, startIndex: 3 }}
          emblaPlugins={[ClassNames()]}
          emblaApiRef={emblaApiRef}
        />
      );
    };

    beforeEach(() => {
      cy.mount(<TestComponent />);
      cy.findByRole("region").should("exist");
      // Wait for emblaApi to be set
      cy.wrap(
        new Cypress.Promise((resolve) => {
          const checkEmblaApi = () => {
            if (emblaApiRef?.current) {
              resolve();
            } else {
              setTimeout(checkEmblaApi, 50);
            }
          };
          checkEmblaApi();
        }),
      );
    });

    it("should navigate to each page", () => {
      const waitForSettle = (expectedSlideIndex: number) => {
        return new Cypress.Promise((resolve) => {
          const handleSettle = () => {
            const currentSlideIndex =
              emblaApiRef?.current?.selectedScrollSnap();
            if (currentSlideIndex === expectedSlideIndex) {
              resolve();
              emblaApiRef?.current?.off("settle", handleSettle);
            }
          };
          emblaApiRef?.current?.on("settle", handleSettle);
        });
      };

      // should start from slide 4
      cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
        "have.text",
        "4",
      );
      // should navigate to slide 3
      cy.findByLabelText(/Move to slide 3 of 4/).click();
      cy.wrap(waitForSettle(2)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "3",
        );
      });
      // should navigate to slide 2
      cy.findByLabelText(/Move to slide 2 of 4/).click();
      cy.wrap(waitForSettle(1)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "2",
        );
      });
      // should navigate to slide 1
      cy.findByLabelText(/Move to slide 1 of 4/).click();
      cy.wrap(waitForSettle(0)).then(() => {
        cy.get(".carouselSlide.is-snapped .carouselNumber h1").should(
          "have.text",
          "1",
        );
      });
    });
  });
});
