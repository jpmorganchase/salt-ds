import { StackLayout } from "@salt-ds/core";
import {
  VerticalNavigation,
  VerticalNavigationItem,
  VerticalNavigationItemContent,
  VerticalNavigationItemLabel,
  VerticalNavigationItemTrigger,
} from "@salt-ds/lab";
import { Link, useLocation } from "react-router";
import { MockHistory } from "./MockHistory";

type NavItem = {
  title: string;
  href: string;
  children?: NavItem[];
};

const items: NavItem[] = [
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
    title: "Support",
    href: "/support",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

function NavItem({ item }: { item: NavItem }) {
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
          {items.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
      <MockHistory>
        <VerticalNavigation appearance="bordered" style={{ minWidth: "30ch" }}>
          {items.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </VerticalNavigation>
      </MockHistory>
    </StackLayout>
  );
};
