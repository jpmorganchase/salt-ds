import {
  GoToInput,
  CompactPaginator,
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
    compactWithInput,
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
      compactWithInput={compactWithInput}
    >
      {goToPosition === "left" ? <GoToInput label={"Go to"} /> : null}
      {compact ?? compactWithInput ? (
        <CompactPaginator withInput={compactWithInput} />
      ) : (
        <Paginator
          boundaryCount={boundaryCount}
          siblingCount={siblingCount}
          showPreviousNext={showPreviousNext}
        />
      )}
      {goToPosition === "right" ? <GoToInput label={"Go to"} /> : null}
    </Pagination>
  );
};

export const Default = Template.bind({});

Default.args = {
  count: 5,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
};

Default.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};

export const WithTruncation = Template.bind({});

WithTruncation.args = {
  count: 25,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
};

WithTruncation.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};

export const WithInput = Template.bind({});

WithInput.args = {
  count: 25,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
  goToPosition: "left",
};

WithInput.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};

export const Compact = Template.bind({});

Compact.args = {
  compact: true,
  count: 25,
  siblingCount: 2,
  boundaryCount: 1,
  showPreviousNext: true,
};

Compact.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};

export const CompactWithInput = Template.bind({});

CompactWithInput.args = {
  compactWithInput: true,
  count: 25,
  showPreviousNext: true,
};

CompactWithInput.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
};
