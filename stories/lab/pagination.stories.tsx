import {
  GoToInput,
  Pagination,
  PaginationProps,
  Paginator,
  PaginatorProps,
} from "@brandname/lab";
import { Meta, Story } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Pagination",
  component: Paginator,
} as Meta;

interface StoryProps {
  goToPosition: "left" | "right" | "none";
}

const Template: Story<PaginationProps & PaginatorProps & StoryProps> = (
  args
) => {
  const {
    count,
    variant,
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
      variant={variant}
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

export const DefaultPagination = Template.bind({});

DefaultPagination.args = {
  compact: false,
  count: 25,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
  goToPosition: "left",
};

DefaultPagination.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};
