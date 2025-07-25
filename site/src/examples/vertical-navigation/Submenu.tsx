import { Divider, StackLayout } from "@salt-ds/core";
import {
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
  VerticalNavigationSubMenu,
} from "@salt-ds/lab";
import { Link, useLocation } from "react-router";
import { type Item, navData } from "./data";
import { MockHistory } from "./MockHistory";

function NavItem({ item }: { item: Item }) {
  const location = useLocation();

  return (
    <VerticalNavigationItem active={location.pathname === item.href}>
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
  );
}

export const Submenu = () => {
  return (
    <StackLayout direction="row" gap={6}>
      <MockHistory>
        <VerticalNavigation appearance="indicator" style={{ minWidth: "30ch" }}>
          {navData.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation appearance="bordered" style={{ minWidth: "30ch" }}>
          {navData.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
