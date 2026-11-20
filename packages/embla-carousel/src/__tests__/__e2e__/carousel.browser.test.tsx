import {
  Carousel,
  CarouselAutoplayIndicator,
  CarouselCard,
  type CarouselEmblaApiType,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import { composeStories } from "@storybook/react-vite";
import ClassNames from "embla-carousel-class-names";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { mouse } from "~browser-test-utils/pointer";
import { renderWithSalt } from "~browser-test-utils/render";
import * as carouselStories from "~stories/carousel.stories";

const { Default, SlideGroup, MultiSlide } = composeStories(carouselStories);
type CarouselApi = NonNullable<CarouselEmblaApiType>;
interface CarouselApiRef {
  current: CarouselApi | null;
}

function cssLocator(selector: string, index = 0) {
  const element = document.querySelectorAll<HTMLElement>(selector)[index];
  if (!element) throw new Error(`Could not find ${selector} at index ${index}`);
  return page.elementLocator(element);
}

async function snappedSlideLocator() {
  await expect
    .poll(
      () =>
        document.querySelector(".carouselSlide.is-snapped.is-in-view") !== null,
    )
    .toBe(true);
  return cssLocator(".carouselSlide.is-snapped.is-in-view");
}

async function mountCarousel(options = {}, startIndex = 0) {
  const apiRef: CarouselApiRef = { current: null };
  function TestComponent() {
    return (
      <Default
        emblaOptions={{ duration: 1, startIndex, ...options }}
        emblaPlugins={[ClassNames()]}
        getEmblaApi={(api) => {
          if (api) apiRef.current = api;
        }}
      />
    );
  }
  await renderWithSalt(<TestComponent />);
  await expect.element(page.getByRole("region")).toBeInTheDocument();
  await expect.poll(() => apiRef.current).toBeTruthy();
  return apiRef;
}

async function mountMultiSlideCarousel() {
  const apiRef: CarouselApiRef = { current: null };
  function FiveSlideCarousel() {
    return (
      <MultiSlide
        emblaOptions={{ align: "start", slidesToScroll: 2, duration: 1 }}
        getEmblaApi={(api) => {
          if (api) apiRef.current = api;
        }}
      />
    );
  }
  await renderWithSalt(<FiveSlideCarousel />);
  await expect.element(page.getByRole("region")).toBeInTheDocument();
  await expect.poll(() => apiRef.current).toBeTruthy();
  return apiRef;
}

function getApi(apiRef: CarouselApiRef) {
  if (!apiRef.current) throw new Error("Embla API is not available");
  return apiRef.current;
}

async function waitForSnap(apiRef: CarouselApiRef, index: number) {
  await expect.poll(() => apiRef.current?.selectedScrollSnap()).toBe(index);
}

async function verifySlide(text: string, focused: boolean) {
  await expect
    .poll(
      () =>
        document.querySelector(
          ".carouselSlide.is-snapped .carouselNumber .saltText-display1",
        )?.textContent,
    )
    .toBe(text);
  const slide = await snappedSlideLocator();
  await expect.element(slide).toHaveAttribute("tabindex", "0");
  if (focused) await expect.element(slide).toHaveFocus();
  else await expect.element(slide).not.toHaveFocus();
}

describe("Given a Carousel", () => {
  it("should render the carousel with four slides as a tabbed list", async () => {
    await renderWithSalt(<Default />);
    await expect.element(page.getByRole("region")).toBeInTheDocument();
    await expect
      .element(page.getByLabelText(/Numbered tab example/))
      .toBeInTheDocument();
    await expect.element(page.getByRole("group")).not.toBeInTheDocument();
    const panels = await page.getByRole("tabpanel").elements();
    expect(panels).toHaveLength(1);
    expect(panels[0]).toHaveAttribute("aria-roledescription", "slide");
  });

  it("should render the carousel with four slides as a slide group", async () => {
    await renderWithSalt(<SlideGroup ariaVariant="group" />);
    await expect.element(page.getByRole("region")).toBeInTheDocument();
    expect(
      document.querySelector('[aria-label="Carousel group example"]'),
    ).toBeInTheDocument();
    await expect.element(page.getByRole("group")).toBeInTheDocument();
    await expect.element(page.getByRole("tabpanel")).toHaveLength(0);
  });

  it("should navigate forwards to last slide", async () => {
    const apiRef = await mountCarousel();
    await verifySlide("1", false);
    for (const [snap, text] of [
      [1, "2"],
      [2, "3"],
      [3, "4"],
    ] as const) {
      await page.getByLabelText(/Next slide/).click();
      await waitForSnap(apiRef, snap);
      await verifySlide(text, false);
    }
    await expect
      .element(page.getByLabelText(/Next slide/))
      .toHaveClass("saltButton-disabled");
  });

  it("should navigate slides using left/right arrow keys", async () => {
    const apiRef = await mountCarousel();
    (await (await snappedSlideLocator()).element()).focus();
    await verifySlide("1", true);
    for (const [key, snap, text] of [
      ["{ArrowRight}", 1, "2"],
      ["{ArrowRight}", 2, "3"],
      ["{ArrowRight}", 3, "4"],
      ["{ArrowRight}", 3, "4"],
      ["{ArrowLeft}", 2, "3"],
      ["{ArrowLeft}", 1, "2"],
      ["{ArrowLeft}", 0, "1"],
      ["{ArrowLeft}", 0, "1"],
    ] as const) {
      await userEvent.keyboard(key);
      await waitForSnap(apiRef, snap);
      await verifySlide(text, true);
    }
  });

  it("should navigate back to first slide", async () => {
    const apiRef = await mountCarousel({}, 3);
    await verifySlide("4", false);
    for (const [snap, text] of [
      [2, "3"],
      [1, "2"],
      [0, "1"],
    ] as const) {
      await page.getByLabelText(/Previous slide/).click();
      await waitForSnap(apiRef, snap);
      await verifySlide(text, false);
    }
    await expect
      .element(page.getByLabelText(/Previous slide/))
      .toHaveClass("saltButton-disabled");
  });

  it("should display the tablist", async () => {
    await mountCarousel({}, 3);
    await expect.element(page.getByRole("tab")).toHaveLength(4);
  });

  it("should navigate to each slide in the tablist", async () => {
    const apiRef = await mountCarousel({}, 3);
    for (const [tabIndex, snap, text] of [
      [1, 1, "2"],
      [2, 2, "3"],
      [3, 3, "4"],
      [0, 0, "1"],
    ] as const) {
      const tab = page.getByRole("tab").nth(tabIndex);
      await tab.click();
      await waitForSnap(apiRef, snap);
      await verifySlide(text, false);
      await expect.element(tab).toHaveFocus();
    }
  });

  it("should jump to first tab on Home key and last tab on End key", async () => {
    const apiRef = await mountCarousel({}, 3);
    (await page.getByRole("tab").nth(2).element()).focus();
    await userEvent.keyboard("{Home}");
    await waitForSnap(apiRef, 0);
    await expect.element(page.getByRole("tab").nth(0)).toHaveFocus();
    await userEvent.keyboard("{End}");
    await waitForSnap(apiRef, 3);
    await expect.element(page.getByRole("tab").nth(3)).toHaveFocus();
  });

  it("should not snap back to start when clicking Next with 5 slides and 2 per view", async () => {
    const apiRef = await mountMultiSlideCarousel();
    const api = getApi(apiRef);
    expect(api.selectedScrollSnap()).toBe(0);
    const settled = new Promise<void>((resolve) => {
      const handleSettle = () => {
        api.off("settle", handleSettle);
        resolve();
      };
      api.on("settle", handleSettle);
    });
    await page.getByLabelText(/Next slide/).click();
    await settled;
    expect(api.selectedScrollSnap()).toBeGreaterThan(0);
    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(api.selectedScrollSnap()).toBeGreaterThan(0);
  });

  it("should move focus within the current snap and scroll only across snap groups", async () => {
    const apiRef = await mountMultiSlideCarousel();
    const slides = document.querySelectorAll<HTMLElement>(".carouselSlide");
    slides[0].focus();
    expect(slides[0]).toHaveFocus();
    expect(getApi(apiRef).selectedScrollSnap()).toBe(0);
    await userEvent.keyboard("{ArrowRight}");
    expect(slides[1]).toHaveFocus();
    expect(getApi(apiRef).selectedScrollSnap()).toBe(0);
    await userEvent.keyboard("{ArrowRight}");
    await waitForSnap(apiRef, 1);
    await expect.element(page.elementLocator(slides[2])).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await waitForSnap(apiRef, 0);
    await expect.element(page.elementLocator(slides[1])).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(slides[0]).toHaveFocus();
    expect(getApi(apiRef).selectedScrollSnap()).toBe(0);
  });

  it("should not scroll when pointer focus lands on a partially visible slide", async () => {
    const apiRef = await mountMultiSlideCarousel();
    const api = getApi(apiRef);
    const pointerDown = vi.fn();
    api.on("pointerDown", pointerDown);
    const viewport = document.querySelector<HTMLElement>(".saltCarouselSlides");
    const slide = document.querySelectorAll<HTMLElement>(".carouselSlide")[2];
    const viewportRect = viewport?.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    if (!viewportRect) throw new Error("Carousel viewport missing");
    const visibleWidth = viewportRect.right - slideRect.left;
    expect(slideRect.left).toBeLessThan(viewportRect.right);
    expect(slideRect.right).toBeGreaterThan(viewportRect.right);
    expect(visibleWidth).toBeGreaterThan(0);
    await userEvent.click(slide, {
      position: {
        x: Math.floor(visibleWidth / 2),
        y: Math.floor(slideRect.height / 2),
      },
    });
    await expect.poll(() => pointerDown.mock.calls.length).toBe(1);
    expect(slide).toHaveFocus();
    // Intrinsic real-time wait: observe that native Embla animation does not
    // begin after pointer focus lands on a partially visible slide.
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(api.selectedScrollSnap()).toBe(0);
    api.off("pointerDown", pointerDown);
  });

  it("should expose visible slides as tab stops and exclude off-screen slides", async () => {
    const apiRef = await mountMultiSlideCarousel();
    const slides = document.querySelectorAll<HTMLElement>(".carouselSlide");
    for (const [index, tabIndex] of ["0", "0", "-1", "-1", "-1"].entries())
      expect(slides[index]).toHaveAttribute("tabindex", tabIndex);
    slides[0].focus();
    await userEvent.tab();
    expect(slides[1]).toHaveFocus();
    await page.getByLabelText(/Next slide group/).click();
    await waitForSnap(apiRef, 1);
    for (const [index, tabIndex] of ["-1", "-1", "0", "0", "-1"].entries())
      await expect
        .element(page.elementLocator(slides[index]))
        .toHaveAttribute("tabindex", tabIndex);
  });
});

describe("Given a Carousel with custom props", () => {
  it("should apply the id to the carousel root", async () => {
    await renderWithSalt(
      <Carousel aria-label="Test carousel" id="test-carousel">
        <CarouselNextButton />
        <CarouselSlides>
          <CarouselCard>Slide 1</CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    await expect
      .element(page.getByRole("region"))
      .toHaveAttribute("id", "test-carousel");
    expect(document.querySelectorAll("#test-carousel")).toHaveLength(1);
    await expect
      .element(page.getByLabelText("Next slide"))
      .toHaveAttribute("aria-controls", "test-carousel-slides");
    expect(document.getElementById("test-carousel-slides")).toBeInTheDocument();
  });

  it("should point aria-controls at the slides element when CarouselSlides has an id", async () => {
    await renderWithSalt(
      <Carousel aria-label="Test carousel" id="test-carousel">
        <CarouselPreviousButton />
        <CarouselNextButton />
        <CarouselSlides id="custom-slides">
          <CarouselCard>Slide 1</CarouselCard>
          <CarouselCard>Slide 2</CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    for (const label of ["Previous slide", "Next slide"]) {
      await expect
        .element(page.getByLabelText(label))
        .toHaveAttribute("aria-controls", "custom-slides");
    }
    const slidesContainer = document.getElementById("custom-slides");
    expect(slidesContainer).toBeInTheDocument();
    expect(slidesContainer).toHaveClass("saltCarouselSlides-container");
    expect(document.getElementById("test-carousel-slides")).toBeNull();
  });

  it("should apply className to the previous and next buttons", async () => {
    await renderWithSalt(
      <Carousel aria-label="Test carousel">
        <CarouselPreviousButton className="customPrevious" />
        <CarouselNextButton className="customNext" />
        <CarouselSlides>
          <CarouselCard>Slide 1</CarouselCard>
          <CarouselCard>Slide 2</CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    await expect
      .element(page.getByLabelText("Previous slide"))
      .toHaveClass("saltButton", "customPrevious");
    await expect
      .element(page.getByLabelText("Next slide"))
      .toHaveClass("saltButton", "customNext");
  });

  it("should apply styleAs to the progress label and forward its ref", async () => {
    const ref = createRef<HTMLDivElement>();
    await renderWithSalt(
      <Carousel aria-label="Test carousel">
        <CarouselProgressLabel data-testid="default-label" />
        <CarouselProgressLabel
          data-testid="custom-label"
          ref={ref}
          styleAs="h3"
        />
        <CarouselSlides>
          <CarouselCard>Slide 1</CarouselCard>
          <CarouselCard>Slide 2</CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    await expect
      .element(page.getByTestId("default-label"))
      .not.toHaveClass("saltText-h3");
    const customLabel = page.getByTestId("custom-label");
    await expect.element(customLabel).toHaveClass("saltText-h3");
    await expect.element(customLabel).toHaveTextContent("Slide 1 of 2");
    expect(ref.current).toBe(await customLabel.element());
  });

  it("should call consumer mouse handlers and keep the dragging state", async () => {
    const onMouseDown = vi.fn();
    const onMouseUp = vi.fn();
    await renderWithSalt(
      <Carousel aria-label="Test carousel">
        <CarouselSlides
          data-testid="slides"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          <CarouselCard>Slide 1</CarouselCard>
          <CarouselCard>Slide 2</CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    const slides = page.getByTestId("slides");
    const rect = (await slides.element()).getBoundingClientRect();
    const point = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    await mouse.down(point);
    expect(onMouseDown).toHaveBeenCalledTimes(1);
    await expect.element(slides).toHaveClass("saltCarouselSlides-dragging");
    await mouse.up(point);
    expect(onMouseUp).toHaveBeenCalledTimes(1);
    await expect.element(slides).not.toHaveClass("saltCarouselSlides-dragging");
  });

  it("should forward refs set on slides", async () => {
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn();
    await renderWithSalt(
      <Carousel aria-label="Test carousel">
        <CarouselSlides>
          <CarouselCard data-testid="slide-1" ref={objectRef}>
            Slide 1
          </CarouselCard>
          <CarouselCard data-testid="slide-2" ref={callbackRef}>
            Slide 2
          </CarouselCard>
        </CarouselSlides>
      </Carousel>,
    );
    const firstSlide = await page.getByTestId("slide-1").element();
    const secondSlide = await page.getByTestId("slide-2").element();
    expect(objectRef.current).toBe(firstSlide);
    expect(callbackRef).toHaveBeenLastCalledWith(secondSlide);
  });

  it("should merge style on the autoplay indicator", async () => {
    await renderWithSalt(
      <CarouselAutoplayIndicator
        data-testid="indicator"
        duration={1000}
        isPlaying={false}
        slideIndex={0}
        style={{ marginLeft: 8 }}
      />,
    );
    const indicator = (await page
      .getByTestId("indicator")
      .element()) as HTMLElement;
    expect(indicator.style.marginLeft).toBe("8px");
    expect(indicator.style.width).not.toBe("");
    expect(indicator.style.height).not.toBe("");
    expect(
      indicator.style.getPropertyValue("--carousel-svg-circumference"),
    ).not.toBe("");
  });
});
