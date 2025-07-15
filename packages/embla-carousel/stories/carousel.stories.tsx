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
  StackLayout,
  Text,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import type { CarouselProps } from "@salt-ds/embla-carousel";
import { sliderData } from "@salt-ds/site/src/examples/carousel/exampleData";
import Classnames from "embla-carousel-class-names";
import Fade from "embla-carousel-fade";
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
      <Text styleAs={"h2"}>Title</Text>
      <CarouselSlides>{renderSlides({ withActions: true })}</CarouselSlides>
      <StackLayout direction={"row"} gap={1}>
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
    </Carousel>
  );
};

const CarouselNumberExample: StoryFn<CarouselProps> = (args) => {
  const slideId = useId();
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-label="default carousel example"
      className="carousel"
      {...args}
    >
      <FlexLayout justify={"start"} direction={"row"} gap={1}>
        <CarouselPreviousButton />
        <CarouselNextButton />
        <CarouselProgressLabel />
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
              <Text styleAs={"display1"} className="carouselHeading">
                {index + 1}
              </Text>
            </div>
          </div>
        ))}
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
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  return (
    <Carousel
      aria-label="Multiple slides carousel example"
      className={"carouselMultipleSlide"}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
      {...args}
    >
      <Text styleAs={"h2"}>Title</Text>
      <CarouselSlides>
        {sliderData.map((slide, index) => {
          return (
            <CarouselCard
              className="carouselSlide"
              key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              aria-label={slide.title}
              appearance={"bordered"}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className="carouselImagePlaceholder"
                  src={slide.image}
                />
              }
              header={<Text styleAs={"h3"}>{slide.title}</Text>}
            >
              <Text>{slide.content}</Text>
            </CarouselCard>
          );
        })}
      </CarouselSlides>
      <StackLayout direction={"row"} gap={1}>
        <CarouselPreviousButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        <CarouselNextButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        <CarouselProgressLabel />
      </StackLayout>
    </Carousel>
  );
};

export const FadePlugin = CarouselCardExample.bind({});
FadePlugin.args = {
  emblaOptions: { duration: 30 },
  emblaPlugins: [Fade()],
};
