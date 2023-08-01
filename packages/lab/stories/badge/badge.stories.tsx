import { Badge, Tabstrip, List, ListItem } from "@salt-ds/lab";
import { Button } from "@salt-ds/core";

import {
  SettingsSolidIcon,
  MessageIcon,
  NotificationIcon,
} from "@salt-ds/icons";

import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Badge",
  component: Badge,
} as ComponentMeta<typeof Badge>;

export const Icon: ComponentStory<typeof Badge> = () => {
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

export const MaxNumber: ComponentStory<typeof Badge> = () => {
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

export const DefaultTruncation: ComponentStory<typeof Badge> = () => {
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

export const String: ComponentStory<typeof Badge> = () => {
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

export const ListStory: ComponentStory<typeof Badge> = () => {
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
