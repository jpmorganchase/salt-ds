import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselControls,
  CarouselNavigationBar,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import { Button, H2, H3, Link, Text } from "@salt-ds/core";
import { AddIcon, RemoveIcon } from "@salt-ds/icons";
import { useState } from "react";

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

const renderSlides = (appearance?: "bordered", withActions?: boolean) =>
  content.map((slide, index) => (
    <CarouselSlide
      key={slide.title}
      appearance={appearance}
      header={<H3 id={`slide-title-${slide.slideId}`}>{slide.title}</H3>}
      aria-labelledby={`slide-title-${slide.slideId}`}
      media={
        <div
          className={`carousel-image-placeholder carousel-image-placeholder-${index + 1}`}
        />
      }
      actions={withActions && <Link href="#">{slide.link}</Link>}
    >
      <Text>{slide.content}</Text>
    </CarouselSlide>
  ));

const CarouselExample: StoryFn<typeof Carousel> = (args, navigationBarArgs) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselNavigationBar />
        <CarouselSlider>{renderSlides()}</CarouselSlider>
      </Carousel>
    </div>
  );
};
export const AddRemove: StoryFn<typeof Carousel> = (
  args,
  navigationBarArgs,
) => {
  const [slides, setSlides] = useState(content);

  function addSlides() {
    setSlides([
      ...slides,
      {
        slideId: slides.length,
        title: "Your accounts. On the move",
        content: "Discover our latest personal accounts app for iOS.",
        link: "Open an account",
      },
    ]);
  }

  function removeOne() {
    setSlides(slides.slice(0, -1));
  }
  return (
    <div className="carousel-container">
      <Button onClick={addSlides}>
        <AddIcon />
      </Button>
      <Button onClick={removeOne}>
        <RemoveIcon />
      </Button>
      <Carousel {...args}>
        <CarouselNavigationBar />
        <CarouselSlider>
          {slides.map((slide, index) => (
            <CarouselSlide
              key={slide.title}
              header={
                <H3 id={`slide-title-${slide.slideId}`}>{slide.title}</H3>
              }
              aria-labelledby={`slide-title-${slide.slideId}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${index + 1}`}
                />
              }
            >
              <Text>{slide.content}</Text>
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

export const WithSetVisibleSlide = CarouselExample.bind({});
WithSetVisibleSlide.args = {
  "aria-label": "Account overview",
  id: "carousel-example",
  firstVisibleSlideIndex: 3,
};

export const Bordered: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-label="Account overview">
        <CarouselNavigationBar />
        <CarouselSlider>{renderSlides("bordered")}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithBottomControls: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-label="Account overview">
        <CarouselSlider>{renderSlides("bordered")}</CarouselSlider>
        <CarouselControls />
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
        <CarouselSlider>{renderSlides("bordered", true)}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithTitleInNavigationBar: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-labelledby="carousel-title">
        <CarouselNavigationBar
          title={<H2 id="carousel-title">Account overview</H2>}
        />
        <CarouselSlider>{renderSlides("bordered")}</CarouselSlider>
      </Carousel>
    </div>
  );
};
