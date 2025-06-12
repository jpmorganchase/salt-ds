import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselControls,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { QAContainer } from "docs/components";
import { renderSlides } from "./renderSlides";

export default {
  title: "Patterns/Carousel/QA",
  component: Carousel,
} as Meta<typeof Carousel>;

export const AllExamples: StoryFn = (props: {
  className?: string;
}) => {
  return (
    <QAContainer cols={2} transposeDensity vertical className="saltMetricQA">
      <Carousel style={{ width: "600px" }}>
        <CarouselControls />
        <CarouselSlides>{renderSlides()}</CarouselSlides>
      </Carousel>
    </QAContainer>
  );
};

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
