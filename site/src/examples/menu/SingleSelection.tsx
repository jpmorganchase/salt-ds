import {
  Button,
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const SingleSelection = (): ReactElement => {
  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Sort by"
          name="sortBy"
          selectionVariant="single"
          defaultSelected={["name"]}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
