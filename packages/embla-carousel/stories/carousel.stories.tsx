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
import { FlexLayout, H2, Text, useId } from "@salt-ds/core";
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
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton
            tabIndex={-1}
            appearance={ariaVariant === "tabpanel" ? "transparent" : "bordered"}
          />
          {ariaVariant === "tabpanel" ? <CarouselTabList /> : null}
          <CarouselNextButton
            tabIndex={-1}
            appearance={ariaVariant === "tabpanel" ? "transparent" : "bordered"}
          />
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
  const carouselId = useId();

  const slides = Array.from(Array(4).keys());

  return (
    <Carousel
      aria-label="Numbered carousel example"
      className="carousel"
      {...args}
    >
      <FlexLayout gap={1} wrap={true} align={"center"}>
        <CarouselPreviousButton tabIndex={-1} appearance="transparent" />
        <CarouselTabList />
        <CarouselNextButton tabIndex={-1} appearance="transparent" />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => {
          return (
            <div
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`Placeholder slide ${index + 1}`}
              className="carouselSlide"
              key={`slide-${carouselId}-${index}`}
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

export const SlideGroup = CarouselCardExample.bind({});
SlideGroup.args = {
  ariaVariant: "group",
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
            const id = `${carouselId}-card${index}`;
            return (
              <CarouselCard
                className="carouselSlide"
                key={`slide-${id}`}
                aria-labelledby={`title-${id}`}
                appearance="bordered"
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className="carouselImagePlaceholder"
                    src={slide.image}
                  />
                }
                header={
                  <Text id={`title-${id}`} styleAs="h3">
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
