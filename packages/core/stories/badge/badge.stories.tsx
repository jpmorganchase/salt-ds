import {
  Badge,
  Button,
  FlexLayout,
  Tab,
  TabBar,
  TabList,
  Tabs,
  TabTrigger,
} from "@salt-ds/core";
import {
  MessageIcon,
  NotificationIcon,
  SettingsSolidIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Core/Badge",
  component: Badge,
} as Meta<typeof Badge>;

export const Icon: StoryFn<typeof Badge> = (args) => {
  return (
    <Badge {...args}>
      <Button aria-label={`${args.value} Notifications`}>
        <NotificationIcon aria-hidden />
      </Button>
    </Badge>
  );
};

Icon.args = {
  value: 9,
};

export const MaxNumber: StoryFn<typeof Badge> = (args) => {
  return (
    <Badge {...args}>
      <Button aria-label={`${args.value} Notifications`}>
        <NotificationIcon aria-hidden />
      </Button>
    </Badge>
  );
};

MaxNumber.args = {
  value: 200,
  max: 99,
};

export const DefaultTruncation: StoryFn<typeof Badge> = (args) => {
  return (
    <Badge {...args}>
      <Button aria-label={`${args.value} Messages`}>
        <MessageIcon aria-hidden />
      </Button>
    </Badge>
  );
};

DefaultTruncation.args = {
  value: 1000,
};

export const String: StoryFn = () => {
  return (
    <Badge value={"NEW"}>
      <Button aria-label="New messages">
        <MessageIcon aria-hidden />
      </Button>
    </Badge>
  );
};

export const InlineBadge: StoryFn = () => {
  return (
    <Tabs defaultValue="Home">
      <TabBar inset divider>
        <TabList
          style={{
            minWidth: 350,
          }}
        >
          <Tab value="Home">
            <TabTrigger>Home</TabTrigger>
          </Tab>
          <Tab value="Transactions">
            <TabTrigger aria-label="Transations - 30 updates">
              Transactions
              <Badge value={30} />
            </TabTrigger>
          </Tab>
          <Tab value="Loans">
            <TabTrigger>Loans</TabTrigger>
          </Tab>
        </TabList>
      </TabBar>
    </Tabs>
  );
};

export const MultipleButtons: StoryFn = () => {
  return (
    <FlexLayout>
      <Badge value={20}>
        <Button aria-label="Upvote - 20 Upvotes">
          <ThumbsUpIcon aria-hidden />
        </Button>
      </Badge>
      <Button aria-label="Downvote - 0 Downvotes">
        <ThumbsDownIcon aria-hidden />
      </Button>
    </FlexLayout>
  );
};

export const DotBadge: StoryFn<typeof Badge> = () => {
  return (
    <FlexLayout>
      <Button appearance="transparent" aria-label="Settings - New available">
        <Badge>
          <SettingsSolidIcon aria-hidden />
        </Badge>
      </Button>
      <Badge>
        <Button aria-label="Notifications - Unread">
          <NotificationIcon aria-hidden />
        </Button>
      </Badge>
    </FlexLayout>
  );
};

export const InlineDotBadge: StoryFn<typeof Badge> = () => {
  return (
    <Tabs defaultValue="Home">
      <TabBar>
        <TabList appearance="transparent" style={{ minWidth: 350 }}>
          <Tab value="Home">
            <TabTrigger>Home</TabTrigger>
          </Tab>
          <Tab value="Transactions">
            <TabTrigger aria-label="Transations - New">
              Transactions
              <Badge />
            </TabTrigger>
          </Tab>
          <Tab value="Loans">
            <TabTrigger>Loans</TabTrigger>
          </Tab>
        </TabList>
      </TabBar>
    </Tabs>
  );
};
