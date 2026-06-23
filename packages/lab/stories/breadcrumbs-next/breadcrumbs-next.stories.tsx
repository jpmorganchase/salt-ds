import { BreadcrumbNext, BreadcrumbsNext } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Breadcrumbs Next",
  component: BreadcrumbsNext,
} as Meta<typeof BreadcrumbsNext>;

export const Default: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext>Root Level Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 2 Entity</BreadcrumbNext>
    <BreadcrumbNext>Level 3 Entity</BreadcrumbNext>
  </BreadcrumbsNext>
);
