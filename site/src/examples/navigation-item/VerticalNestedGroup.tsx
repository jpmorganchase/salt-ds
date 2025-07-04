import { NavigationItem, StackLayout } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import { type ReactElement, useState } from "react";

type Item = {
  name: string;
  subNav?: Item[];
  href?: string;
};

const multipleLevelNesting: Item[] = [
  {
    name: "Label 1 - level 0",
    href: "#",
  },
  {
    name: "Label 2 - level 0",
    subNav: [
      {
        name: "Label 1 - level 1",
        subNav: [
          {
            name: "Label 1 - level 2",
            href: "#",
          },
          { name: "Label 2 - level 2", href: "#" },
          { name: "Label 3 - level 2", href: "#" },
        ],
      },
    ],
  },
];

export const VerticalNestedGroup = (): ReactElement => {
  const [active, setActive] = useState(multipleLevelNesting[0].name);

  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <StackLayout
        as="ul"
        gap="var(--salt-spacing-fixed-100)"
        style={{
          width: 250,
          listStyle: "none",
          paddingLeft: 0,
        }}
      >
        {multipleLevelNesting.map(({ name, subNav, href }) => (
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
                    item.subNav?.some(
                      (nestedItem) =>
                        active === `${name} - ${item.name} - ${nestedItem}`,
                    ),
                )
              }
              href={href}
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
              <StackLayout
                as="ul"
                gap="var(--salt-spacing-fixed-100)"
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
                              (item) => active === `${name} - ${item}`,
                            ))
                        }
                        blurActive={
                          !expanded.includes(item.name) &&
                          item.subNav?.some(
                            (nestedItem) =>
                              active ===
                              `${name} - ${item.name} - ${nestedItem}`,
                          )
                        }
                        href={item.href}
                        orientation="vertical"
                        level={1}
                        onExpand={() => {
                          if (expanded.includes(item.name)) {
                            setExpanded(
                              expanded.filter(
                                (element) => element !== item.name,
                              ),
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
                        <StackLayout
                          as="ul"
                          gap="var(--salt-spacing-fixed-100)"
                          style={{
                            width: 250,
                            listStyle: "none",
                            paddingLeft: 0,
                          }}
                        >
                          {item.subNav?.map((nestedItem) => {
                            const itemValue = `${name} - ${item.name} - ${nestedItem.name}`;

                            return (
                              <li key={itemValue}>
                                <NavigationItem
                                  active={active === itemValue}
                                  href={nestedItem.href}
                                  orientation="vertical"
                                  onClick={() => {
                                    setActive(itemValue);
                                  }}
                                  level={2}
                                >
                                  {nestedItem.name}
                                </NavigationItem>
                              </li>
                            );
                          })}
                        </StackLayout>
                      )}
                    </li>
                  );
                })}
              </StackLayout>
            )}
          </li>
        ))}
      </StackLayout>
    </nav>
  );
};
