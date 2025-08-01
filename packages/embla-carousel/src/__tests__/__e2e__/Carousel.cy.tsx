import * as carouselStories from "@stories/carousel.stories";
import { composeStories } from "@storybook/react-vite";
import ClassNames from "embla-carousel-class-names";
import { useEffect, useState } from "react";
import type { CarouselEmblaApiType } from "../../index";

const composedStories = composeStories(carouselStories);
const { Default, SlideGroup } = composedStories;

describe("Given a Carousel", () => {
  let emblaTestApi: CarouselEmblaApiType | null | undefined;

  const mountCarousel = (
    options = {},
    startIndex = 0,
  ): Cypress.Chainable<CarouselEmblaApiType> => {
    const TestComponent = () => {
      const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(
        null,
      );

      useEffect(() => {
        emblaTestApi = emblaApi;
      }, [emblaApi]);

      return (
        <Default
          emblaOptions={{ duration: 1, startIndex, ...options }}
          emblaPlugins={[ClassNames()]}
          getEmblaApi={setEmblaApi}
        />
      );
    };

    cy.mount(<TestComponent />);
    cy.findByRole("region").should("exist");

    return cy.wrap(
      new Cypress.Promise<CarouselEmblaApiType>((resolve) => {
        const checkEmblaApi = () => {
          if (emblaTestApi) {
            resolve(emblaTestApi);
          } else {
            setTimeout(checkEmblaApi, 1000);
          }
        };
        checkEmblaApi();
      }),
    );
  };

  const waitForSettle = (
    emblaApi: CarouselEmblaApiType,
    expectedSlideIndex: number,
  ) => {
    return new Cypress.Promise((resolve) => {
      const handleSettle = () => {
        if (emblaApi?.selectedScrollSnap() === expectedSlideIndex) {
          resolve();
          emblaApi.off("settle", handleSettle);
        }
      };
      emblaApi?.on("settle", handleSettle);
    });
  };

  const verifySlide = (expectedText: string) => {
    // Verify the slide updates
    cy.get(
      ".carouselSlide.is-snapped .carouselNumber .saltText-display1",
    ).should("have.text", expectedText);
  };

  it("should render the carousel with four slides as a tabbed list", () => {
    cy.mount(<Default />);
    cy.findByRole("region").should("exist");
    cy.get('[aria-label="Numbered carousel example"]').should("exist");
    cy.get('[aria-live="polite"]').should("exist");
    cy.get('[role="group"]').should("not.exist");
    cy.get('[role="tabpanel"]')
      .should("have.length", 4)
      .each(($el) => {
        cy.wrap($el).should("have.attr", "aria-roledescription", "slide");
      });
  });

  it("should render the carousel with four slides as a slide group", () => {
    cy.mount(<SlideGroup ariaVariant="group" />);
    cy.findByRole("region").should("exist");
    cy.get('[aria-label="Carousel cards example"]').should("exist");
    cy.get('[aria-live="polite"]').should("exist");
    cy.get('[role="group"]').should("exist");
    cy.get('[role="tabpanel"]').should("have.length", 0);
  });

  it("can disable slide announcements", () => {
    cy.mount(<Default disableSlideAnnouncements={true} />);
    cy.get('[aria-live="off"]').should("exist");
  });

  describe("WITH the current slide as slide 1", () => {
    let emblaApi: CarouselEmblaApiType;

    beforeEach(() => {
      emblaTestApi = null;
      mountCarousel().then((api) => {
        emblaApi = api;
      });
    });

    it("should navigate forwards to last slide", () => {
      verifySlide("1");

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2"));

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3"));

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4"));

      cy.findByLabelText(/Next slide/).should(
        "have.class",
        "saltButton-disabled",
      );
    });
  });

  describe("WITH the current slide as slide 4", () => {
    let emblaApi: CarouselEmblaApiType;

    beforeEach(() => {
      emblaTestApi = null;
      mountCarousel({}, 3).then((api) => {
        emblaApi = api;
      });
    });

    it("should navigate back to first slide", () => {
      verifySlide("4");

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3"));

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2"));

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1"));

      cy.findByLabelText(/Previous slide/).should(
        "have.class",
        "saltButton-disabled",
      );
    });
  });

  describe("WITH the tablist", () => {
    let emblaApi: CarouselEmblaApiType;

    beforeEach(() => {
      emblaTestApi = null;
      mountCarousel({}, 3).then((api) => {
        emblaApi = api;
      });
    });

    it("should display the tablist", () => {
      cy.findAllByRole("tab").should("have.length", 4);
    });

    it("should navigate to each slide in the tablist", () => {
      verifySlide("4");

      cy.findAllByRole("tab").eq(1).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2"));

      cy.findAllByRole("tab").eq(2).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3"));

      cy.findAllByRole("tab").eq(3).click();
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4"));

      cy.findAllByRole("tab").eq(0).click();
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1"));
    });
  });
});
