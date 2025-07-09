import { FlexLayout, StackLayout } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer } from "docs/components";
import { renderSlides } from "./renderSlides";

export default {
  title: "Patterns/Carousel/QA",
  component: Carousel,
} as Meta<typeof Carousel>;

export const AllExamples: StoryFn = (props: { className?: string }) => {
  return (
    <QAContainer cols={2} transposeDensity vertical>
      <Carousel style={{ width: "600px" }}>
        <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
          <StackLayout direction={"row"} gap={1}>
            <CarouselPreviousButton />
            <CarouselNextButton />
            <CarouselProgressLabel />
          </StackLayout>
          <CarouselTabList />
        </FlexLayout>
        <CarouselSlides>{renderSlides()}</CarouselSlides>
      </Carousel>
    </QAContainer>
  );
};

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
