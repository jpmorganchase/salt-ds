import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Breadcrumbs Next/Edge Cases",
  component: BreadcrumbsNext,
  args: {
    "aria-label": "Breadcrumb",
  },
} as Meta<typeof BreadcrumbsNext>;

const inlineExpansionProps = {
  collapseMode: "expand" as const,
  maxItems: 3,
};

export const NonFocusableBeforeInlineExpansion: StoryFn<
  typeof BreadcrumbsNext
> = (props) => (
  <BreadcrumbsNext {...props} {...inlineExpansionProps}>
    <BreadcrumbNext label="Root Level Entity" />
    <BreadcrumbNext href="#" label="Level 2 Entity" />
    <BreadcrumbNext href="#" label="Level 3 Entity" />
    <BreadcrumbNext href="#" label="Level 4 Entity" />
    <BreadcrumbNext label="Current Level Entity" />
  </BreadcrumbsNext>
);

NonFocusableBeforeInlineExpansion.storyName =
  "Non-focusable breadcrumb before inline expansion";

export const NoFocusableItems: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} {...inlineExpansionProps}>
    <BreadcrumbNext label="Root Level Entity" />
    <BreadcrumbNext label="Level 2 Entity" />
    <BreadcrumbNext label="Level 3 Entity" />
    <BreadcrumbNext label="Level 4 Entity" />
    <BreadcrumbNext label="Current Level Entity" />
  </BreadcrumbsNext>
);

NoFocusableItems.storyName = "No focusable breadcrumb items";

export const NonFocusableFirstItemWithLinksAfterExpansion: StoryFn<
  typeof BreadcrumbsNext
> = (props) => (
  <BreadcrumbsNext {...props} {...inlineExpansionProps} itemsAfterCollapse={2}>
    <BreadcrumbNext label="Root Level Entity" />
    <BreadcrumbNext href="#" label="Level 2 Entity" />
    <BreadcrumbNext href="#" label="Level 3 Entity" />
    <BreadcrumbNext href="#" label="Level 4 Entity" />
    <BreadcrumbNext label="Current Level Entity" />
  </BreadcrumbsNext>
);

NonFocusableFirstItemWithLinksAfterExpansion.storyName =
  "Non-focusable first item with links after inline expansion";
