import { Badge, FlexLayout, NavigationItem, NavigationItemProps } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";
import { NotificationIcon } from "@salt-ds/icons";

import "./navigation-item.stories.css";

export default {
  title: "Core/Navigation Item",
  component: NavigationItem,
} as Meta;

const Template: StoryFn<NavigationItemProps> = (args) => {
  const [active, setActive] = useState(false);

  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavigationItem
      active={active}
      onClick={(event) => {
        // Prevent default to avoid navigation
        event.preventDefault();
        handleActiveToggle();
      }}
      {...args}
    />
  );
};

export const Default = Template.bind({});
Default.args = {
  children: "Label",
  href: "#",
};

export const Vertical: StoryFn<NavigationItemProps> = (args) => {
  const [active, setActive] = useState(false);

  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavigationItem
      active={active}
      onClick={(event) => {
        // Prevent default to avoid navigation
        event.preventDefault();
        handleActiveToggle();
      }}
      {...args}
    />
  );
};
Vertical.args = {
  children: "Label",
  orientation: "vertical",
  href: "#",
};

export const WithIcon: StoryFn<NavigationItemProps> = () => {
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
        <NotificationIcon />
        Label
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
        <NotificationIcon />
        Label
      </NavigationItem>
    </FlexLayout>
  );
};

export const WithBadge: StoryFn<NavigationItemProps> = () => {
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

export const WithNestedItems: StoryFn<NavigationItemProps> = () => {
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

const items = ["Label 1", "Label 2", "Label 3", "Label 4", "Label 5"];

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

export const HorizontalGroup = () => {
  const [active, setActive] = useState(items[0]);

  return (
    <nav>
      <ul className="horizontal">
        {items.map((item) => (
          <li key={item}>
            <NavigationItem
              active={active === item}
              href="#"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
            >
              {item}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const HorizontalGroupWithIconAndBadge = () => {
  const [active, setActive] = useState(items[0]);

  return (
    <nav>
      <ul className="horizontal">
        {items.map((item, index) => (
          <li key={item}>
            <NavigationItem
              active={active === item}
              href="#"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
            >
              <NotificationIcon />
              {item}
              {index === 2 && <Badge value="New" />}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const VerticalGroup = () => {
  const [active, setActive] = useState(items[0]);
  return (
    <nav>
      <ul className="vertical">
        {items.map((item) => (
          <li key={item}>
            <NavigationItem
              active={active === item}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
            >
              {item}
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const VerticalGroupWithIconAndBadge = () => {
  const badgeValues = ["New", 1, 22, "Vanilla", 3, "Chocolate"];

  const [active, setActive] = useState(items[0]);

  return (
    <nav>
      <ul className="vertical">
        {items.map((item, index) => {
          return (
            <li key={item}>
              <NavigationItem
                active={active === item}
                href="#"
                orientation="vertical"
                onClick={(event) => {
                  // Prevent default to avoid navigation
                  event.preventDefault();
                  setActive(item);
                }}
              >
                <NotificationIcon />
                {index === 0
                  ? "This is a very long label across two lines"
                  : item}
                {badgeValues[index] && <Badge value={badgeValues[index]} />}
              </NavigationItem>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export const VerticalNestedGroup = () => {
  const [active, setActive] = useState(multipleLevelNesting[0].name);

  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <ul className="vertical">
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
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
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
              <ul className="vertical">
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
                        onClick={(event) => {
                          // Prevent default to avoid navigation
                          event.preventDefault();
                        }}
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
                        <ul className="vertical">
                          {item.subNav.map((nestedItem) => {
                            const itemValue = `${name} - ${item.name} - ${nestedItem}`;

                            return (
                              <li key={itemValue}>
                                <NavigationItem
                                  active={active === itemValue}
                                  href="#"
                                  orientation="vertical"
                                  onClick={(event) => {
                                    // Prevent default to avoid navigation
                                    event.preventDefault();
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

export const VerticalNestedGroupNoIcon = () => {
  const [active, setActive] = useState(multipleLevelNesting[0].name);

  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <ul className="vertical">
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
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
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
              {name}
            </NavigationItem>
            {expanded.includes(name) && (
              <ul className="vertical">
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
                        onClick={(event) => {
                          // Prevent default to avoid navigation
                          event.preventDefault();
                        }}
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
                        <ul className="vertical">
                          {item.subNav.map((nestedItem) => {
                            const itemValue = `${name} - ${item.name} - ${nestedItem}`;

                            return (
                              <li key={itemValue}>
                                <NavigationItem
                                  active={active === itemValue}
                                  href="#"
                                  orientation="vertical"
                                  onClick={(event) => {
                                    // Prevent default to avoid navigation
                                    event.preventDefault();
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
