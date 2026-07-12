import * as carouselStories from "@stories/carousel.stories";
import { composeStories } from "@storybook/react-vite";
import ClassNames from "embla-carousel-class-names";
import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselEmblaApiType,
  CarouselSlides,
} from "../../index";

const composedStories = composeStories(carouselStories);
const { Default, SlideGroup, MultiSlide } = composedStories;

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

  it("should render an explicit ID on the section and use it for child IDs", () => {
    cy.mount(<Default id="custom-carousel" />);

    cy.findByRole("region").should("have.attr", "id", "custom-carousel");
    cy.get(".saltCarouselSlides-container").should(
      "have.attr",
      "id",
      "custom-carousel-slides",
    );
  });

  it("should render a generated section ID and use it for child IDs", () => {
    cy.mount(<Default />);

    cy.findByRole("region").then(($region) => {
      const id = $region.attr("id");
      expect(id).to.not.be.empty;
      cy.get(".saltCarouselSlides-container").should(
        "have.attr",
        "id",
        `${id}-slides`,
      );
    });
  });

  it("should compose mouse callbacks with internal drag state", () => {
    const onMouseDown = cy.stub().as("onMouseDown");
    const onMouseUp = cy.stub().as("onMouseUp");

    cy.mount(
      <Carousel aria-label="Mouse event carousel">
        <CarouselSlides
          data-testid="slides"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <div>Slide</div>
        </CarouselSlides>
      </Carousel>,
    );

    cy.findByTestId("slides")
      .realMouseDown()
      .should("have.class", "saltCarouselSlides-dragging");
    cy.get("@onMouseDown").should("have.been.calledOnce");

    cy.findByTestId("slides")
      .realMouseUp()
      .should("not.have.class", "saltCarouselSlides-dragging");
    cy.get("@onMouseUp").should("have.been.calledOnce");
  });

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

  describe("Given a Carousel with odd number of slides in multi-slide mode", () => {
    let emblaTestApi: CarouselEmblaApiType | null | undefined;

    const mountMultiSlideCarousel =
      (): Cypress.Chainable<CarouselEmblaApiType> => {
        const FiveSlideCarousel = () => {
          const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(
            null,
          );

          useEffect(() => {
            emblaTestApi = emblaApi;
          }, [emblaApi]);

          return (
            <MultiSlide
              emblaOptions={{
                align: "start",
                slidesToScroll: 2,
                duration: 1,
              }}
              getEmblaApi={setEmblaApi}
            />
          );
        };

        cy.mount(<FiveSlideCarousel />);
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

    beforeEach(() => {
      emblaTestApi = null;
    });

    it("should not snap back to start when clicking Next with 5 slides and 2 per view", () => {
      mountMultiSlideCarousel().then((emblaApi) => {
        // Verify we start at snap 0
        cy.wrap(null).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.equal(0);
        });

        // Click next
        cy.findByLabelText(/Next slide/).click();

        // Wait for settle and verify we moved forward (not back to 0)
        cy.wrap(
          new Cypress.Promise((resolve) => {
            const handleSettle = () => {
              emblaApi?.off("settle", handleSettle);
              resolve();
            };
            emblaApi?.on("settle", handleSettle);
          }),
        ).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.be.greaterThan(0);
        });

        // Wait additional time to ensure it doesn't snap back
        cy.wait(500).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.be.greaterThan(0);
        });
      });
    });

    it("should move focus within the current snap without scrolling, and only scroll when crossing snap groups", () => {
      mountMultiSlideCarousel().then((emblaApi) => {
        // Focus the first slide
        cy.get(".carouselSlide").eq(0).focus();
        cy.get(".carouselSlide").eq(0).should("be.focused");
        cy.wrap(null).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.equal(0);
        });

        // ArrowRight within snap 0: focus moves to slide 2, snap unchanged.
        cy.realPress("ArrowRight");
        cy.get(".carouselSlide").eq(1).should("be.focused");
        cy.wrap(null).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.equal(0);
        });

        // ArrowRight crossing snap boundary: focus moves to slide 3 and the
        // carousel scrolls to snap 1.
        cy.realPress("ArrowRight");
        cy.wrap(waitForSettle(emblaApi, 1)).then(() => {
          cy.get(".carouselSlide").eq(2).should("be.focused");
          expect(emblaApi?.selectedScrollSnap()).to.equal(1);
        });

        // ArrowLeft crossing snap boundary the other way: focus moves to
        // slide 2 and the carousel scrolls back to snap 0.
        cy.realPress("ArrowLeft");
        cy.wrap(waitForSettle(emblaApi, 0)).then(() => {
          cy.get(".carouselSlide").eq(1).should("be.focused");
          expect(emblaApi?.selectedScrollSnap()).to.equal(0);
        });

        // ArrowLeft within snap 0: focus moves to slide 1, snap unchanged.
        cy.realPress("ArrowLeft");
        cy.get(".carouselSlide").eq(0).should("be.focused");
        cy.wrap(null).then(() => {
          expect(emblaApi?.selectedScrollSnap()).to.equal(0);
        });
      });
    });

    it("should expose every visible slide as an independent tab stop and exclude off-screen slides", () => {
      mountMultiSlideCarousel().then((emblaApi) => {
        // Initially visible: slides 1 and 2. The other three slides must not
        // be reachable with Tab.
        cy.get(".carouselSlide").eq(0).should("have.attr", "tabindex", "0");
        cy.get(".carouselSlide").eq(1).should("have.attr", "tabindex", "0");
        cy.get(".carouselSlide").eq(2).should("have.attr", "tabindex", "-1");
        cy.get(".carouselSlide").eq(3).should("have.attr", "tabindex", "-1");
        cy.get(".carouselSlide").eq(4).should("have.attr", "tabindex", "-1");

        // Tab from the first visible slide should land on the second visible
        // slide, proving each visible slide is an independent tab stop
        // rather than a single roving tabindex entry.
        cy.get(".carouselSlide").eq(0).focus();
        cy.realPress("Tab");
        cy.get(".carouselSlide").eq(1).should("be.focused");

        // After scrolling to the next snap, the tab-stop set must shift to
        // the newly visible slides.
        cy.findByLabelText(/Next slide group/).click();
        cy.wrap(waitForSettle(emblaApi, 1)).then(() => {
          cy.get(".carouselSlide").eq(0).should("have.attr", "tabindex", "-1");
          cy.get(".carouselSlide").eq(1).should("have.attr", "tabindex", "-1");
          cy.get(".carouselSlide").eq(2).should("have.attr", "tabindex", "0");
          cy.get(".carouselSlide").eq(3).should("have.attr", "tabindex", "0");
          cy.get(".carouselSlide").eq(4).should("have.attr", "tabindex", "-1");
        });
      });
    });
  });
});
