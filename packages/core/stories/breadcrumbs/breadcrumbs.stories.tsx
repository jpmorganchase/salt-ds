import {
  Breadcrumb,
  BreadcrumbLabel,
  Breadcrumbs,
  BreadcrumbTrigger,
  Tooltip,
} from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    "aria-label": "Breadcrumb",
  },
} as Meta<typeof Breadcrumbs>;

export const Default: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const ExplicitCurrent: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb current href="#">
      Asset management
    </Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const WithIcon: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb href="#">
      <BreadcrumbTrigger>
        <HomeIcon aria-hidden />
        <BreadcrumbLabel>Accounts</BreadcrumbLabel>
      </BreadcrumbTrigger>
    </Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const WithTooltip: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb href="#">
      <Tooltip content="Client account · ID: ACC-10482" placement="top">
        <BreadcrumbTrigger>
          <BreadcrumbLabel>Accounts</BreadcrumbLabel>
        </BreadcrumbTrigger>
      </Tooltip>
    </Breadcrumb>
    <Breadcrumb href="#">
      <Tooltip
        content="Asset management · Mandate: Discretionary · Region: EMEA"
        placement="top"
      >
        <BreadcrumbTrigger>
          <BreadcrumbLabel>Asset management</BreadcrumbLabel>
        </BreadcrumbTrigger>
      </Tooltip>
    </Breadcrumb>
    <Breadcrumb href="#">
      <Tooltip
        content="Portfolio · Valuation date: 30 Jun 2026 · AUM: £12.4m"
        placement="top"
      >
        <BreadcrumbTrigger>
          <BreadcrumbLabel>Portfolio</BreadcrumbLabel>
        </BreadcrumbTrigger>
      </Tooltip>
    </Breadcrumb>
  </Breadcrumbs>
);

export const Wrapped: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props} wrap>
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Fixed income</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const DisclosureCollapsed: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props} maxItems={3}>
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Fixed income</Breadcrumb>
    <Breadcrumb href="#">Equities</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const CustomCollapseRanges: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs
    {...props}
    itemsAfterCollapse={2}
    itemsBeforeCollapse={2}
    maxItems={4}
  >
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Fixed income</Breadcrumb>
    <Breadcrumb href="#">Equities</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const OverflowAtStart: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props} itemsBeforeCollapse={0} maxItems={3}>
    <Breadcrumb href="#">Accounts</Breadcrumb>
    <Breadcrumb href="#">Asset management</Breadcrumb>
    <Breadcrumb href="#">Fixed income</Breadcrumb>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);

export const SingleLevel: StoryFn<typeof Breadcrumbs> = (props) => (
  <Breadcrumbs {...props}>
    <Breadcrumb href="#">Portfolio</Breadcrumb>
  </Breadcrumbs>
);
