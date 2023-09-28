import {
  GoToInput,
  Pagination,
  PaginationProps,
  Paginator,
  PaginatorProps,
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Pagination",
  component: Paginator,
} as Meta;

interface StoryProps {
  goToPosition: "left" | "right" | "none";
}

const Template: StoryFn<PaginationProps & PaginatorProps & StoryProps> = (
  args
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

export const Default = Template.bind({});

Default.args = {
  compact: false,
  count: 25,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
  goToPosition: "left",
};

Default.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};
