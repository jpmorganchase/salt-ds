import {
  Button,
  Divider,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  useId,
} from "@salt-ds/core";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
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
import { clsx } from "clsx";

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
            <MockedTrigger to={item.href}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </MockedTrigger>
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
      <VerticalNavigationItem
        active={location.pathname.startsWith(item.href) && collapsed}
      >
        <Collapsible onOpenChange={(_, expanded) => setCollapsed(!expanded)}>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger>
              <VerticalNavigationItemTrigger>
                {icon ? item.icon : undefined}
                <VerticalNavigationItemLabel>
                  {item.title}
                </VerticalNavigationItemLabel>
                <VerticalNavigationItemExpansionIcon />
              </VerticalNavigationItemTrigger>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <NestedItem key={child.title} item={child} icon={icon} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>
          {icon ? item.icon : undefined}
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
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
            <MockedTrigger to={item.href}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </MockedTrigger>
          </VerticalNavigationItemContent>
          {item.children && (
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <VerticalNavigationItem
                  key={child.title}
                  active={location.pathname === child.href}
                >
                  <VerticalNavigationItemContent>
                    <MockedTrigger to={child.href}>
                      <VerticalNavigationItemLabel>
                        {child.title}
                      </VerticalNavigationItemLabel>
                    </MockedTrigger>
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

  const itemId = useId();
  const actionId = useId();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <VerticalNavigationItem active={location.pathname === item.href}>
        <Collapsible>
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href} id={itemId}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </MockedTrigger>
            <CollapsibleTrigger>
              <Button
                id={actionId}
                aria-labelledby={clsx(actionId, itemId)}
                aria-label="Expand"
                appearance="transparent"
              >
                <VerticalNavigationItemExpansionIcon />
              </Button>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <ExpandButtonItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </MockedTrigger>
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

function MultiActionItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  const itemId = useId();
  const actionId = useId();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <VerticalNavigationItem active={location.pathname === item.href}>
        <Collapsible>
          <VerticalNavigationItemContent>
            <MockedTrigger to={item.href} id={itemId}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </MockedTrigger>
            <Menu>
              <MenuTrigger>
                <Button appearance="transparent" aria-labelledby={itemId}>
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
            <CollapsibleTrigger>
              <Button
                id={actionId}
                aria-labelledby={clsx(itemId, actionId)}
                aria-label="Sub list"
                appearance="transparent"
              >
                <VerticalNavigationItemExpansionIcon />
              </Button>
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <MultiActionItem key={child.title} item={child} />
              ))}
            </VerticalNavigationSubMenu>
          </CollapsiblePanel>
        </Collapsible>
      </VerticalNavigationItem>
    );
  }

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <MockedTrigger to={item.href}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </MockedTrigger>
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
