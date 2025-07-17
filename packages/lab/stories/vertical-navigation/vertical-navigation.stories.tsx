import {
  Button,
  Divider,
  H4,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  StackLayout,
} from "@salt-ds/core";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { type ComponentPropsWithoutRef, type ReactNode, useState } from "react";
import { Link, MemoryRouter, useLocation } from "react-router";
import "./vertical-navigation.stories.css";
import {
  HelpSolidIcon,
  MessageSolidIcon,
  MicroMenuIcon,
  StorageSolidIcon,
  UserGroupSolidIcon,
} from "@salt-ds/icons";

export default {
  title: "Lab/Vertical Navigation",
  component: VerticalNavigation,
  decorators: [
    (Story) => {
      return (
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      );
    },
  ],
} as Meta<typeof VerticalNavigation>;

type NavItem = {
  title: string;
  href: string;
  icon?: ReactNode;
  children?: NavItem[];
};

const simple: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "About Us",
    href: "/about",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Careers",
    href: "/careers",
  },
];

function MockedTrigger(props: ComponentPropsWithoutRef<typeof Link>) {
  const { to, ...rest } = props;

  return <VerticalNavigationItemTrigger render={<Link to={to} />} {...rest} />;
}

export const Default: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <VerticalNavigation {...args}>
      {simple.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
};

const nested: NavItem[] = [
  {
    title: "Products",
    href: "/products",
    icon: <StorageSolidIcon aria-hidden />,
    children: [
      { title: "Widgets", href: "/products/widgets" },
      { title: "Gadgets", href: "/products/gadgets" },
      { title: "Doodads", href: "/products/doodads" },
    ],
  },
  {
    title: "About Us",
    href: "/about",
    icon: <UserGroupSolidIcon aria-hidden />,
    children: [
      { title: "Our Story", href: "/about/story" },
      { title: "Our Team", href: "/about/team" },
      { title: "Press", href: "/about/press" },
    ],
  },
  {
    title: "Support",
    href: "/support",
    icon: <HelpSolidIcon aria-hidden />,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: <MessageSolidIcon aria-hidden />,
  },
];

const multiLevel: NavItem[] = [
  {
    title: "Solutions",
    href: "/solutions",
    children: [
      {
        title: "By Industry",
        href: "/solutions/by-industry",
        children: [
          { title: "Healthcare", href: "/solutions/by-industry/healthcare" },
          { title: "Finance", href: "/solutions/by-industry/finance" },
          { title: "Education", href: "/solutions/by-industry/education" },
        ],
      },
      {
        title: "By Business Size",
        href: "/solutions/by-size",
        children: [
          { title: "Startups", href: "/solutions/by-size/startups" },
          {
            title: "Small & Medium Business",
            href: "/solutions/by-size/smb",
          },
          { title: "Enterprise", href: "/solutions/by-size/enterprise" },
        ],
      },
    ],
  },
  {
    title: "Company",
    href: "/company",
    children: [
      { title: "About Us", href: "/company/about" },
      { title: "Careers", href: "/company/careers" },
      { title: "Press Center", href: "/company/press" },
    ],
  },
];

function NestedItem(props: { item: NavItem; icon?: boolean }) {
  const { item, icon } = props;

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible onOpenChange={(_, expanded) => setCollapsed(!expanded)}>
        <VerticalNavigationItem
          active={location.pathname.startsWith(item.href) && collapsed}
        >
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<VerticalNavigationItemTrigger />}>
              {icon ? item.icon : undefined} {item.title}{" "}
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <NestedItem key={child.title} item={child} icon={icon} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>
          {icon ? item.icon : undefined} {item.title}
        </MockedTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const NestedCollapse: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const MultipleLevelsCollapse: StoryFn<typeof VerticalNavigation> = (
  args,
) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const Nested: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
          </VerticalNavigationItemContent>
          {item.children && (
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <VerticalNavigationItem
                  key={child.title}
                  active={location.pathname === child.href}
                >
                  <VerticalNavigationItemContent>
                    <MockedTrigger to={child.href}>{child.title}</MockedTrigger>
                  </VerticalNavigationItemContent>
                </VerticalNavigationItem>
              ))}
              <Divider variant="tertiary" />
            </VerticalNavigationSubMenu>
          )}
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
};

function ExpandButtonItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
            <CollapsibleTrigger render={<Button appearance="transparent" />}>
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <ExpandButtonItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const ExpandButton: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <ExpandButtonItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const Groups: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <StackLayout gap={2}>
      <StackLayout gap={0.5}>
        <H4 style={{ margin: 0 }} color="secondary">
          Group One
        </H4>
        <VerticalNavigation {...args}>
          {simple.map((item) => (
            <VerticalNavigationItem
              key={item.title}
              active={location.pathname === item.href}
            >
              <VerticalNavigationItemContent>
                <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
              </VerticalNavigationItemContent>
            </VerticalNavigationItem>
          ))}
          <Divider variant="tertiary" />
        </VerticalNavigation>
      </StackLayout>
      <StackLayout gap={0.5}>
        <H4 style={{ margin: 0 }} color="secondary">
          Group Two
        </H4>
        <VerticalNavigation {...args}>
          {nested.map((item) => (
            <NestedItem key={item.title} item={item} />
          ))}
        </VerticalNavigation>
      </StackLayout>
    </StackLayout>
  );
};

function MultiActionItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
            <Menu>
              <MenuTrigger>
                <Button appearance="transparent" aria-label="Open Menu">
                  <MicroMenuIcon aria-hidden />
                </Button>
              </MenuTrigger>
              <MenuPanel>
                <MenuItem
                  onClick={() => {
                    alert("Copy");
                  }}
                >
                  Copy
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    alert("Paste");
                  }}
                >
                  Paste
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    alert("Export");
                  }}
                >
                  Export
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    alert("Settings");
                  }}
                >
                  Settings
                </MenuItem>
              </MenuPanel>
            </Menu>
            <CollapsibleTrigger render={<Button appearance="transparent" />}>
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <MultiActionItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const MultiAction: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <MultiActionItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

function DualActionItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible open={location.pathname.startsWith(item.href)}>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<MockedTrigger to={item.href} />}>
              {item.title}
              <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <DualActionItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </VerticalNavigationItem>
      </Collapsible>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>{item.title}</MockedTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const DualAction: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <DualActionItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const NestedCollapseWithIcon: StoryFn<typeof VerticalNavigation> = (
  args,
) => {
  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} icon />
      ))}
    </VerticalNavigation>
  );
};
