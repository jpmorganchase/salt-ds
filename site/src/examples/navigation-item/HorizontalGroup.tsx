import { ReactElement, useState } from "react";
import { NavigationItem, StackLayout } from "@salt-ds/core";

const items = ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5"];

export const HorizontalGroup = (): ReactElement => {
  const [active, setActive] = useState(items[0]);

  return (
    <nav>
      <StackLayout
        as="ul"
        direction="row"
        gap={1}
        style={{ listStyle: "none" }}
      >
        {items.map((item) => (
          <li key={item}>
            <NavigationItem
              active={active === item}
              href="#"
              onClick={() => {
                setActive(item);
              }}
            >
              {item}
            </NavigationItem>
          </li>
        ))}
      </StackLayout>
    </nav>
  );
};
