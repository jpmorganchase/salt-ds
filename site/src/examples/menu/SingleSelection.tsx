import {
  Button,
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

export const SingleSelection = (): ReactElement => {
  const [sortBy, setSortBy] = useState<string[]>(["name"]);

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
          selectionVariant="single"
          selected={sortBy}
          onSelectionChange={(_event, newSelected) => setSortBy(newSelected)}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
