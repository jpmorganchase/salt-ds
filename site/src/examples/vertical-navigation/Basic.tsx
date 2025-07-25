import { StackLayout } from "@salt-ds/core";
import {
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
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
    </VerticalNavigationItem>
  );
}

export const Basic = () => {
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
