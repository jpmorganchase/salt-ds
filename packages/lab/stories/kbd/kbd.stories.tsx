import {
  Button,
  FlexLayout,
  FlowLayout,
  Input,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  Text,
} from "@salt-ds/core";
import { MicroMenuIcon, SearchIcon } from "@salt-ds/icons";
import { Kbd, type KbdProps } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export default {
  title: "Lab/Kbd",
  component: Kbd,
};

export const Default: StoryFn<KbdProps> = () => {
  return (
    <FlexLayout gap={2}>
      <Kbd>Cmd</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>Ctrl</Kbd>
    </FlexLayout>
  );
};
export const Variants: StoryFn<KbdProps> = () => {
  return (
    <FlexLayout gap={2}>
      <Kbd>primary</Kbd>
      <Kbd variant="secondary">secondary</Kbd>
      <Kbd variant="tertiary">tertiary</Kbd>
    </FlexLayout>
  );
};

export const InlineWithText: StoryFn<KbdProps> = () => {
  return (
    <FlexLayout gap={0.5} align="center" wrap>
      <Text>Hit</Text>
      <Kbd>Ctrl</Kbd>
      <Text>+</Text>
      <Kbd>Shift</Kbd>
      <Text>+</Text>
      <Kbd>k</Kbd>
      <Text>to open the command palette</Text>
    </FlexLayout>
  );
};

export const NestedInInput: StoryFn<KbdProps> = () => {
  return (
    <FlowLayout style={{ maxWidth: "256px" }}>
      <Input
        bordered
        style={{ width: "198px" }}
        placeholder="Search"
        startAdornment={<SearchIcon />}
        endAdornment={
          <FlexLayout gap={0.5} wrap align="center">
            <Kbd>Cmd</Kbd>
            <Kbd>K</Kbd>
          </FlexLayout>
        }
      />
    </FlowLayout>
  );
};

function AlignmentMenu() {
  return (
    <Menu>
      <MenuTrigger>
        <MenuItem>Alignment</MenuItem>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Left alignment");
          }}
        >
          <FlexLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Text Align Left
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Option</Kbd>
              <Kbd>Cmd</Kbd>
              <Kbd>L</Kbd>
            </FlexLayout>
          </FlexLayout>
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Center alignment");
          }}
        >
          <FlexLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Text Align Center
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Option</Kbd>
              <Kbd>Cmd</Kbd>
              <Kbd>C</Kbd>
            </FlexLayout>
          </FlexLayout>
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Right alignment");
          }}
        >
          <FlexLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Text Align Right
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Option</Kbd>
              <Kbd>Cmd</Kbd>
              <Kbd>R</Kbd>
            </FlexLayout>
          </FlexLayout>
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
}

export const NestedInMenu: StoryFn<KbdProps> = () => {
  const [open, setOpen] = useState(false);

  useHotkeys("meta+m", (event) => {
    event.preventDefault();
    setOpen(true);
  });

  return (
    <Menu open={open} onOpenChange={setOpen}>
      <MenuTrigger>
        <Button
          appearance="transparent"
          aria-label="Open Menu"
          aria-keyshortcuts="Meta+M"
        >
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem
          onClick={() => {
            alert("Copy");
          }}
        >
          <FlexLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Copy
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Cmd</Kbd>
              <Kbd>C</Kbd>
            </FlexLayout>
          </FlexLayout>
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Paste");
          }}
        >
          <FlowLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Paste
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Cmd</Kbd>
              <Kbd>V</Kbd>
            </FlexLayout>
          </FlowLayout>
        </MenuItem>
        <MenuItem
          onClick={() => {
            alert("Duplicate");
          }}
        >
          <FlexLayout
            style={{ width: "100%" }}
            align="center"
            justify="space-between"
          >
            Duplicate
            <FlexLayout gap={0.5} wrap align="center">
              <Kbd>Cmd</Kbd>
              <Kbd>Shift</Kbd>
              <Kbd>D</Kbd>
            </FlexLayout>
          </FlexLayout>
        </MenuItem>
        <AlignmentMenu />
      </MenuPanel>
    </Menu>
  );
};
