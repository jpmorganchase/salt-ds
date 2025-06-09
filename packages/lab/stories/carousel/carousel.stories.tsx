import type { Meta, StoryFn } from "@storybook/react-vite";

import {
  Carousel,
  CarouselControls,
  CarouselPagination,
  CarouselSlides,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H1,
  H2,
  Link,
} from "@salt-ds/core";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { type FocusEventHandler, useRef, useState } from "react";
import { renderSlides } from "./renderSlides";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselCardExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <Carousel aria-label="Account overview" className="carousel" {...args}>
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 className="carouselHeading">Title</H2>
        <CarouselControls />
      </FlexLayout>
      <CarouselSlides>{renderSlides({ withActions: true })}</CarouselSlides>
      <FlexLayout justify={"center"} direction={"row"}>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};

const CarouselNumberExample: StoryFn<typeof Carousel> = (args) => {
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel aria-label="carousel example" className={"carousel"} {...args}>
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 className="carouselHeading">Title</H2>
        <CarouselControls />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            role="slide"
            aria-roledescription="slide"
            className="carouselSlide"
            key={index}
          >
            <div className="carouselNumber">
              <H1>{index + 1}</H1>
            </div>
          </div>
        ))}
      </CarouselSlides>
      <FlexLayout justify={"center"} direction={"row"}>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};

export const Default = CarouselNumberExample.bind({});

export const Card = CarouselCardExample.bind({});

export const Loop = CarouselNumberExample.bind({});
Loop.args = {
  emblaOptions: { loop: true },
};

export const MultiSlide = CarouselNumberExample.bind({});
MultiSlide.args = {
  className: "carouselMultipleSlide",
  emblaOptions: { align: "center" },
};

export const AutoPlay: StoryFn<typeof Carousel> = (args) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const autoplay = useRef(Autoplay({ delay: 500 }));
  const slides = Array.from(Array(4).keys());

  const handleBlur: FocusEventHandler = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget) && isPlaying) {
      autoplay.current.play();
    }
  };

  return (
    <Carousel
      aria-label="Account overview"
      className={"carousel"}
      emblaOptions={{ loop: true }}
      emblaPlugins={[autoplay.current]}
      {...args}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 className="carouselHeading">Title</H2>
        {isPlaying ? (
          <Button
            aria-label="pause autoplay"
            appearance="bordered"
            sentiment="neutral"
            onClick={() => {
              setIsPlaying(false);
              autoplay.current.stop();
            }}
            tabIndex={0}
          >
            Pause play
            <PauseIcon aria-hidden />
          </Button>
        ) : (
          <Button
            aria-label="resume autoplay"
            appearance="bordered"
            sentiment="neutral"
            onClick={() => {
              setIsPlaying(true);
              autoplay.current.play();
            }}
            tabIndex={0}
          >
            Resume play
            <PlayIcon aria-hidden />
          </Button>
        )}
      </FlexLayout>
      <CarouselSlides
        onMouseEnter={() => {
          autoplay.current.stop();
        }}
        onMouseLeave={() => {
          if (isPlaying) {
            autoplay.current.play();
          }
        }}
        onFocus={() => autoplay.current.stop()}
        onBlur={handleBlur}
      >
        {slides.map((index) => (
          <div
            role="slide"
            aria-roledescription="slide"
            className="carouselSlide"
            key={index}
          >
            <FlexLayout
              className="carouselNumber"
              justify={"center"}
              direction={"row"}
              gap={3}
            >
              <H1>{index + 1}</H1>
              <FormField style={{ width: "auto" }}>
                <FormFieldLabel>Focusable element</FormFieldLabel>
                <Link aria-label={"demo action"} tabIndex={0} href="#">
                  Link
                </Link>
              </FormField>
            </FlexLayout>
          </div>
        ))}
      </CarouselSlides>
      <FlexLayout justify={"center"} direction={"row"}>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};

export const FadePlugin = CarouselCardExample.bind({});
FadePlugin.args = {
  emblaOptions: { duration: 30 },
  emblaPlugins: [Fade()],
};
