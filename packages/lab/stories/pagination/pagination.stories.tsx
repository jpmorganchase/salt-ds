import { Meta, StoryFn } from "@storybook/react";
import {
  GoToInput,
  CompactInput,
  CompactPaginator,
  Pagination,
  PaginationProps,
  Paginator,
  PaginatorProps,
} from "@salt-ds/lab";
import { FlexLayout } from "@salt-ds/core";

export default {
  title: "Lab/Pagination",
  component: Paginator,
} as Meta;

interface StoryProps {
  compact?: boolean;
  compactWithInput?: boolean;
  goTo?: boolean;
  inputVariant?: "primary" | "secondary";
}

const Template: StoryFn<PaginationProps & PaginatorProps & StoryProps> = (
  args
) => {
  const {
    count,
    boundaryCount,
    siblingCount,
    goTo,
    compact,
    compactWithInput,
    inputVariant,
  } = args;

  return (
    <Pagination count={count}>
      <FlexLayout gap={1}>
        {goTo && <GoToInput inputVariant={inputVariant} />}
        {compact || compactWithInput ? (
          <CompactPaginator>
            {compactWithInput && <CompactInput variant={inputVariant} />}
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

export const Default = Template.bind({});

Default.args = {
  count: 5,
};

export const WithTruncation = Template.bind({});

WithTruncation.args = {
  count: 25,
};

export const WithInput = Template.bind({});

WithInput.args = {
  count: 25,
  goTo: true,
};

WithInput.argTypes = {
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};

export const Compact = Template.bind({});

Compact.args = {
  compact: true,
  count: 25,
};

export const CompactWithInput = Template.bind({});

CompactWithInput.args = {
  compactWithInput: true,
  count: 25,
};

CompactWithInput.argTypes = {
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};

export const CompactWithGoTo = Template.bind({});

CompactWithGoTo.args = {
  compact: true,
  count: 25,
  goTo: true,
};

CompactWithGoTo.argTypes = {
  inputVariant: {
    options: ["primary", "secondary"],
    control: { type: "radio" },
  },
};
