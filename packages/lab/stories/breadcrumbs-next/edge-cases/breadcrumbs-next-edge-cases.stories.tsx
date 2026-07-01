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
    <BreadcrumbNext>Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 4 Entity</BreadcrumbNext>
    <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);

NonFocusableBeforeInlineExpansion.storyName =
  "Non-focusable breadcrumb before inline expansion";

export const NoFocusableItems: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} {...inlineExpansionProps}>
    <BreadcrumbNext>Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 3 Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 4 Entity</BreadcrumbNext>
    <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);

NoFocusableItems.storyName = "No focusable breadcrumb items";

export const NonFocusableFirstItemWithLinksAfterExpansion: StoryFn<
  typeof BreadcrumbsNext
> = (props) => (
  <BreadcrumbsNext {...props} {...inlineExpansionProps} itemsAfterCollapse={2}>
    <BreadcrumbNext>Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 3 Entity</BreadcrumbNext>
    <BreadcrumbNext href="#">Level 4 Entity</BreadcrumbNext>
    <BreadcrumbNext>Current Level Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);

NonFocusableFirstItemWithLinksAfterExpansion.storyName =
  "Non-focusable first item with links after inline expansion";
