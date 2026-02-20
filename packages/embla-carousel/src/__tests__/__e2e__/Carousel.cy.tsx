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

  const verifySlide = (expectedText: string, isFocused: boolean) => {
    // Verify the slide updates
    cy.get(
      ".carouselSlide.is-snapped .carouselNumber .saltText-display1",
    ).should("have.text", expectedText);
    cy.get(".carouselSlide.is-snapped.is-in-view").should(
      "have.attr",
      "tabindex",
      "0",
    );
    cy.wait(250); // Wait for focus to be set
    if (isFocused) {
      cy.get(".carouselSlide.is-snapped.is-in-view").should("be.focused");
    } else {
      cy.get(".carouselSlide.is-snapped.is-in-view").should("not.be.focused");
    }
  };

  it("should render the carousel with four slides as a tabbed list", () => {
    cy.mount(<Default />);
    cy.findByRole("region").should("exist");
    cy.findByLabelText(/Numbered tab example/).should("exist");
    cy.findByRole("group").should("not.exist");
    cy.findByRole("tabpanel")
      .should("have.length", 1)
      .each(($el) => {
        cy.wrap($el).should("have.attr", "aria-roledescription", "slide");
      });
  });

  it("should render the carousel with four slides as a slide group", () => {
    cy.mount(<SlideGroup ariaVariant="group" />);
    cy.findByRole("region").should("exist");
    cy.findByLabelText(/Carousel group example/).should("exist");
    cy.findByRole("group").should("exist");
    cy.findByRole("tabpanel").should("have.length", 0);
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
      verifySlide("1", false);

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", false));

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3", false));

      cy.findByLabelText(/Next slide/).click();
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4", false));

      cy.findByLabelText(/Next slide/).should(
        "have.class",
        "saltButton-disabled",
      );
    });

    it("should navigate slides using left/right arrow keys(including long press)", () => {
      // Focus the slide element
      cy.get(".carouselSlide.is-snapped.is-in-view").focus();

      verifySlide("1", true);

      cy.realPress("ArrowRight");
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", true));

      cy.realPress("ArrowRight");
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3", true));

      cy.realPress("ArrowRight");
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4", true));

      // Should not go beyond slide 4
      cy.realPress("ArrowRight");
      verifySlide("4", true);

      cy.realPress("ArrowLeft");
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3", true));

      cy.realPress("ArrowLeft");
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", true));
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", true));

      cy.realPress("ArrowLeft");
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1", true));

      // Should not go beyond slide 1
      cy.realPress("ArrowLeft");
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1", true));
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
      cy.findAllByRole("tab").eq(3).focus();
      verifySlide("4", false);

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3", false));

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", false));

      cy.findByLabelText(/Previous slide/).click();
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1", false));

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
      cy.findAllByRole("tab").eq(3).focus();
      verifySlide("4", false);

      cy.findAllByRole("tab").eq(1).click();
      cy.wrap(waitForSettle(emblaApi, 1)).then(() => verifySlide("2", false));
      cy.findAllByRole("tab").eq(1).should("have.focus");

      cy.findAllByRole("tab").eq(2).click();
      cy.wrap(waitForSettle(emblaApi, 2)).then(() => verifySlide("3", false));
      cy.findAllByRole("tab").eq(2).should("have.focus");

      cy.findAllByRole("tab").eq(3).click();
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4", false));
      cy.findAllByRole("tab").eq(3).should("have.focus");

      cy.findAllByRole("tab").eq(0).click();
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1", false));
      cy.findAllByRole("tab").eq(0).should("have.focus");
    });

    it("should jump to first tab on Home key and last tab on End key", () => {
      // Start by focusing the second tab
      cy.findAllByRole("tab").eq(2).focus();

      cy.realPress("Home");
      cy.wrap(waitForSettle(emblaApi, 0)).then(() => verifySlide("1", false));
      cy.findAllByRole("tab").eq(0).should("have.focus");

      cy.realPress("End");
      cy.wrap(waitForSettle(emblaApi, 3)).then(() => verifySlide("4", false));
      cy.findAllByRole("tab").eq(3).should("have.focus");
    });
  });
});
