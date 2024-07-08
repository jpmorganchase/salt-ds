import { Badge, Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { List, ListItem } from "@salt-ds/lab";

import {
  MessageIcon,
  NotificationIcon,
  SettingsSolidIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@salt-ds/icons";

import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Badge",
  component: Badge,
} as Meta<typeof Badge>;

export const Icon: StoryFn<typeof Badge> = () => {
  return (
    <div>
      <Badge value={9}>
        <Button>
          <SettingsSolidIcon />
        </Button>
      </Badge>
    </div>
  );
};

export const MaxNumber: StoryFn<typeof Badge> = () => {
  return (
    <div>
      <Badge max={99} value={150}>
        <Button>
          <NotificationIcon />
        </Button>
      </Badge>
    </div>
  );
};

export const DefaultTruncation: StoryFn<typeof Badge> = () => {
  return (
    <div>
      <Badge value={1000}>
        <Button>
          <MessageIcon />
        </Button>
      </Badge>
    </div>
  );
};

export const String: StoryFn<typeof Badge> = () => {
  return (
    <div>
      <Badge value={"NEW"}>
        <Button>
          <MessageIcon />
        </Button>
      </Badge>
    </div>
  );
};

export const ListStory: StoryFn<typeof Badge> = () => {
  return (
    <List aria-label="Declarative List example">
      <ListItem>Level 1</ListItem>
      <ListItem>Level 2</ListItem>
      <ListItem>Level 3</ListItem>
      <ListItem>
        Level 4<Badge value={"NEW"} />{" "}
      </ListItem>
    </List>
  );
};

export const MultipleButtons: StoryFn<typeof Badge> = () => {
  return (
    <StackLayout>
      <FlexLayout>
        <Badge value={20}>
          <Button>
            <ThumbsUpIcon />
          </Button>
        </Badge>
        <Button>
          <ThumbsDownIcon />
        </Button>
      </FlexLayout>
      <FlexLayout>
        <Button>
          <ThumbsUpIcon />
        </Button>
        <Button>
          <ThumbsDownIcon />
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
