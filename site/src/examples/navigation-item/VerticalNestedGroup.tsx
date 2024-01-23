import { ReactElement, useState } from "react";
import { NavigationItem } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";

const multipleLevelNesting = [
  {
    name: "Label 1 - level 0",
  },
  {
    name: "Label 2 - level 0",
    subNav: [
      {
        name: "Label 1 - level 1",
        subNav: ["Label 1 - level 2", "Label 2 - level 2", "Label 3 - level 2"],
      },
    ],
  },
];
export const VerticalNestedGroup = (): ReactElement => {
  const [active, setActive] = useState(multipleLevelNesting[0].name);

  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <ul style={{ width: 250, listStyle: "none", paddingLeft: 0 }}>
        {multipleLevelNesting.map(({ name, subNav }) => (
          <li key={name}>
            <NavigationItem
              active={
                active === name ||
                (!expanded.includes(name) &&
                  subNav?.some((item) => active === `${name} - ${item.name}`))
              }
              blurActive={
                !expanded.includes(name) &&
                subNav?.some(
                  (item) =>
                    active === `${name} - ${item.name}` ||
                    item.subNav.some(
                      (nestedItem) =>
                        active === `${name} - ${item.name} - ${nestedItem}`
                    )
                )
              }
              href="#"
              orientation="vertical"
              onClick={() => {
                setActive(name);
              }}
              onExpand={() => {
                if (expanded.includes(name)) {
                  setExpanded(expanded.filter((item) => item !== name));
                } else {
                  setExpanded([...expanded, name]);
                }
              }}
              parent={subNav && subNav.length > 0}
              expanded={expanded.includes(name)}
            >
              <NotificationIcon />
              {name}
            </NavigationItem>
            {expanded.includes(name) && (
              <ul
                style={{
                  width: 250,
                  listStyle: "none",
                  paddingLeft: 0,
                }}
              >
                {subNav?.map((item) => {
                  const itemValue = `${name} - ${item.name}`;

                  return (
                    <li key={itemValue}>
                      <NavigationItem
                        active={
                          active === itemValue ||
                          (!expanded.includes(item.name) &&
                            item.subNav?.some(
                              (item) => active === `${name} - ${item}`
                            ))
                        }
                        blurActive={
                          !expanded.includes(item.name) &&
                          item.subNav?.some(
                            (nestedItem) =>
                              active ===
                              `${name} - ${item.name} - ${nestedItem}`
                          )
                        }
                        href="#"
                        orientation="vertical"
                        level={1}
                        onExpand={() => {
                          if (expanded.includes(item.name)) {
                            setExpanded(
                              expanded.filter(
                                (element) => element !== item.name
                              )
                            );
                          } else {
                            setExpanded([...expanded, item.name]);
                          }
                        }}
                        parent={item.subNav && item.subNav.length > 0}
                        expanded={expanded.includes(item.name)}
                      >
                        {item.name}
                      </NavigationItem>

                      {expanded.includes(item.name) && (
                        <ul
                          style={{
                            width: 250,
                            listStyle: "none",
                            paddingLeft: 0,
                          }}
                        >
                          {item.subNav.map((nestedItem) => {
                            const itemValue = `${name} - ${item.name} - ${nestedItem}`;

                            return (
                              <li key={itemValue}>
                                <NavigationItem
                                  active={active === itemValue}
                                  href="#"
                                  orientation="vertical"
                                  onClick={() => {
                                    setActive(itemValue);
                                  }}
                                  level={2}
                                >
                                  {nestedItem}
                                </NavigationItem>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
