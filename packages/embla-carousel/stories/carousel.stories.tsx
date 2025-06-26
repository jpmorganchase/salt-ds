import type { Meta, StoryFn } from "@storybook/react-vite";

import {
  Carousel,
  CarouselAnnouncement,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import "./carousel.stories.css";
import {
  AriaAnnouncerProvider,
  FlexLayout,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import type { CarouselProps } from "@salt-ds/embla-carousel";
import Classnames from "embla-carousel-class-names";
import Fade from "embla-carousel-fade";
import { renderSlides } from "./renderSlides";

export default {
  title: "Patterns/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselCardExample: StoryFn<CarouselProps> = (args) => {
  return (
    <AriaAnnouncerProvider>
      <Carousel
        aria-label="Account overview"
        className="carousel"
        emblaPlugins={[
          CarouselAnnouncement(),
          Classnames({
            snapped: "carouselSlideIsSnapped",
          }),
        ]}
        {...args}
      >
        <FlexLayout
          justify={"space-between"}
          align={"center"}
          direction={"row"}
        >
          <Text styleAs={"h2"} className="carouselHeading">
            Title
          </Text>
        </FlexLayout>
        <CarouselSlides>{renderSlides({ withActions: true })}</CarouselSlides>
        <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
          <StackLayout direction={"row"} gap={1}>
            <CarouselPreviousButton />
            <CarouselNextButton />
            <CarouselProgressLabel />
          </StackLayout>
          <CarouselTabList />
        </FlexLayout>
      </Carousel>
    </AriaAnnouncerProvider>
  );
};

const CarouselNumberExample: StoryFn<CarouselProps> = (args) => {
  const slides = Array.from(Array(4).keys());
  const slideId = useId();
  return (
    <AriaAnnouncerProvider>
      <Carousel
        aria-label="carousel example"
        className={"carousel"}
        emblaPlugins={[CarouselAnnouncement()]}
        {...args}
      >
        <FlexLayout
          justify={"space-between"}
          align={"center"}
          direction={"row"}
        >
          <Text styleAs={"h2"} className="carouselHeading">
            Title
          </Text>
        </FlexLayout>
        <CarouselSlides>
          {slides.map((index) => (
            <div
              role="tabpanel"
              aria-roledescription="slide"
              aria-label={`Example slide ${index + 1}`}
              className="carouselSlide"
              key={`${slideId}-${index}`}
              id={`${slideId}-${index}`}
            >
              <div className="carouselNumber">
                <Text styleAs={"h1"} className="carouselHeading">
                  {index + 1}
                </Text>
              </div>
            </div>
          ))}
        </CarouselSlides>
        <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
          <StackLayout direction={"row"} gap={1}>
            <CarouselPreviousButton />
            <CarouselNextButton />
            <CarouselProgressLabel />
          </StackLayout>
          <CarouselTabList />
        </FlexLayout>
      </Carousel>
    </AriaAnnouncerProvider>
  );
};

export const Default = CarouselNumberExample.bind({});

export const Card = CarouselCardExample.bind({});

export const Loop = CarouselNumberExample.bind({});
Loop.args = {
  emblaOptions: { loop: true },
};

export const MultiSlide: StoryFn<typeof Carousel> = (args) => {
  const slides = Array.from(Array(7).keys());
  const slideId = useId();
  return (
    <Carousel
      aria-label="carousel example"
      className={"carouselMultipleSlide"}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
      emblaPlugins={[CarouselAnnouncement()]}
      {...args}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <Text styleAs={"h2"} className="carouselHeading">
          Title
        </Text>
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            aria-label={`Example slide ${index + 1}`}
            aria-roledescription="slide"
            className="carouselSlide"
            id={`${slideId}-${index}`}
            key={`${slideId}-${index}`}
          >
            <div className="carouselNumber">
              <Text styleAs={"h1"} className="carouselHeading">
                {index + 1}
              </Text>
            </div>
          </div>
        ))}
      </CarouselSlides>
      <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
        <StackLayout direction={"row"} gap={1}>
          <CarouselPreviousButton />
          <CarouselNextButton />
          <CarouselProgressLabel />
        </StackLayout>
        <CarouselTabList />
      </FlexLayout>
    </Carousel>
  );
};

export const FadePlugin = CarouselCardExample.bind({});
FadePlugin.args = {
  emblaOptions: { duration: 30 },
  emblaPlugins: [Fade()],
};
