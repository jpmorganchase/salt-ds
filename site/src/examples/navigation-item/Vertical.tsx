import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/core";

export const Vertical = (): ReactElement => {
  const [active, setActive] = useState(false);
  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavigationItem
      href="#"
      active={active}
      orientation="vertical"
      onClick={() => {
        handleActiveToggle();
      }}
    >
      Label
    </NavigationItem>
  );
};
