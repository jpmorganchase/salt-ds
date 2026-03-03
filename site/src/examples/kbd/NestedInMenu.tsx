import {
  Button,
  FlexLayout,
  FlowLayout,
  Kbd,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

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

export const NestedInMenu = (): ReactElement => (
  <Menu>
    <MenuTrigger>
      <Button appearance="transparent" aria-label="Open Menu">
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
