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
  Avatar,
  Display1,
  FlexLayout,
  H2,
  H3,
  StackLayout,
  Text,
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
      <StackLayout gap={1} direction="column-reverse">
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
      </StackLayout>
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
      emblaOptions={{ align: "center", slidesToScroll: 2 }}
      {...args}
    >
      <H2 id={`${carouselId}-title`} className="carouselHeading">
        Multiple slides carousel example
      </H2>
      <StackLayout gap={1} direction="column-reverse">
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
      </StackLayout>
    </Carousel>
  );
};

const avatarSlides = [
  { name: "Alex Brown", color: "accent" },
  { name: "Priya Patel", color: "category-1" },
  { name: "Chen Wei", color: "category-2" },
  { name: "Maria Silva", color: "category-3" },
  { name: "Sam Taylor", color: "category-4" },
  { name: "Emma Wilson", color: "category-5" },
  { name: "Liam O'Neill", color: "category-6" },
  { name: "Fatima Khan", color: "category-7" },
  { name: "Noah Cohen", color: "category-8" },
  { name: "Ava Bennett", color: "category-9" },
  { name: "Diego Morales", color: "category-10" },
  { name: "Zara Ahmed", color: "category-11" },
  { name: "Ethan Clark", color: "category-12" },
  { name: "Sofia Bailey", color: "category-13" },
  { name: "Oliver Hayes", color: "category-14" },
] as const;

export const CustomSlide: StoryFn<typeof Carousel> = (args) => {
  const carouselId = useId();
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className="avatarCarousel"
      emblaOptions={{ align: "start", slidesToScroll: "auto" }}
      {...args}
    >
      <H2 id={`${carouselId}-title`} className="carouselHeading">
        Carousel example with avatar as slides
      </H2>
      <StackLayout gap={1} direction="column-reverse">
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton aria-label="Previous avatar group" />
          <CarouselNextButton aria-label="Next avatar group" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {avatarSlides.map((avatar, index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <div
                aria-label={avatar.name}
                role="group"
                aria-roledescription="slide"
                className="avatarSlide"
                key={slideId}
              >
                <span className="avatarSlideIndicator" aria-hidden>
                  <Avatar name={avatar.name} color={avatar.color} size={2} />
                </span>
              </div>
            );
          })}
        </CarouselSlides>
      </StackLayout>
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

export const FixedWidthSlide: StoryFn<CarouselProps> = (args) => (
  <div className="fixedWidthCarouselContainer">
    <CarouselNumberExample
      {...args}
      className="fixedWidthCarousel"
      emblaOptions={{ align: "start", slidesToScroll: 1, containScroll: false }}
    />
  </div>
);
