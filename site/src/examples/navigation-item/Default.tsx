import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/lab";

export const Default = (): ReactElement => {
  const [active, setActive] = useState(false);
  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavigationItem
      href="#"
      active={active}
      onClick={() => {
        handleActiveToggle();
      }}
    >
      Label
    </NavigationItem>
  );
};
