import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/lab";
import { FlexLayout } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";

export const WithIcon = (): ReactElement => {
  const [horizontalActive, setHorizontalActive] = useState(false);

  const [verticalActive, setVerticalActive] = useState(false);

  const handleHorizontalActiveToggle = () => {
    setHorizontalActive((current) => !current);
  };

  const handleVerticalActiveToggle = () => {
    setVerticalActive((current) => !current);
  };

  return (
    <FlexLayout align="center">
      <NavigationItem
        active={horizontalActive}
        onClick={(event) => {
          // Prevent default to avoid navigation
          event.preventDefault();
          handleHorizontalActiveToggle();
        }}
        href="#"
      >
        <NotificationIcon />
        Label
      </NavigationItem>

      <NavigationItem
        active={verticalActive}
        onClick={(event) => {
          // Prevent default to avoid navigation
          event.preventDefault();
          handleVerticalActiveToggle();
        }}
        href="#"
        orientation="vertical"
      >
        <NotificationIcon />
        Label
      </NavigationItem>
    </FlexLayout>
  );
};
