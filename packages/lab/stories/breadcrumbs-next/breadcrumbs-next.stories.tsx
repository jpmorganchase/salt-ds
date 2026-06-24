import { Button, StackLayout, Tooltip } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import {
  BreadcrumbNext,
  BreadcrumbNextLabel,
  BreadcrumbNextTrigger,
  BreadcrumbsNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useState } from "react";

const longRootLabel = "Accounts receivable ledger for EMEA region";
const longIntermediateLabel = "Discretionary asset management mandates";
const longCurrentLabel = "Institutional fixed income portfolio";

export default {
  title: "Lab/Breadcrumbs Next",
  component: BreadcrumbsNext,
  args: {
    "aria-label": "Breadcrumb",
  },
} as Meta<typeof BreadcrumbsNext>;

const RouterLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a">>(
  function RouterLink(props, ref) {
    return <a {...props} data-router-link="" ref={ref} />;
  },
);

function TooltipBreadcrumbContent({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) {
  return (
    <Tooltip content={tooltip} placement="top">
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>{label}</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </Tooltip>
  );
}

export const Default: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const ExplicitCurrent: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext current href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Portfolio" />
  </BreadcrumbsNext>
);

export const WithIcon: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext href="#" icon={HomeIcon} label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const RouterRenderProp: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext
      href="/accounts"
      label="Accounts"
      render={(linkProps) => <RouterLink {...linkProps} />}
    >
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext
      href="/accounts/asset-management"
      label="Asset management"
      render={(linkProps) => <RouterLink {...linkProps} />}
    >
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>Asset management</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const Wrapped: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} wrap>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Fixed income" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const LongLabels: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} style={{ width: 420 }}>
    <BreadcrumbNext href="#" label={longRootLabel} />
    <BreadcrumbNext href="#" label={longIntermediateLabel} />
    <BreadcrumbNext label={longCurrentLabel} />
  </BreadcrumbsNext>
);

export const WithTooltip: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} style={{ width: 420 }}>
    <BreadcrumbNext href="#" label={longRootLabel}>
      <TooltipBreadcrumbContent
        label={longRootLabel}
        tooltip={`${longRootLabel} · Ledger ID: ACC-1042`}
      />
    </BreadcrumbNext>
    <BreadcrumbNext href="#" label={longIntermediateLabel}>
      <TooltipBreadcrumbContent
        label={longIntermediateLabel}
        tooltip={`${longIntermediateLabel} · Mandate: Discretionary`}
      />
    </BreadcrumbNext>
    <BreadcrumbNext label={longCurrentLabel}>
      <TooltipBreadcrumbContent
        label={longCurrentLabel}
        tooltip={`${longCurrentLabel} · AUM: $4.2B`}
      />
    </BreadcrumbNext>
  </BreadcrumbsNext>
);

export const MenuCollapsed: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} maxItems={3}>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Fixed income" />
    <BreadcrumbNext href="#" label="Equities" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const MenuCollapsedWithRouterRender: StoryFn<typeof BreadcrumbsNext> = (
  props,
) => (
  <BreadcrumbsNext {...props} maxItems={3}>
    <BreadcrumbNext
      href="/accounts"
      label="Accounts"
      render={(linkProps) => <RouterLink {...linkProps} />}
    >
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext
      href="/accounts/asset-management"
      label="Asset management"
      render={(linkProps) => <RouterLink {...linkProps} />}
    >
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>Asset management</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext
      href="/accounts/asset-management/fixed-income"
      label="Fixed income"
      render={(linkProps) => <RouterLink {...linkProps} />}
    >
      <BreadcrumbNextTrigger>
        <BreadcrumbNextLabel>Fixed income</BreadcrumbNextLabel>
      </BreadcrumbNextTrigger>
    </BreadcrumbNext>
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const InlineExpansion: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} collapseMode="expand" maxItems={3}>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Fixed income" />
    <BreadcrumbNext href="#" label="Equities" />
    <BreadcrumbNext label="Portfolio" />
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
        <BreadcrumbNext href="#" label="Accounts" />
        <BreadcrumbNext href="#" label="Asset management" />
        <BreadcrumbNext href="#" label="Fixed income" />
        <BreadcrumbNext href="#" label="Equities" />
        <BreadcrumbNext label="Portfolio" />
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
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Fixed income" />
    <BreadcrumbNext href="#" label="Equities" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const OverflowAtStart: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props} itemsBeforeCollapse={0} maxItems={3}>
    <BreadcrumbNext href="#" label="Accounts" />
    <BreadcrumbNext href="#" label="Asset management" />
    <BreadcrumbNext href="#" label="Fixed income" />
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);

export const SingleLevel: StoryFn<typeof BreadcrumbsNext> = (props) => (
  <BreadcrumbsNext {...props}>
    <BreadcrumbNext label="Portfolio" />
  </BreadcrumbsNext>
);
