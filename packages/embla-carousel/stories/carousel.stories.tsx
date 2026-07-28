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
  Display1,
  FlexLayout,
  H2,
  H3,
  Link,
  StackLayout,
  Tag,
  Text,
  useId,
} from "@salt-ds/core";
import type { CarouselProps } from "@salt-ds/embla-carousel";
import ClassNames from "embla-carousel-class-names";
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
      emblaPlugins={[ClassNames({ snapped: "carouselSlideIsSnapped" })]}
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

const customSlides = [
  { category: 1, linkHref: "#custom-slide-1" },
  { category: 2, linkHref: "#custom-slide-2" },
  { category: 3, linkHref: "#custom-slide-3" },
  { category: 4, linkHref: "#custom-slide-4" },
  { category: 5, linkHref: "#custom-slide-5" },
  { category: 6, linkHref: "#custom-slide-6" },
] as const;

export const CustomSlide: StoryFn<typeof Carousel> = (args) => {
  const carouselId = useId();
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className="customContentCarousel"
      emblaOptions={{ align: "start", slidesToScroll: "auto" }}
      emblaPlugins={[ClassNames({ snapped: "carouselSlideIsSnapped" })]}
      {...args}
    >
      <H2 id={`${carouselId}-title`} className="carouselHeading">
        Carousel example with custom content slides
      </H2>
      <StackLayout gap={1} direction="column-reverse">
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton aria-label="Previous custom content group" />
          <CarouselNextButton aria-label="Next custom content group" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {customSlides.map((slide, index) => {
            const slideId = `${carouselId}-slide${index}`;
            const slideNumber = index + 1;
            return (
              <CarouselCard
                className="customContentSlide"
                key={slideId}
                aria-labelledby={`${slideId}-title`}
                appearance="bordered"
                header={
                  <H3 id={`${slideId}-title`}>
                    Custom content slide {slideNumber}
                  </H3>
                }
                actions={
                  <FlexLayout
                    className="customContentActions"
                    justify="space-between"
                    align="center"
                    gap={1}
                  >
                    <Tag category={slide.category}>Example</Tag>
                    <Link
                      href={slide.linkHref}
                      aria-label={`Learn more about custom content slide ${slideNumber}`}
                    >
                      Learn more
                    </Link>
                  </FlexLayout>
                }
              >
                <Text>
                  Use a composed layout in a slide (e.g. text, status, actions).
                  Keep content concise and accessible.
                </Text>
              </CarouselCard>
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
  emblaPlugins: [ClassNames({ snapped: "carouselSlideIsSnapped" }), Fade()],
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
