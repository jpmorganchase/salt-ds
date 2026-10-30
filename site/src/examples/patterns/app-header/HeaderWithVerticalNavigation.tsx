import {
  BorderItem,
  BorderLayout,
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";
import { GithubIcon, StackoverflowIcon } from "@salt-ds/icons";
import { useState } from "react";
import { DesktopAppHeader } from "./AppHeader";

export const HeaderWithVerticalNavigation = () => {
  const items = ["Home", "About", "Services", "Contact"];
  const utilities = [
    { icon: <StackoverflowIcon aria-hidden />, key: "Stack Overflow" },
    { icon: <GithubIcon aria-hidden />, key: "GitHub" },
  ];
  const navItems = ["Overview", "Data analysis", "Reports", "Settings"];
  const [active, setActive] = useState(navItems[0]);

  return (
    <BorderLayout style={{ width: "100%" }}>
      <BorderItem position="north">
        <DesktopAppHeader
          items={items}
          utilities={utilities}
          showNavigation={false}
        />
      </BorderItem>
      <BorderItem
        position="west"
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
          width: "240px",
          padding: "var(--salt-spacing-200)",
        }}
      >
        <aside>
          <nav aria-label="Primary">
            <StackLayout
              as="ul"
              gap="var(--salt-spacing-fixed-100)"
              style={{ listStyle: "none", margin: 0, padding: 0 }}
            >
              {navItems.map((item) => (
                <li key={item} style={{ listStyle: "none" }}>
                  <NavigationItem
                    active={active === item}
                    href="#"
                    orientation="vertical"
                    onClick={(event) => {
                      event.preventDefault();
                      setActive(item);
                    }}
                  >
                    {item}
                  </NavigationItem>
                </li>
              ))}
            </StackLayout>
          </nav>
        </aside>
      </BorderItem>
      <BorderItem
        position="center"
        style={{
          marginTop: "calc(var(--salt-size-base) + var(--salt-spacing-200))",
        }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            style={{
              padding: "var(--salt-spacing-400)",
              margin: "var(--salt-spacing-400)",
              backgroundColor: "var(--salt-container-secondary-background)",
            }}
          />
        ))}
      </BorderItem>
    </BorderLayout>
  );
};
