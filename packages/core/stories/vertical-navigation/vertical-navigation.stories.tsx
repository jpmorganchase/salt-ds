import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
  Divider,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  Tooltip,
  useId,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemExpansionIcon,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import { type ReactNode, version as reactVersion, useState } from "react";
import { Link, MemoryRouter, useLocation } from "react-router";
import "./vertical-navigation.stories.css";
import {
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  HelpCircleSolidIcon,
  MessageSolidIcon,
  MicroMenuIcon,
  StorageSolidIcon,
  UserGroupSolidIcon,
} from "@salt-ds/icons";
import { clsx } from "clsx";

const isLegacyReact =
  reactVersion.startsWith("16") || reactVersion.startsWith("17");

export default {
  title: "Core/Vertical Navigation",
  component: VerticalNavigation,
  decorators: [
    (Story) => {
      return (
        <MemoryRouter useTransitions={!isLegacyReact}>
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

const simpleWithLongLabels: NavItem[] = [
  {
    title: "This is a very long Home title to showcase wrapping and truncation",
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

export const Basic: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <VerticalNavigation {...args}>
      {simple.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
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
    icon: <HelpCircleSolidIcon aria-hidden />,
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
        <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
          {icon ? item.icon : undefined}
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const CollapsibleSubmenu: StoryFn<typeof VerticalNavigation> = (
  args,
) => {
  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const CollapsibleMultiLevelSubmenu: StoryFn<
  typeof VerticalNavigation
> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const SubmenuFlat: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
          {item.children && (
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <VerticalNavigationItem
                  key={child.title}
                  active={location.pathname === child.href}
                >
                  <VerticalNavigationItemContent>
                    <VerticalNavigationItemTrigger
                      render={<Link to={child.href} />}
                    >
                      <VerticalNavigationItemLabel>
                        {child.title}
                      </VerticalNavigationItemLabel>
                    </VerticalNavigationItemTrigger>
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
            <VerticalNavigationItemTrigger
              render={<Link to={item.href} />}
              id={itemId}
            >
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
            <CollapsibleTrigger>
              <Button
                id={actionId}
                aria-labelledby={clsx(itemId, actionId)}
                aria-label="Subpages"
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
        <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const WithExpandButton: StoryFn<typeof VerticalNavigation> = (args) => {
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
            <VerticalNavigationItemTrigger
              render={<Link to={item.href} />}
              id={itemId}
            >
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
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
                aria-label="Subpages"
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
        <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
          <VerticalNavigationItemLabel>
            {item.title}
          </VerticalNavigationItemLabel>
        </VerticalNavigationItemTrigger>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const WithMultipleActions: StoryFn<typeof VerticalNavigation> = (
  args,
) => {
  return (
    <VerticalNavigation {...args}>
      {multiLevel.map((item) => (
        <MultiActionItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const WithIcon: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation {...args}>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} icon />
      ))}
    </VerticalNavigation>
  );
};

const simpleWithIcons: NavItem[] = [
  {
    title: "Products",
    href: "/products",
    icon: <StorageSolidIcon aria-hidden />,
  },
  {
    title: "About Us",
    href: "/about",
    icon: <UserGroupSolidIcon aria-hidden />,
  },
  {
    title: "Support",
    href: "/support",
    icon: <HelpCircleSolidIcon aria-hidden />,
  },
  {
    title: "Contact",
    href: "/contact",
    icon: <MessageSolidIcon aria-hidden />,
  },
];

export const CollapsibleNavigation: StoryFn<typeof VerticalNavigation> = (
  args,
) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [animating, setAnimating] = useState(false);

  const showLabels = !collapsed || animating;

  // Keep the accessible name static so it isn't re-announced on toggle;
  // aria-expanded conveys the state.
  const toggleLabel = "Labels";

  // With reduced motion there is no transition, so no animation to track.
  const startWidthAnimation = () => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    setAnimating(!prefersReducedMotion);
  };

  const handleToggle = () => {
    startWidthAnimation();
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={clsx("collapsibleNavigationExample", {
        "collapsibleNavigationExample-collapsed": collapsed,
        "collapsibleNavigationExample-animating": animating,
      })}
    >
      {/* The sidebar is the navigation landmark, so the toggle is part of it. */}
      <nav className="collapsibleNavigationExample-sidebar" aria-label="Main">
        {/* aria-hidden so the tooltip isn't also announced as a description;
            it duplicates the accessible name. */}
        <Tooltip
          content={<span aria-hidden>{toggleLabel}</span>}
          placement="right"
        >
          <Button
            appearance="transparent"
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            onClick={handleToggle}
          >
            {collapsed ? (
              <DoubleChevronRightIcon aria-hidden />
            ) : (
              <DoubleChevronLeftIcon aria-hidden />
            )}
          </Button>
        </Tooltip>
        {/* Demoted to avoid a nested landmark inside the sidebar nav. */}
        <VerticalNavigation
          role="presentation"
          {...args}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "width"
            ) {
              setAnimating(false);
            }
          }}
        >
          {simpleWithIcons.map((item) => (
            <VerticalNavigationItem
              key={item.title}
              active={location.pathname === item.href}
            >
              <VerticalNavigationItemContent>
                {/* aria-hidden so the tooltip isn't also announced as a
                    description; it duplicates the accessible name. */}
                <Tooltip
                  content={<span aria-hidden>{item.title}</span>}
                  disabled={!collapsed}
                  placement="right"
                >
                  <VerticalNavigationItemTrigger
                    render={<Link to={item.href} />}
                  >
                    {item.icon}
                    {/* Hidden once collapsed, but kept in the DOM for the
                        item's accessible name. */}
                    <VerticalNavigationItemLabel
                      className={showLabels ? undefined : "visuallyHidden"}
                    >
                      {item.title}
                    </VerticalNavigationItemLabel>
                  </VerticalNavigationItemTrigger>
                </Tooltip>
              </VerticalNavigationItemContent>
            </VerticalNavigationItem>
          ))}
        </VerticalNavigation>
      </nav>
      {/* Placeholder page content */}
      <div className="collapsibleNavigationExample-content">
        <div className="collapsibleNavigationExample-heading" />
        <div className="collapsibleNavigationExample-block" />
        <div className="collapsibleNavigationExample-block" />
      </div>
    </div>
  );
};

CollapsibleNavigation.parameters = {
  layout: "padded",
};

export const WithWrapping: StoryFn<typeof VerticalNavigation> = (args) => {
  const location = useLocation();

  return (
    <VerticalNavigation style={{ width: "8ch" }} {...args}>
      {simpleWithLongLabels.map((item) => (
        <VerticalNavigationItem
          key={item.title}
          active={location.pathname === item.href}
        >
          <VerticalNavigationItemContent>
            <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
              <VerticalNavigationItemLabel>
                {item.title}
              </VerticalNavigationItemLabel>
            </VerticalNavigationItemTrigger>
          </VerticalNavigationItemContent>
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
  );
};

function ItemWithTruncation(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();
  const [truncated, setTruncated] = useState(false);

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        <Tooltip content={item.title} disabled={!truncated} placement="right">
          <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
            <VerticalNavigationItemLabel
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
              ref={(element) => {
                if (element) {
                  setTruncated(element.scrollWidth > element.clientWidth);
                }
              }}
            >
              {item.title}
            </VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </Tooltip>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const WithTruncation: StoryFn<typeof VerticalNavigation> = (args) => {
  return (
    <VerticalNavigation style={{ width: "8ch" }} {...args}>
      {simpleWithLongLabels.map((item) => (
        <ItemWithTruncation item={item} key={item.title} />
      ))}
    </VerticalNavigation>
  );
};
