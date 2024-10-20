import { FlexLayout, NavigationItem } from "@salt-ds/core";
import { type ReactElement, useState } from "react";

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
        parent
      >
        Label
      </NavigationItem>

      <NavigationItem
        active={verticalActive}
        onExpand={handleVerticalActiveToggle}
        orientation="vertical"
        parent
      >
        Label
      </NavigationItem>
    </FlexLayout>
  );
};
