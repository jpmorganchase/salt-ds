import {
  BorderItem,
  BorderLayout,
  Button,
  H3,
  StackLayout,
  Text,
  Tooltip,
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/core";
import { DoubleChevronLeftIcon, DoubleChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { useState } from "react";
import { Link, useLocation } from "react-router";
// refer to https://github.com/jpmorganchase/salt-ds/blob/main/site/src/examples/vertical-navigation/CollapsibleNavigation.module.css
import styles from "./CollapsibleNavigation.module.css";
import { flatNavData, type Item } from "./data";
import { MockHistory } from "./MockHistory";

function NavItem({ item, collapsed }: { item: Item; collapsed: boolean }) {
  const location = useLocation();

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
      <VerticalNavigationItemContent>
        {/* aria-hidden so the tooltip isn't announced as a duplicate of the
            item's accessible name. */}
        <Tooltip
          content={<span aria-hidden>{item.title}</span>}
          disabled={!collapsed}
          placement="right"
        >
          <VerticalNavigationItemTrigger render={<Link to={item.href} />}>
            {item.icon}
            {/* Faded out and clipped by CSS once collapsed, but kept in the
                DOM for the item's accessible name. */}
            <VerticalNavigationItemLabel>
              {item.title}
            </VerticalNavigationItemLabel>
          </VerticalNavigationItemTrigger>
        </Tooltip>
      </VerticalNavigationItemContent>
    </VerticalNavigationItem>
  );
}

export const CollapsibleNavigation = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Static so it isn't re-announced on toggle; aria-expanded conveys the state.
  const toggleLabel = "Labels";

  return (
    <MockHistory>
      <BorderLayout columnGap={2} rowGap={2}>
        <BorderItem position="north">
          <div
            style={{
              background: "var(--salt-container-secondary-background)",
              borderBottom:
                "var(--salt-size-fixed-100) var(--salt-separable-borderStyle) var(--salt-separable-primary-borderColor)",
              height: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
            }}
          />
        </BorderItem>
        <BorderItem position="west">
          {/* The sidebar is the navigation landmark, so the toggle is part of
              it. */}
          <StackLayout
            as="nav"
            aria-label="Collapsible sidebar"
            align="start"
            gap={1}
          >
            <Tooltip
              content={<span aria-hidden>{toggleLabel}</span>}
              placement="right"
            >
              <Button
                appearance="transparent"
                aria-expanded={!collapsed}
                aria-label={toggleLabel}
                onClick={() => setCollapsed(!collapsed)}
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
              appearance="bordered"
              className={clsx(styles.nav, { [styles.collapsed]: collapsed })}
            >
              {flatNavData.map((item) => (
                <NavItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </VerticalNavigation>
          </StackLayout>
        </BorderItem>
        <BorderItem position="center">
          <StackLayout direction="column" gap={1}>
            <H3 styleAs="h1">Collapsible navigation</H3>
            <Text>
              Collapse the navigation to give the main content more room. While
              collapsed, each item is identified by its icon and a tooltip.
            </Text>
            <Text>
              This placeholder text is provided to illustrate how content will
              appear within the component. The sentences are intended for
              demonstration only and do not convey specific information. Generic
              examples like this help review layout, spacing, and overall
              design. Adjust the wording as needed to fit your use case or
              display requirements.
            </Text>
          </StackLayout>
        </BorderItem>
      </BorderLayout>
    </MockHistory>
  );
};
