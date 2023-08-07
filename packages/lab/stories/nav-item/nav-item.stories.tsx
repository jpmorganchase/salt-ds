import { NavItem, NavItemProps, Badge } from "@salt-ds/lab";
import { Story } from "@storybook/react";
import { useState } from "react";
import { NotificationIcon } from "@salt-ds/icons";

import "./nav-item.stories.css";

export default {
  title: "Lab/Nav Item",
  component: NavItem,
};

const Template: Story<NavItemProps> = (args) => {
  const [active, setActive] = useState(false);

  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return <NavItem active={active} onClick={handleActiveToggle} {...args} />;
};

export const Default = Template.bind({});
Default.args = {
  children: "Nav Item",
  href: "#",
};

export const WithIcon: Story<NavItemProps> = (args) => {
  const [active, setActive] = useState(false);

  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavItem
      active={active}
      onClick={handleActiveToggle}
      IconComponent={NotificationIcon}
      {...args}
    />
  );
};
WithIcon.args = {
  children: "Nav Item",
  href: "#",
};

export const WithBadge: Story<NavItemProps> = (args) => {
  const [active, setActive] = useState(false);

  const handleActiveToggle = () => {
    setActive((current) => !current);
  };

  return (
    <NavItem
      active={active}
      onClick={handleActiveToggle}
      BadgeComponent={<Badge value="NEW" />}
      {...args}
    />
  );
};
WithBadge.args = {
  children: "Nav Item",
  href: "#",
};

const items = [
  "Nav Item 1",
  "Nav Item 2",
  "Nav Item 3",
  "Nav Item 4",
  "Nav Item 5",
];

const multipleLevelNesting = [
  {
    name: "Nav Item 1 - Level 0",
  },
  {
    name: "Nav Item 2 - Level 0",
    subNav: [
      {
        name: "Nav Item 1 - Level 1",
        subNav: [
          "Nav Item 1 - Level 2",
          "Nav Item 2 - Level 2",
          "Nav Item 3 - Level 2",
        ],
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
            <NavItem
              active={active === item}
              href="#"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
            >
              {item}
            </NavItem>
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
            <NavItem
              active={active === item}
              href="#"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
              IconComponent={NotificationIcon}
              BadgeComponent={index === 2 && <Badge value="NEW" />}
            >
              {item}
            </NavItem>
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
            <NavItem
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
            </NavItem>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const VerticalGroupWithIconAndBadge = () => {
  const [active, setActive] = useState(items[0]);
  const badgeValues = ["NEW", 1, 22, "Vanilla", 3, "Chocolate"];

  return (
    <nav>
      <ul className="vertical">
        {items.map((item, index) => (
          <li key={item}>
            <NavItem
              active={active === item}
              href="#"
              orientation="vertical"
              onClick={(event) => {
                // Prevent default to avoid navigation
                event.preventDefault();
                setActive(item);
              }}
              IconComponent={NotificationIcon}
              BadgeComponent={
                badgeValues[index] && <Badge value={badgeValues[index]} />
              }
            >
              {item}
            </NavItem>
          </li>
        ))}
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
            <NavItem
              active={
                active === name ||
                (!expanded.includes(name) &&
                  subNav?.some((item) => active === `${name} - ${item.name}`))
              }
              blurSelected={
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
              IconComponent={NotificationIcon}
            >
              {name}
            </NavItem>
            {expanded.includes(name) && (
              <ul className="nestedGroup">
                {subNav?.map((item) => {
                  const itemValue = `${name} - ${item.name}`;

                  return (
                    <li key={itemValue}>
                      <NavItem
                        active={
                          active === itemValue ||
                          (!expanded.includes(item.name) &&
                            item.subNav?.some(
                              (item) => active === `${name} - ${item}`
                            ))
                        }
                        blurSelected={
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
                      </NavItem>

                      {expanded.includes(item.name) && (
                        <ul className="nestedGroup">
                          {item.subNav.map((nestedItem) => {
                            const itemValue = `${name} - ${item.name} - ${nestedItem}`;

                            return (
                              <li key={itemValue}>
                                <NavItem
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
                                </NavItem>
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
