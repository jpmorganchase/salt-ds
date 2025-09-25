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
import { Display1, FlexLayout, H2, H3, Text, useId } from "@salt-ds/core";
import type { CarouselProps } from "@salt-ds/embla-carousel";
import Fade from "embla-carousel-fade";
import { sliderData } from "./exampleData";
import { renderSlides } from "./renderSlides";

export default {
  title: "Patterns/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselCardExample: StoryFn<CarouselProps & { ariaVariant: string }> = ({
  ariaVariant = "tabpanel",
  ...args
}) => {
  const carouselId = useId();
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className="carousel"
      {...args}
    >
      <H2 id={`${carouselId}-title`} className="carouselHeading">
        Carousel card example
      </H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton tabIndex={-1} />
          {ariaVariant === "tabpanel" ? <CarouselTabList /> : null}
          <CarouselNextButton tabIndex={-1} />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {renderSlides({
            withActions: true,
          })}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};

const CarouselNumberExample: StoryFn<CarouselProps> = (args) => {
  const cards = Array.from(Array(4).keys());
  const carouselId = useId();
  return (
    <Carousel aria-label="Numbered tab example" className="carousel" {...args}>
      <FlexLayout gap={1} wrap={true} align={"center"}>
        <CarouselPreviousButton tabIndex={-1} />
        <CarouselTabList />
        <CarouselNextButton tabIndex={-1} />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {cards.map((index) => {
          const tabId = `${carouselId}-tab${index}`;
          return (
            <div
              role="tabpanel"
              aria-roledescription="slide"
              aria-labelledby={`${tabId}-title`}
              className="carouselSlide"
              key={tabId}
            >
              <div className="carouselNumber">
                <Display1
                  id={`${tabId}-title`}
                  className="carouselHeading"
                  aria-label={"Placeholder tab"}
                >
                  {index + 1}
                </Display1>
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

export const SlideGroup = CarouselCardExample.bind({});
SlideGroup.args = {
  ariaVariant: "group",
  "aria-label": "Carousel group example",
};

export const Loop = CarouselNumberExample.bind({});
Loop.args = {
  emblaOptions: { loop: true },
};

export const MultiSlide: StoryFn<typeof Carousel> = (args) => {
  const carouselId = useId();
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className="carouselMultipleSlide"
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
      {...args}
    >
      <H2 id={`${carouselId}-title`} className="carouselHeading">
        Multiple slides carousel example
      </H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton aria-label="Previous slide group" />
          <CarouselNextButton aria-label="Next slide group" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {sliderData.map((slide, index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <CarouselCard
                className="carouselSlide"
                key={slideId}
                aria-labelledby={`${slideId}-title`}
                appearance="transparent"
                media={
                  <img
                    aria-hidden={true}
                    className="carouselImagePlaceholder"
                    src={slide.image}
                  />
                }
                header={<H3 id={`${slideId}-title`}>{slide.title}</H3>}
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
