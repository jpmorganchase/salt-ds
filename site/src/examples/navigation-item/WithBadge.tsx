import { ReactElement, useState } from "react";
import { Badge, NavigationItem } from "@salt-ds/lab";
import { FlexLayout } from "@salt-ds/core";

export const WithBadge = (): ReactElement => {
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
        Label
        <Badge value="New" />
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
        Label
        <Badge value="New" />
      </NavigationItem>
    </FlexLayout>
  );
};
