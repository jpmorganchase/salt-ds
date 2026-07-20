import {
  Avatar,
  AvatarGroup,
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

      <AvatarGroup
        max={4}
        render={<button type="button" aria-label="Team members" />}
      >
        <Avatar name="Alex Brailescu" src="/img/examples/avatar.png" />
        <Avatar name="Peter Piper" color="category-2" />
        <Avatar name="John Doe" color="category-3" />
        <Avatar name="Jane Smith" color="category-4" />
        <Avatar name="Sam Wells" color="category-5" />
        <Avatar name="Maria Garcia" color="category-6" />
        <Avatar name="Liam Chen" color="category-7" />
      </AvatarGroup>
    </FlexLayout>
  );
};
