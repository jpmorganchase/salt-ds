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
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

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

export const AllExamplesGrid: StoryFn<QAContainerProps> = () => {
  return (
    <QAContainer
      cols={4}
      vertical
      transposeDensity
      height={1400}
      width={2700}
      className="saltMetricQA"
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

AllExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
