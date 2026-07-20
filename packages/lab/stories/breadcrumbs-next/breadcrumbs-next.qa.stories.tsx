import { Tooltip } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import {
  BreadcrumbNext,
  BreadcrumbNextLabel,
  BreadcrumbNextTrigger,
  BreadcrumbsNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { waitFor } from "storybook/test";

import "docs/story.css";

export default {
  title: "Lab/Breadcrumbs Next/Breadcrumbs Next QA",
  component: BreadcrumbsNext,
} as Meta<typeof BreadcrumbsNext>;

export const AllExamplesGrid: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={3} itemPadding={12} transposeDensity vertical width={1200}>
    <BreadcrumbsNext aria-label="Breadcrumb">
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb">
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext current href="#">
        Asset management
      </BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb">
      <BreadcrumbNext href="#">
        <BreadcrumbNextTrigger>
          <HomeIcon aria-hidden />
          <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
        </BreadcrumbNextTrigger>
      </BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb">
      <BreadcrumbNext href="#">
        <Tooltip content="Client account ID: ACC-10482" placement="top">
          <BreadcrumbNextTrigger>
            <BreadcrumbNextLabel>Accounts</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </Tooltip>
      </BreadcrumbNext>
      <BreadcrumbNext href="#">
        <Tooltip content="Asset management mandate" placement="top">
          <BreadcrumbNextTrigger>
            <BreadcrumbNextLabel>Asset management</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </Tooltip>
      </BreadcrumbNext>
      <BreadcrumbNext href="#">
        <Tooltip content="Portfolio valuation date" placement="top">
          <BreadcrumbNextTrigger>
            <BreadcrumbNextLabel>Portfolio</BreadcrumbNextLabel>
          </BreadcrumbNextTrigger>
        </Tooltip>
      </BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb" style={{ width: 250 }} wrap>
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb with open disclosure" maxItems={3}>
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
      <BreadcrumbNext href="#">Equities</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext
      aria-label="Breadcrumb"
      itemsAfterCollapse={2}
      itemsBeforeCollapse={2}
      maxItems={4}
    >
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
      <BreadcrumbNext href="#">Equities</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext
      aria-label="Breadcrumb"
      itemsBeforeCollapse={0}
      maxItems={3}
    >
      <BreadcrumbNext href="#">Accounts</BreadcrumbNext>
      <BreadcrumbNext href="#">Asset management</BreadcrumbNext>
      <BreadcrumbNext href="#">Fixed income</BreadcrumbNext>
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>

    <BreadcrumbsNext aria-label="Breadcrumb">
      <BreadcrumbNext href="#">Portfolio</BreadcrumbNext>
    </BreadcrumbsNext>
  </QAContainer>
);

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

AllExamplesGrid.play = async ({ canvasElement }) => {
  const triggers = canvasElement.querySelectorAll<HTMLButtonElement>(
    'nav[aria-label="Breadcrumb with open disclosure"] button[aria-expanded]',
  );

  for (const trigger of triggers) {
    trigger.click();
  }

  await waitFor(() => {
    const disclosures = canvasElement.ownerDocument.querySelectorAll(
      '[aria-label="Hidden breadcrumb levels"]',
    );

    if (disclosures.length !== triggers.length) {
      throw new Error("Not all breadcrumb overflow disclosures are open");
    }
  });
};
