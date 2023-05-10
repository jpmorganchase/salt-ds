import { NavItem, NavItemProps } from "@salt-ds/lab";
import { Story } from "@storybook/react";
import { FlexItem, FlowLayout, StackLayout } from "@salt-ds/core";
import { useState } from "react";

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
    subNav: ["Sub Nav Item 1", "Sub Nav Item 2", "Sub Nav Item 3"],
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
  const [active, setActive] = useState(0);

  return (
    <nav>
      <ul style={{ listStyle: "none", paddingLeft: 0, display: "flex" }}>
        {items.map((item, index) => (
          <li key={item}>
            <NavItem
              active={active === index}
              href="javascript:void 0"
              onClick={() => setActive(index)}
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
  const [active, setActive] = useState(0);
  return (
    <nav>
      <ul style={{ listStyle: "none", paddingLeft: 0, width: 500 }}>
        {items.map((item, index) => (
          <li key={item}>
            <NavItem
              active={active === index}
              href="javascript:void 0"
              orientation="vertical"
              onClick={() => setActive(index)}
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
      <ul
        style={{ listStyle: "none", paddingLeft: 0, width: 500, height: 500 }}
      >
        {itemsWithSubNav.map(({ name, subNav }, index) => (
          <li key={name}>
            <NavItem
              active={active === name}
              href="javascript:void 0"
              orientation="vertical"
              onClick={() => setActive(name)}
              onExpand={() => {
                if (expanded.includes(name)) {
                  setExpanded(expanded.filter((item) => item !== name));
                } else {
                  setExpanded([...expanded, name]);
                }
              }}
              parent={subNav?.length > 0}
              expanded={expanded.includes(name)}
            >
              {name}
            </NavItem>
            {expanded.includes(name) && (
              <ul
                style={{
                  listStyle: "none",
                  paddingLeft: 0,
                  width: 500,
                }}
              >
                {subNav.map((item, index) => {
                  const itemValue = `${name} - ${item}`;
                  return (
                    <li key={itemValue}>
                      <NavItem
                        active={active === itemValue}
                        href="javascript:void 0"
                        orientation="vertical"
                        onClick={() => setActive(itemValue)}
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
