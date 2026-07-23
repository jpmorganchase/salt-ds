import {
  Breadcrumb,
  BreadcrumbLabel,
  Breadcrumbs,
  BreadcrumbTrigger,
  Tooltip,
} from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { waitFor } from "storybook/test";

import "docs/story.css";

export default {
  title: "Core/Breadcrumbs/Breadcrumbs QA",
  component: Breadcrumbs,
} as Meta<typeof Breadcrumbs>;

export const AllExamplesGrid: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={3} itemPadding={12} transposeDensity vertical width={1200}>
    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">Accounts</Breadcrumb>
      <Breadcrumb href="#">Asset management</Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">Accounts</Breadcrumb>
      <Breadcrumb current href="#">
        Asset management
      </Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">
        <BreadcrumbTrigger>
          <HomeIcon aria-hidden />
          <BreadcrumbLabel>Accounts</BreadcrumbLabel>
        </BreadcrumbTrigger>
      </Breadcrumb>
      <Breadcrumb href="#">Asset management</Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">
        <Tooltip content="Client account ID: ACC-10482" placement="top">
          <BreadcrumbTrigger>
            <BreadcrumbLabel>Accounts</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Tooltip>
      </Breadcrumb>
      <Breadcrumb href="#">
        <Tooltip content="Asset management mandate" placement="top">
          <BreadcrumbTrigger>
            <BreadcrumbLabel>Asset management</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Tooltip>
      </Breadcrumb>
      <Breadcrumb href="#">
        <Tooltip content="Portfolio valuation date" placement="top">
          <BreadcrumbTrigger>
            <BreadcrumbLabel>Portfolio</BreadcrumbLabel>
          </BreadcrumbTrigger>
        </Tooltip>
      </Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb" style={{ width: 250 }} wrap>
      <Breadcrumb href="#">Accounts</Breadcrumb>
      <Breadcrumb href="#">Asset management</Breadcrumb>
      <Breadcrumb href="#">Fixed income</Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb with open disclosure" maxItems={3}>
      <Breadcrumb href="#">Accounts</Breadcrumb>
      <Breadcrumb href="#">Asset management</Breadcrumb>
      <Breadcrumb href="#">Fixed income</Breadcrumb>
      <Breadcrumb href="#">Equities</Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs
      aria-label="Breadcrumb"
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

    <Breadcrumbs aria-label="Breadcrumb" itemsBeforeCollapse={0} maxItems={3}>
      <Breadcrumb href="#">Accounts</Breadcrumb>
      <Breadcrumb href="#">Asset management</Breadcrumb>
      <Breadcrumb href="#">Fixed income</Breadcrumb>
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>

    <Breadcrumbs aria-label="Breadcrumb">
      <Breadcrumb href="#">Portfolio</Breadcrumb>
    </Breadcrumbs>
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
