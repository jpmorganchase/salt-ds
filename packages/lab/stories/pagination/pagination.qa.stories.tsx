import { useState } from "react";
import { Meta, StoryFn } from "@storybook/react";

import {
  GoToInput,
  CompactPaginator,
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

interface StoryProps {
  goToPosition?: "left" | "right" | "none";
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
    goToPosition,
  } = args;
  const [page, setPage] = useState<number>(1);
  const onPageChange = (page: number) => {
    setPage(page);
  };

  return (
    <Pagination page={page} onPageChange={onPageChange} count={count}>
      {goToPosition === "left" ? <GoToInput /> : null}
      {compact ?? compactWithInput ? (
        <CompactPaginator withInput={compactWithInput} />
      ) : (
        <Paginator boundaryCount={boundaryCount} siblingCount={siblingCount} />
      )}
      {goToPosition === "right" ? <GoToInput /> : null}
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
      width={2600}
      className="saltMetricQA"
      imgSrc={props.imgSrc}
    >
      <Template count={5} siblingCount={2} boundaryCount={1} />
      <Template
        count={25}
        siblingCount={2}
        boundaryCount={1}
        goToPosition="left"
      />
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
  chromatic: { disableSnapshot: false },
};
