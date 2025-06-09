import type { Meta, StoryFn } from "@storybook/react";

import { Carousel, CarouselControls, CarouselSlides } from "@salt-ds/lab";
import { QAContainer } from "docs/components";
import { renderSlides } from "./renderSlides";

export default {
  title: "Lab/Carousel/QA",
  component: Carousel,
} as Meta<typeof Carousel>;

export const AllExamples: StoryFn = (props: {
  className?: string;
}) => {
  return (
    <QAContainer cols={4} transposeDensity vertical className="saltMetricQA">
      <Carousel>
        <CarouselControls />
        <CarouselSlides>{renderSlides()}</CarouselSlides>
      </Carousel>
    </QAContainer>
  );
};

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
