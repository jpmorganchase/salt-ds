import { Button, Menu, MenuItem, MenuPanel, MenuTrigger } from "@salt-ds/core";
import {
  ChevronDownIcon,
  DeleteIcon,
  ExportIcon,
  SaveIcon,
} from "@salt-ds/icons";

export const WithIcons = () => {
  return (
    <Menu>
      <MenuTrigger>
        <Button>
          Actions
          <ChevronDownIcon aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuPanel>
        <MenuItem>
          <SaveIcon aria-hidden />
          Save
        </MenuItem>
        <MenuItem>
          <SaveIcon aria-hidden />
          Save as
        </MenuItem>
        <MenuItem>
          <ExportIcon aria-hidden />
          Export
        </MenuItem>
        <MenuItem>
          <DeleteIcon aria-hidden />
          Delete
        </MenuItem>
      </MenuPanel>
    </Menu>
  );
};
