import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselNavigationBar,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import { H2, H3, StackLayout, Text } from "@salt-ds/core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const content = [
  {
    slideId: 0,
    title: "Your accounts. On the move",
    content: "Discover our latest personal accounts app for iOS.",
    link: "Open an account",
  },
  {
    slideId: 1,
    title: "Preview your account information",
    content:
      "The new dashboard provides a complete overview of all your key account details.",
    link: "Go to dashboard",
  },
  {
    slideId: 2,
    title: "Clear view of your cash positions",
    content:
      "Dedicated screen showing your positions, currencies and accounts.",
    link: "Learn more about views",
  },
  {
    slideId: 3,
    title: "Redesigned accounts",
    content:
      "Simplified view of all your accounts, with search functionality across all transactions.",
    link: "Download app",
  },
];
function SliderContent(props: {
  index: number;
  slide: { title: string; content: string };
}) {
  const {
    slide: { title, content },
    index,
  } = props;
  return (
    <StackLayout gap={1}>
      <H3 id={`slide-title-${index}`}>{title}</H3>
      <Text>{content}</Text>
    </StackLayout>
  );
}

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselNavigationBar />
        <CarouselSlider>
          {content.map((slide, index) => (
            <CarouselSlide
              key={slide.title}
              aria-labelledby={`slide-title-${slide.slideId}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} slide={slide} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};
export const Default = CarouselExample.bind({});
Default.args = {
  "aria-label": "Account overview",
  id: "carousel-example",
};

export const Bordered: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-label="Account overview">
        <CarouselNavigationBar />
        <CarouselSlider>
          {content.map((slide, index) => (
            <CarouselSlide
              appearance="bordered"
              key={slide.title}
              aria-labelledby={`slide-title-${slide.slideId}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} slide={slide} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithMultipleSlides = CarouselExample.bind({});
WithMultipleSlides.args = {
  visibleSlides: { sm: 1, md: 2 },
  "aria-label": "Account overview",
  id: "carousel-example",
};

export const WithActions: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel
        {...args}
        visibleSlides={{ sm: 1, md: 2 }}
        aria-label="Account overview"
      >
        <CarouselNavigationBar />
        <CarouselSlider>
          {content.map((slide, index) => (
            <CarouselSlide
              appearance="bordered"
              key={slide.title}
              aria-labelledby={`slide-title-${slide.slideId}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} slide={slide} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithTitleInNavigationBar: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-labelledby="carousel-title">
        <CarouselNavigationBar
          title={<H2 id="carousel-title">Categorical Backgrounds</H2>}
        />
        <CarouselSlider>
          {content.map((slide, index) => (
            <CarouselSlide
              appearance="bordered"
              key={slide.title}
              aria-labelledby={`slide-title-${slide.slideId}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} slide={slide} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};
