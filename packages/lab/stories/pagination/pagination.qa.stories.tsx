import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import {
  GoToInput,
  Pagination,
  Paginator,
  PaginationProps,
  PaginatorProps,
} from "@salt-ds/lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Pagination/QA",
  component: Pagination,
} as Meta<typeof Pagination>;

const Template = (
  args: PaginationProps &
    PaginatorProps & {
      goToPosition?: string;
    }
) => {
  const {
    count,
    boundaryCount,
    siblingCount,
    showPreviousNext,
    compact,
    goToPosition,
  } = args;
  const [page, setPage] = useState<number>(1);
  const onPageChange = (page: number) => {
    setPage(page);
  };

  return (
    <Pagination
      page={page}
      onPageChange={onPageChange}
      count={count}
      compact={compact}
    >
      {goToPosition === "left" ? <GoToInput label={"Go to"} /> : null}
      <Paginator
        boundaryCount={boundaryCount}
        siblingCount={siblingCount}
        showPreviousNext={showPreviousNext}
      />
      {goToPosition === "right" ? <GoToInput label={"Go to"} /> : null}
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
      width={2500}
      className="saltMetricQA"
      imgSrc={props.imgSrc}
    >
      <Template
        count={5}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
      />
      <Template
        count={25}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
        goToPosition="left"
      />
      <Template
        compact="default"
        count={25}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
      />
      <Template
        compact="goto"
        count={25}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
      />
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
