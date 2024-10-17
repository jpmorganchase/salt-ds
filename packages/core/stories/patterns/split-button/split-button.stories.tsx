import {
  Button,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  SegmentedButtonGroup,
  Tooltip,
} from "@salt-ds/core";
import {
  ArrowLeftIcon,
  CallIcon,
  ChatIcon,
  ChevronDownIcon,
  MessageIcon,
  PrintIcon,
  ShareIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react";

export default {
  title: "Patterns/Split Button",
} as Meta;

export const Primary = () => {
  return (
    <SegmentedButtonGroup>
      <Button>
        <ChatIcon aria-hidden />
        Message
      </Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>
            <MessageIcon aria-hidden />
            Email
          </MenuItem>
          <MenuItem>
            <CallIcon aria-hidden />
            Call
          </MenuItem>
          <MenuItem>
            <PrintIcon aria-hidden />
            Print
          </MenuItem>
          <MenuItem>
            <ShareIcon aria-hidden />
            Share
          </MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};

export const Secondary = () => {
  return (
    <SegmentedButtonGroup>
      <Button appearance="transparent">Action</Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button appearance="transparent" aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Action 2</MenuItem>
          <MenuItem>Action 3</MenuItem>
          <MenuItem>Action 4</MenuItem>
          <MenuItem>Action 5</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};

export const CTA = () => {
  return (
    <SegmentedButtonGroup>
      <Button sentiment="accented">Action</Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button sentiment="accented" aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Action 2</MenuItem>
          <MenuItem>Action 3</MenuItem>
          <MenuItem>Action 4</MenuItem>
          <MenuItem>Action 5</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};

export const MultipleActions = () => {
  return (
    <SegmentedButtonGroup>
      <Button>Copy</Button>
      <Button>Paste</Button>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Action 2</MenuItem>
          <MenuItem>Action 3</MenuItem>
          <MenuItem>Action 4</MenuItem>
          <MenuItem>Action 5</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};

export const IconOnly = () => {
  return (
    <SegmentedButtonGroup>
      <Tooltip content="Previous">
        <Button aria-label="previous">
          <ArrowLeftIcon aria-hidden />
        </Button>
      </Tooltip>
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Button aria-label="Open Menu">
            <ChevronDownIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Action 2</MenuItem>
          <MenuItem>Action 3</MenuItem>
          <MenuItem>Action 4</MenuItem>
          <MenuItem>Action 5</MenuItem>
        </MenuPanel>
      </Menu>
    </SegmentedButtonGroup>
  );
};
