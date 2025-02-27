import { NavigationItem, Divider } from "@salt-ds/core";
import {
  HomeIcon,
  BankIcon,
  SwapIcon,
  MoveAllIcon,
  RunReportIcon,
  DocumentIcon,
  LightIcon,
  UserAdminIcon,
} from "@salt-ds/icons";
import { useState } from "react";

import "../Dashboard.css";

type NavItem = {
  name: string;
  Icon: React.FC;
  route?: string;
  subNav?: string[];
};

export default function VerticalNav() {
  const navItems = [
    {
      name: "Home",
      Icon: HomeIcon,
      route: "/cb-dashboard/home",
    },
    {
      name: "Accounts",
      Icon: BankIcon,
      route: "/cb-dashboard/accounts",
    },
    {
      name: "Transactions",
      Icon: SwapIcon,
    },
    {
      name: "Money movement",
      Icon: MoveAllIcon,
      subNav: ["Money In", "Money Out", "Payment protection"],
    },
    {
      name: "Reports",
      Icon: RunReportIcon,
    },
    {
      name: "Document center",
      Icon: DocumentIcon,
    },
    {
      name: "Innovation economy",
      Icon: LightIcon,
      subNav: ["Connected banking", "Capital connect", "Industry Insights"],
    },
  ];
  const adminsNavItems = [
    {
      name: "Administration",
      Icon: UserAdminIcon,
      subNav: [
        "Profile",
        "Account management",
        "Products and services",
        "Users and roles",
        "Audit log",
      ],
    },
  ];
  const [active, setActive] = useState(navItems[0].name);

  const [expanded, setExpanded] = useState<string[]>([
    "Money movement",
    "Innovation economy",
    "Administration",
  ]);

  const renderNavItems = (items: NavItem[]) => {
    return items.map(({ name, subNav, Icon, route }) => (
      <li key={name}>
        <NavigationItem
          active={
            active === name ||
            (!expanded.includes(name) &&
              subNav?.some((item) => active === item))
          }
          blurActive={
            !expanded.includes(name) && subNav?.some((item) => active === item)
          }
          href={route ?? "/cb-dashboard/home"}
          orientation="vertical"
          onClick={() => {
            setActive(name);
          }}
          onExpand={() => {
            if (expanded.includes(name)) {
              setExpanded(expanded.filter((item) => item !== name));
            } else {
              setExpanded([...expanded, name]);
            }
          }}
          parent={subNav && subNav.length > 0}
          expanded={expanded.includes(name)}
        >
          <Icon />
          {name}
        </NavigationItem>
        {expanded.includes(name) && (
          <ul>
            {subNav?.map((itemValue) => {
              return (
                <li key={itemValue}>
                  <NavigationItem
                    active={active === itemValue}
                    href="#"
                    orientation="vertical"
                    onClick={() => {
                      setActive(itemValue);
                    }}
                    level={1}
                  >
                    {itemValue}
                  </NavigationItem>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <nav className={"sideNav"}>
      <ul>
        {renderNavItems(navItems)}
        <Divider variant="tertiary" />
        {renderNavItems(adminsNavItems)}
      </ul>
    </nav>
  );
}
