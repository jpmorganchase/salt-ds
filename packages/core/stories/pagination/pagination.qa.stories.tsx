import {
  CompactInput,
  CompactPaginator,
  FlexLayout,
  GoToInput,
  Pagination,
  type PaginationProps,
  Paginator,
  type PaginatorProps,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";
import { AllVariantsGrid } from "@stories/button/button.qa.stories";

export default {
  title: "Core/Pagination/Pagination QA",
  component: Pagination,
} as Meta;

interface StoryProps {
  goTo?: boolean;
  compact?: boolean;
  compactWithInput?: boolean;
}

const Template = (args: PaginationProps & PaginatorProps & StoryProps) => {
  const {
    count,
    boundaryCount,
    siblingCount,
    compact,
    compactWithInput,
    goTo,
  } = args;

  return (
    <Pagination count={count}>
      <FlexLayout gap={1}>
        {goTo && <GoToInput />}
        {compact || compactWithInput ? (
          <CompactPaginator>
            {compactWithInput && <CompactInput />}
          </CompactPaginator>
        ) : (
          <Paginator
            boundaryCount={boundaryCount}
            siblingCount={siblingCount}
          />
        )}
      </FlexLayout>
    </Pagination>
  );
};

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      cols={4}
      vertical
      transposeDensity
      height={1400}
      width={2700}
      className="saltMetricQA"
      imgSrc={props.imgSrc}
    >
      <Template count={5} siblingCount={2} boundaryCount={1} />
      <Template count={25} siblingCount={2} boundaryCount={1} goTo />
      <Template compact count={25} siblingCount={2} boundaryCount={1} />
      <Template
        compactWithInput
        count={25}
        siblingCount={2}
        boundaryCount={1}
      />
    </QAContainer>
  );
};

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
