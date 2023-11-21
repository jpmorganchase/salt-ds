import { Badge, Button, StackLayout } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";
import { MessageIcon, NotificationSolidIcon } from "@salt-ds/icons";
import { TabNext, TabstripNext } from "@salt-ds/lab";

export default {
  title: "Core/Badge/Badge QA",
  component: Badge,
} as Meta<typeof Badge>;

export const AllExamples: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1500} itemPadding={4} {...props}>
    <Badge value={9}>
      <Button>
        <NotificationSolidIcon />
      </Button>
    </Badge>
    <Badge value={200} max={99}>
      <Button>
        <NotificationSolidIcon />
      </Button>
    </Badge>
    <Badge value={"NEW"}>
      <Button>
        <MessageIcon />
      </Button>
    </Badge>
    <TabstripNext defaultValue="Transactions">
      <TabNext value="Transactions">
        <StackLayout direction="row" gap={1}>
          Transcations
          <Badge value={30} />
        </StackLayout>
      </TabNext>
    </TabstripNext>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection height={500} width={1000} cols={4} {...props}>
    <Badge value={9}>
      <Button>
        <NotificationSolidIcon />
      </Button>
    </Badge>
    <Badge value={200} max={99}>
      <Button>
        <NotificationSolidIcon />
      </Button>
    </Badge>
    <Badge value={"NEW"}>
      <Button>
        <MessageIcon />
      </Button>
    </Badge>
    <TabstripNext defaultValue="Transactions">
      <TabNext value="Transactions">
        <StackLayout direction="row" gap={1}>
          Transcations
          <Badge value={30} />
        </StackLayout>
      </TabNext>
    </TabstripNext>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
