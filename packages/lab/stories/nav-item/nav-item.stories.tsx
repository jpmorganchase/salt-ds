import { LayerLayout, NavItem, NavItemProps } from "@salt-ds/lab";
import { Story } from "@storybook/react";
import { CSSProperties, useState } from "react";
import { Card, H2, Link } from "@salt-ds/core";

import "./nav-item.stories.css";

export default {
  title: "Lab/Nav Item",
  component: NavItem,
};

const Template: Story<NavItemProps> = (args) => <NavItem {...args} />;

export const Default = Template.bind({});
Default.args = {
  active: false,
  children: "Nav Item",
  href: "#",
};
const itemsWithSubNav = [
  {
    name: "Nav Item 1",
  },
  {
    name: "Nav Item 2",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
  {
    name: "Nav Item 3",
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
  },
];

const items = itemsWithSubNav.map((item) => item.name);

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
export const NestedGroup = () => {
  const [active, setActive] = useState(itemsWithSubNav[0].name);
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <ul className="vertical">
        {itemsWithSubNav.map(({ name, subNav }) => (
          <li key={name}>
            <NavItem
              active={
                active === name ||
                (!expanded.includes(name) &&
                  subNav?.some((item) => active === `${name} - ${item}`))
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
            </NavItem>
            {expanded.includes(name) && (
              <ul>
                {subNav?.map((item) => {
                  const itemValue = `${name} - ${item}`;
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
                        level={1}
                      >
                        {item}
                      </NavItem>
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

export const NestedCardGroup = () => {
  const [active, setActive] = useState(itemsWithSubNav[0].name);
  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <nav>
      <ul className="vertical">
        {itemsWithSubNav.map(({ name, subNav }) => (
          <li key={name}>
            <NavItem
              active={
                active === name ||
                (!expanded.includes(name) &&
                  subNav?.some((item) => active === `${name} - ${item}`))
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
            </NavItem>
            {expanded.includes(name) && (
              <ul className="cardList">
                {subNav?.map((item) => (
                  <li key={item} className="cardItem">
                    <Link
                      href="https://saltdesignsystem.com/"
                      IconComponent={null}
                      target="_blank"
                    >
                      <Card className="linkCard">{item}</Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const HorizontalExpandableGroup = () => {
  const [active, setActive] = useState(itemsWithSubNav[0].name);
  const [expanded, setExpanded] = useState<string | null>(null);
  const currentSubNav = itemsWithSubNav.find(
    (item) => item.name === expanded
  )?.subNav;
  return (
    <div className="container">
      <nav className="center">
        <ul className="horizontal">
          {itemsWithSubNav.map(({ name, subNav }) => (
            <li key={name}>
              <NavItem
                active={active === name}
                href="#"
                onClick={(event) => {
                  // Prevent default to avoid navigation
                  event.preventDefault();
                  setActive(name);
                  setExpanded((old) => {
                    if (old === name) {
                      return null;
                    }
                    return name;
                  });
                }}
                onExpand={() => {
                  setExpanded((old) => {
                    if (old === name) {
                      return null;
                    }
                    return name;
                  });
                }}
                expanded={expanded === name}
                aria-haspopup={expanded === name}
                parent={subNav && subNav.length > 0}
              >
                {name}
              </NavItem>
            </li>
          ))}
        </ul>
      </nav>
      <div className="content">
        <LayerLayout
          position="top"
          isOpen={currentSubNav !== undefined}
          fullScreenAtBreakpoint={"sm"}
        >
          <ul className="menu">
            <H2>{expanded}</H2>
            {currentSubNav?.map((item) => {
              return (
                <li key={item} className="cardItem">
                  <Link
                    href="https://saltdesignsystem.com/"
                    IconComponent={null}
                    target="_blank"
                  >
                    <Card className="linkCard">{item}</Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        </LayerLayout>
      </div>
    </div>
  );
};
