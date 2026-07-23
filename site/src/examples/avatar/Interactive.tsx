import {
  Avatar,
  Divider,
  FlexLayout,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { ExportIcon, NotificationIcon, SettingsIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Interactive = (): ReactElement => {
  return (
    <FlexLayout align="center">
      <Menu placement="bottom-end">
        <MenuTrigger>
          <Avatar
            name="Alex Brailescu"
            render={
              <button type="button" aria-label="Alex Brailescu profile" />
            }
          />
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>
            <NotificationIcon aria-hidden />
            Notifications
          </MenuItem>
          <MenuItem>
            <SettingsIcon aria-hidden />
            Settings
          </MenuItem>
          <Divider />
          <MenuItem>
            <ExportIcon aria-hidden />
            Log out
          </MenuItem>
        </MenuPanel>
      </Menu>
    </FlexLayout>
  );
};
