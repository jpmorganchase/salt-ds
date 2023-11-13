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
    withInput,
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
      withInput={withInput}
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
      className="saltMetricQA"
      imgSrc={props.imgSrc}
    >
      <Template
        compact={false}
        count={5}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
      />
      <Template
        compact={false}
        count={25}
        siblingCount={2}
        boundaryCount={1}
        showPreviousNext={true}
        goToPosition="left"
      />
      <Template
        compact={true}
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
