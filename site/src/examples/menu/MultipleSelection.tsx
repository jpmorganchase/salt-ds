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

export const MultipleSelection = (): ReactElement => {
  const [columns, setColumns] = useState<string[]>(["owner", "size"]);

  return (
    <Menu>
      <MenuTrigger>
        <Button appearance="transparent" aria-label="Open Menu">
          <MicroMenuIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuGroup
          label="Columns"
          selectionVariant="multiple"
          selected={columns}
          onSelectionChange={(_event, newSelected) => setColumns(newSelected)}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="modified">Date modified</MenuItem>
          <MenuItem value="size">Size</MenuItem>
          <MenuItem value="type">Type</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
