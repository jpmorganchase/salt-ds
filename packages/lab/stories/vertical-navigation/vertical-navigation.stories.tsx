import { Button } from "@salt-ds/core";
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

const simple = [
  {
    title: "Level 0 - A",
    href: "/level0-a",
  },
  {
    title: "Level 0 - B",
    href: "/level0-b",
  },
  {
    title: "Level 0 - C",
    href: "/level0-c",
  },
  {
    title: "Level 0 - D",
    href: "/level0-d",
  },
];

function TanstackTrigger(props) {
  return <VerticalNavigationItemTrigger render={<Link />} {...props} />;
}

export const Default: StoryFn<typeof VerticalNavigation> = () => {
  const location = useLocation();

  return (
    <VerticalNavigation>
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

const nested = [
  {
    title: "Level 0 - A",
    href: "/level0-a",
    children: [
      { title: "Level 1 - A", href: "/level1-a" },
      { title: "Level 1 - B", href: "/level1-b" },
    ],
  },
  {
    title: "Level 0 - B",
    href: "/level0-b",
  },
];

const multiLevel = [
  {
    title: "Level 0 - A",
    href: "/level0-a",
    children: [
      { title: "Level 1 - A", href: "/level1-a" },
      { title: "Level 1 - B", href: "/level1-b" },
    ],
  },
  {
    title: "Level 0 - B",
    href: "/level0-b",
    children: [
      { title: "Level 1 - C", href: "/level1-c" },
      {
        title: "Level 1 - D",
        href: "/level1-d",
        children: [
          { title: "Level 2 - A", href: "/level2-a" },
          { title: "Level 2 - B", href: "/level2-b" },
          { title: "Level 2 - C", href: "/level2-c" },
        ],
      },
    ],
  },
];

function NestedItem(props) {
  const { item } = props;

  const location = useLocation();

  if (item.children?.length > 0) {
    return (
      <Collapsible>
        <VerticalNavigationItem active={location.pathname === item.href}>
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

export const NestedCollapse: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      {nested.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const MultipleLevelsCollapse: StoryFn<
  typeof VerticalNavigation
> = () => {
  return (
    <VerticalNavigation>
      {multiLevel.map((item) => (
        <NestedItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};

export const Nested: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      <VerticalNavigationItem>
        <VerticalNavigationItemContent>
          <TanstackTrigger>Level 0 - A</TanstackTrigger>
        </VerticalNavigationItemContent>
        <VerticalNavigationSubMenu>
          <VerticalNavigationItem active>
            <VerticalNavigationItemContent>
              <TanstackTrigger>Level 1 - A</TanstackTrigger>
            </VerticalNavigationItemContent>
          </VerticalNavigationItem>
          <VerticalNavigationItem>
            <VerticalNavigationItemContent>
              <TanstackTrigger>Level 1 - B</TanstackTrigger>
            </VerticalNavigationItemContent>
            <VerticalNavigationSubMenu>
              <VerticalNavigationItem>
                <VerticalNavigationItemContent>
                  <TanstackTrigger>Level 2 - A</TanstackTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
              <VerticalNavigationItem>
                <VerticalNavigationItemContent>
                  <TanstackTrigger>Level 2 - B</TanstackTrigger>
                </VerticalNavigationItemContent>
              </VerticalNavigationItem>
            </VerticalNavigationSubMenu>
          </VerticalNavigationItem>
        </VerticalNavigationSubMenu>
      </VerticalNavigationItem>
    </VerticalNavigation>
  );
};

function MultiActionItem(props) {
  const { item } = props;

  const location = useLocation();

  if (item.children?.length > 0) {
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

export const MultiAction: StoryFn<typeof VerticalNavigation> = () => {
  return (
    <VerticalNavigation>
      {multiLevel.map((item) => (
        <MultiActionItem key={item.title} item={item} />
      ))}
    </VerticalNavigation>
  );
};
