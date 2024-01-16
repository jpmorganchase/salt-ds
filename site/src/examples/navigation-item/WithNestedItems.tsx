import { ReactElement, useState } from "react";
import { FlexLayout, NavigationItem } from "@salt-ds/core";

export const WithNestedItems = (): ReactElement => {
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
        onExpand={handleHorizontalActiveToggle}
        href="#"
        parent
      >
        Label
      </NavigationItem>

      <NavigationItem
        active={verticalActive}
        onExpand={handleVerticalActiveToggle}
        href="#"
        orientation="vertical"
        parent
      >
        Label
      </NavigationItem>
    </FlexLayout>
  );
};
