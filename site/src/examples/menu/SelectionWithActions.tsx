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

const defaultSortBy = ["name"];
const defaultColumns = ["owner", "size"];

export const SelectionWithActions = (): ReactElement => {
  const [sortBy, setSortBy] = useState<string[]>(defaultSortBy);
  const [columns, setColumns] = useState<string[]>(defaultColumns);

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
        </MenuGroup>
        <MenuGroup
          label="Columns"
          selectionVariant="multiple"
          selected={columns}
          onSelectionChange={(_event, newSelected) => setColumns(newSelected)}
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="size">Size</MenuItem>
          <MenuItem value="type">Type</MenuItem>
        </MenuGroup>
        <MenuGroup>
          <MenuItem
            onClick={() => {
              setSortBy(defaultSortBy);
              setColumns(defaultColumns);
            }}
          >
            Reset view
          </MenuItem>
          <MenuItem>Export</MenuItem>
        </MenuGroup>
      </MenuPanel>
    </Menu>
  );
};
