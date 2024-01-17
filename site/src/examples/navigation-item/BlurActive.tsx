import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/lab";
import { NotificationIcon } from "@salt-ds/icons";

const multipleLevelNesting = [
  {
    name: "Label 2 - level 0",
    subNav: [
      { name: "Label 1 - level 1" },
      { name: "Label 2 - level 1" },
      { name: "Label 3 - level 1" },
    ],
  },
];

export const BlurActive = (): ReactElement => {
  const [active, setActive] = useState<string>(
    multipleLevelNesting[0].subNav[1].name
  );
  const [expanded, setExpanded] = useState<boolean>();
  const orientation = "vertical";

  const handleOnExpand = () => {
    setExpanded((current) => !current);
  };

  return (
    <nav>
      <ul style={{ width: 250, listStyle: "none", paddingLeft: 0 }}>
        {multipleLevelNesting.map((item) => {
          const hasActiveChild = item.subNav.some((i) => active === i.name);
          const isParent = item.subNav && item.subNav.length > 0;

          // Setting blur-active state when the item is not expanded and has an active child. So it's visible where the active item is located.
          const isBlurActive = hasActiveChild && !expanded;

          return (
            <li key={item.name}>
              <NavigationItem
                blurActive={isBlurActive}
                href="#"
                orientation={orientation}
                onExpand={handleOnExpand}
                parent={isParent}
                expanded={expanded}
              >
                <NotificationIcon />
                {item.name}
              </NavigationItem>
              {expanded && (
                <ul
                  style={{
                    width: 250,
                    listStyle: "none",
                    paddingLeft: 0,
                  }}
                >
                  {item.subNav.map((nestedItem) => (
                    <li key={nestedItem.name}>
                      <NavigationItem
                        active={active === nestedItem.name}
                        href="#"
                        orientation={orientation}
                        level={1}
                        onClick={() => {
                          setActive(nestedItem.name);
                        }}
                      >
                        {nestedItem.name}
                      </NavigationItem>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
