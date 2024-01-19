import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/lab";
import { Badge, FlexLayout } from "@salt-ds/core";

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
        onClick={() => {
          handleHorizontalActiveToggle();
        }}
        href="#"
      >
        Label
        <Badge value="New" />
      </NavigationItem>

      <NavigationItem
        active={verticalActive}
        onClick={() => {
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
