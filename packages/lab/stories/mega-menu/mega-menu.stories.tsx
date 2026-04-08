import { NotificationIcon, SwapIcon } from "@salt-ds/icons";
import {
  MegaMenuContainer,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
} from "@salt-ds/lab";
import {
  NavigationItem,
  StackLayout,
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import "./mega-menu.stories.css";

export default {
  title: "Lab/Mega Menu",
  parameters: {
    layout: "padded",
  },
  component: MegaMenuContainer,
};

const menuItems = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"];

const DefaultTemplate: StoryFn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(menuItems[0]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const closeMegaMenu = () => {
    setIsOpen(false);
  };

  const handleNavigationItemClick = (item: string, event: React.MouseEvent) => {
    event.preventDefault();
    setActiveItem(item);
    setIsOpen(true);
  };

  return (
    <div style={{ width: "100%" }}>
      <nav>
        <StackLayout as="ul" direction="row" gap={1}>
          {menuItems.map((item) => (
            <li key={item}>
              <NavigationItem
                active={activeItem === item && isOpen}
                href="#"
                onClick={(event) => handleNavigationItemClick(item, event)}
              >
                {item}
              </NavigationItem>
            </li>
          ))}
        </StackLayout>
      </nav>

      {isOpen && (
        <MegaMenuContainer style={{ width: "fit-content" }}>
          {Array.from({ length: 2 }, (_, groupIndex) => (
            <MegaMenuGroup key={groupIndex}>
              <MegaMenuHeader onClick={closeMegaMenu}>
                Menu Header {groupIndex + 1}
              </MegaMenuHeader>
              {Array.from({ length: 10 }, (_, itemIndex) => (
                <MegaMenuItem key={itemIndex} onClick={closeMegaMenu}>
                  Mega menu item
                </MegaMenuItem>
              ))}
            </MegaMenuGroup>
          ))}
        </MegaMenuContainer>
      )}
    </div>
  );
};

export const Default = DefaultTemplate.bind({});

const IconsTemplate: StoryFn = () => {
  const SwapElement = () => (
    <div className="slot">
      <SwapIcon aria-hidden />
    </div>
  );

  return (
    <MegaMenuContainer>
      <MegaMenuGroup>
        <MegaMenuHeader>Menu Header</MegaMenuHeader>
        <MegaMenuItem>
          <NotificationIcon aria-hidden />
          Mega menu item
          <SwapElement />
        </MegaMenuItem>
        <MegaMenuItem>
          <NotificationIcon aria-hidden />
          Mega menu item
          <SwapElement />
        </MegaMenuItem>
        <MegaMenuItem>
          <NotificationIcon aria-hidden />
          Mega menu item
          <SwapElement />
        </MegaMenuItem>
      </MegaMenuGroup>
    </MegaMenuContainer>
  );
};

export const Icons = IconsTemplate.bind({});
