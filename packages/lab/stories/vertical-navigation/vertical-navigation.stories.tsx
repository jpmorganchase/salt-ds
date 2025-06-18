import { Button, Divider, H4, StackLayout } from "@salt-ds/core";
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

import {
  Link,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import type { ComponentPropsWithoutRef } from "react";
import "./vertical-navigation.stories.css";

const memoryHistory = createMemoryHistory({
  initialEntries: ["/"], // Pass your initial url
});

export default {
  title: "Lab/Vertical Navigation",
  component: VerticalNavigation,
  decorators: [
    (Story) => {
      const rootRoute = createRootRoute({
        component: () => <Story />,
      });

      const routeTree = rootRoute;

      const router = createRouter({
        routeTree,
        history: memoryHistory,
      });

      return <RouterProvider router={router} />;
    },
  ],
} as Meta<typeof VerticalNavigation>;

type NavItem = {
  title: string;
  href: string;
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

function TanstackTrigger(props: ComponentPropsWithoutRef<typeof Link>) {
  const { to, ...rest } = props;

  // @ts-ignore
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
            <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
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
    children: [
      { title: "Widgets", href: "/products/widgets" },
      { title: "Gadgets", href: "/products/gadgets" },
      { title: "Doodads", href: "/products/doodads" },
    ],
  },
  {
    title: "About Us",
    href: "/about",
    children: [
      { title: "Our Story", href: "/about/story" },
      { title: "Our Team", href: "/about/team" },
      { title: "Press", href: "/about/press" },
    ],
  },
  {
    title: "Support",
    href: "/support",
  },
  {
    title: "Contact",
    href: "/contact",
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

function NestedItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<VerticalNavigationItemTrigger />}>
              {item.title} <VerticalNavigationItemExpansionIcon />
            </CollapsibleTrigger>
          </VerticalNavigationItemContent>
          <CollapsiblePanel>
            <VerticalNavigationSubMenu>
              {item.children.map((child) => (
                <NestedItem key={child.title} item={child} />
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
        <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
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
            <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
          </VerticalNavigationItemContent>
          {item.children && (
            <>
              <VerticalNavigationSubMenu>
                {item.children.map((child) => (
                  <VerticalNavigationItem
                    key={child.title}
                    active={location.pathname === child.href}
                  >
                    <VerticalNavigationItemContent>
                      <TanstackTrigger to={child.href}>
                        {child.title}
                      </TanstackTrigger>
                    </VerticalNavigationItemContent>
                  </VerticalNavigationItem>
                ))}
              </VerticalNavigationSubMenu>
              <Divider variant="tertiary" />
            </>
          )}
        </VerticalNavigationItem>
      ))}
    </VerticalNavigation>
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
            <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
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
        <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
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
                <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
              </VerticalNavigationItemContent>
            </VerticalNavigationItem>
          ))}
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

function DualActionItem(props: { item: NavItem }) {
  const { item } = props;

  const location = useLocation();

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
          <VerticalNavigationItemContent>
            <CollapsibleTrigger render={<TanstackTrigger to={item.href} />}>
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
        <TanstackTrigger to={item.href}>{item.title}</TanstackTrigger>
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
