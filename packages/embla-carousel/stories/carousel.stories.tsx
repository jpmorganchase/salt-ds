import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { Meta, StoryFn } from "@storybook/react-vite";
import "./carousel.stories.css";
import {
  FlexLayout,
  H2,
  StackLayout,
  Text,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import type { CarouselProps } from "@salt-ds/embla-carousel";
import Fade from "embla-carousel-fade";
import { sliderData } from "./exampleData";
import { renderSlides } from "./renderSlides";

export default {
  title: "Patterns/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselCardExample: StoryFn<CarouselProps> = (args) => {
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  return (
    <Carousel
      aria-label="Carousel cards example"
      className="carousel"
      {...args}
    >
      <H2 className="carouselHeading">Title</H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <StackLayout direction="row" gap={1}>
          <CarouselPreviousButton
            tabIndex={!isMobile ? -1 : 0}
            appearance={!isMobile ? "transparent" : "bordered"}
          />
          {!isMobile ? <CarouselTabList /> : null}
          <CarouselNextButton
            tabIndex={!isMobile ? -1 : 0}
            appearance={!isMobile ? "transparent" : "bordered"}
          />
          <CarouselProgressLabel />
        </StackLayout>
        <CarouselSlides>{renderSlides({ withActions: true })}</CarouselSlides>
      </div>
    </Carousel>
  );
};

const CarouselNumberExample: StoryFn<CarouselProps> = (args) => {
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  const slides = Array.from(Array(4).keys());
  const slideId = useId();
  return (
    <Carousel
      aria-label="default carousel example"
      className="carousel"
      {...args}
    >
      <FlexLayout justify="start" direction="row" gap={1}>
        <CarouselPreviousButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        {!isMobile ? <CarouselTabList /> : null}
        <CarouselNextButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => {
          return (
            <div
              role="tabpanel"
              aria-label={`Example slide ${index + 1}`}
              className="carouselSlide"
              key={`slide-${slideId}-${index}`}
            >
              <div className="carouselNumber">
                <Text styleAs="display1" className="carouselHeading">
                  {index + 1}
                </Text>
              </div>
            </div>
          );
        })}
      </CarouselSlides>
    </Carousel>
  );
};

export const Default = CarouselNumberExample.bind({});

export const Card = CarouselCardExample.bind({});

export const Loop = CarouselNumberExample.bind({});
Loop.args = {
  emblaOptions: { loop: true },
};

export const MultiSlide: StoryFn<typeof Carousel> = (args) => {
  const slideId = useId();
  return (
    <Carousel
      aria-label="Multiple slides carousel example"
      className="carouselMultipleSlide"
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
      {...args}
    >
      <H2 className="carouselHeading">Title</H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <StackLayout direction="row" gap={1} align="center">
          <CarouselPreviousButton />
          <CarouselNextButton />
          <CarouselProgressLabel />
        </StackLayout>
        <CarouselSlides>
          {sliderData.map((slide, index) => {
            return (
              <CarouselCard
                className="carouselSlide"
                key={`slide-${slideId}-${index}`}
                aria-labelledby={`${slideId}-${index}`}
                appearance="bordered"
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className="carouselImagePlaceholder"
                    src={slide.image}
                  />
                }
                header={
                  <Text styleAs="h3" id={`${slideId}-${index}`}>
                    {slide.title}
                  </Text>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselCard>
            );
          })}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};

export const FadePlugin = CarouselCardExample.bind({});
FadePlugin.args = {
  emblaOptions: {
    duration: 30,
  },
  emblaPlugins: [Fade()],
};
