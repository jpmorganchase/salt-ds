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
