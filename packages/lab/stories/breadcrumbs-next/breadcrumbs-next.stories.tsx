import { Button, StackLayout, Tooltip } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import {
  BreadcrumbNext,
  BreadcrumbNextLabel,
  BreadcrumbNextTrigger,
  BreadcrumbsNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Lab/Breadcrumbs Next",
  component: BreadcrumbsNext,
  args: {
    "aria-label": "Breadcrumb",
  },
} as Meta<typeof BreadcrumbsNext>;

export const Default: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const ExplicitCurrent: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext current href="#">
      Asset management
    </BreadcrumbNext>
    <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const WithIcon: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#">
      <BreadcrumbNextTrigger>
        <HomeIcon aria-hidden />
        <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const WithTooltip: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#">
      <Tooltip content="Client account · ID: ACC-10482" placement="top">
        <BreadcrumbNextTrigger>
          <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      </Tooltip>
    </BreadcrumbNext>
    <BreadcrumbNext href="#">
      <Tooltip
        content="Asset management · Mandate: Discretionary · Region: EMEA"
        placement="top"
      >
        <BreadcrumbNextTrigger>
          <BreadcrumbNextLabel>Asset management</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      </Tooltip>
    </BreadcrumbNext>
    <BreadcrumbNext>
      <Tooltip
        content="Portfolio · Valuation date: 30 Jun 2026 · AUM: £12.4m"
        placement="top"
      >
        <BreadcrumbNextTrigger>
          <BreadcrumbNextLabel>Portfolio</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      </Tooltip>
    </BreadcrumbNext>
  </BreadcrumbsNext>
);

export const Wrapped: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} wrap>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const DisclosureCollapsed: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} maxItems={3}>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
    <BreadcrumbNext href="#">Equities</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const InlineExpansion: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} collapseMode="expand" maxItems={3}>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
    <BreadcrumbNext href="#">Equities</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const ControlledInlineExpansion: StoryFn<typeof BreadcrumbsNext> = (
  props,
) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <StackLayout align="start" gap={2}>
      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Collapse" : "Expand"}
      </Button>
      <BreadcrumbsNext
        {...props}
        collapseMode="expand"
        expanded={expanded}
        maxItems={3}
        onExpandedChange={(_, nextExpanded) => setExpanded(nextExpanded)}
      >
        <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
        <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
        <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
        <BreadcrumbNext href="#">Equities</BreadcrumbNext>
        <BreadcrumbNext>Portfolio</BreadcrumbNext>
      </BreadcrumbsNext>
    </StackLayout>
  );
};

export const CustomCollapseRanges: StoryFn<typeof BreadcrumbsNext> = (
  props,
) => (
  <BreadcrumbsNext
    {...props}
    itemsAfterCollapse={2}
    itemsBeforeCollapse={2}
    maxItems={4}
  >
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
    <BreadcrumbNext href="#">Equities</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const OverflowAtStart: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} itemsBeforeCollapse={0} maxItems={3}>
    <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
    <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
    <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);

export const SingleLevel: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext>Portfolio</BreadcrumbNext>
  </BreadcrumbsNext>
);
