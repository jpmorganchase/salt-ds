import {
  GoToInput,
  CompactInput,
  CompactPaginator,
  Pagination,
  PaginationProps,
  Paginator,
  PaginatorProps,
} from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Pagination",
  component: Paginator,
} as Meta;

interface StoryProps {
  goToPosition: "left" | "right" | "none";
  compact?: boolean;
  compactWithInput?: boolean;
  inputVariant?: "primary" | "secondary";
}

const Template: StoryFn<PaginationProps & PaginatorProps & StoryProps> = (
  args
) => {
  const {
    count,
    boundaryCount,
    siblingPairCount,
    compact,
    compactWithInput,
    goToPosition,
    inputVariant,
  } = args;

  return (
    <Pagination count={count}>
      {goToPosition === "left" ? (
        <GoToInput inputVariant={inputVariant} />
      ) : null}
      {compact ?? compactWithInput ? (
        <CompactPaginator>
          {compactWithInput && <CompactInput variant={inputVariant} />}
        </CompactPaginator>
      ) : (
        <Paginator
          boundaryCount={boundaryCount}
          siblingPairCount={siblingPairCount}
        />
      )}
      {goToPosition === "right" ? (
        <GoToInput inputVariant={inputVariant} />
      ) : null}
    </Pagination>
  );
};

export const Default = Template.bind({});

Default.args = {
  count: 5,
  siblingPairCount: 2,
  boundaryCount: 1,
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
  siblingPairCount: 2,
  boundaryCount: 1,
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
  siblingPairCount: 2,
  boundaryCount: 1,
  goToPosition: "left",
};

WithInput.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};

export const Compact = Template.bind({});

Compact.args = {
  compact: true,
  count: 25,
  siblingPairCount: 2,
  boundaryCount: 1,
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
};

CompactWithInput.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};

export const CompactWithGoTo = Template.bind({});

CompactWithGoTo.args = {
  compact: true,
  count: 25,
  goToPosition: "left",
};

CompactWithGoTo.argTypes = {
  goToPosition: {
    options: ["none", "left", "right"],
    control: { type: "radio" },
  },
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};
