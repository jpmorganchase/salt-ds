import {
  Avatar,
  Button,
  FlexItem,
  FlexLayout,
  FlowLayout,
  Label,
  Menu,
  MenuItem,
  MenuPanel,
  MenuTrigger,
  NavigationItem,
  StackLayout,
  useAvatarImage,
} from "@salt-ds/core";
import { MicroMenuIcon, UserGroupSolidIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import type { ReactNode } from "react";
import persona1 from "../assets/avatar.png";
import logo from "../assets/logo.svg";

export default {
  title: "Core/Avatar",
  component: Avatar,
} as Meta<typeof Avatar>;
const sizes = [1, 2, 3, 4] as const;

const Template: StoryFn<typeof Avatar> = (args) => {
  return <Avatar {...args} />;
};

export const Default = Template.bind({});

export const Sizes: StoryFn<typeof Avatar> = (args) => {
  return (
    <FlowLayout gap={7} align="end">
      {sizes.map((size) => (
        <StackLayout key={size} align="center">
          <Avatar {...args} key={size} size={size} />
          <Label>size: {size}</Label>
        </StackLayout>
      ))}
    </FlowLayout>
  );
};

export const Fallback: StoryFn<typeof Avatar> = ({ size }) => {
  return (
    <FlowLayout>
      <Avatar size={size} name="Alex Brailescu" src={persona1} />
      <Avatar size={size} src="bad_url" name="Peter Piper" />
      <Avatar size={size} src="bad_url" />
    </FlowLayout>
  );
};

Fallback.args = {
  size: 3,
};

export const AlternativeIcon = Template.bind({});
AlternativeIcon.args = {
  fallbackIcon: <UserGroupSolidIcon aria-hidden />,
};

const CustomSVG = (
  <svg viewBox="0 0 12 12">
    <path d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0zm-7.207 4.853c-.7-.92-1.199-1.877-1.488-2.853H1.416a5.008 5.008 0 0 0 3.377 2.853zM1.1 7h1.984a6.978 6.978 0 0 1-.002-2H1.099a4.995 4.995 0 0 0 0 2zm.316-3h1.887c.288-.976.787-1.932 1.488-2.853A5.008 5.008 0 0 0 1.417 4zm2.936 0h3.262c-.329-.911-.876-1.819-1.655-2.709C5.197 2.181 4.666 3.09 4.352 4zm4.577 3H10.9a4.995 4.995 0 0 0 0-2H8.903a6.93 6.93 0 0 1 .027 2zm-1.634 3.831A5.01 5.01 0 0 0 10.584 8H8.722c-.273.968-.752 1.917-1.428 2.831zM7.677 8H4.356c.325.942.883 1.882 1.686 2.802C6.827 9.881 7.369 8.941 7.678 8zm.992-4h1.915A5.01 5.01 0 0 0 7.12 1.126C7.845 2.052 8.364 3.015 8.669 4zM4.095 5a5.94 5.94 0 0 0 .001 2h3.822a5.904 5.904 0 0 0-.031-2H4.094z" />
  </svg>
);

export const WithCustomSvg = Template.bind({});
WithCustomSvg.args = {
  children: CustomSVG,
};

export const WithCustomImg: StoryFn<typeof Avatar> = () => {
  const src = "bad_url";
  const status = useAvatarImage({ src });

  let children: ReactNode = "PP";
  if (status === "loaded") {
    children = <img src={src} alt="" />;
  }

  return (
    <Avatar name="Peter Piper" size={3}>
      {children}
    </Avatar>
  );
};

const items = ["Home", "About", "Services", "Contact", "Blog"];

export const InteractiveAvatar = () => {
  return (
    <header>
      <FlexLayout
        style={{
          paddingLeft: "var(--salt-spacing-300)",
          paddingRight: "var(--salt-spacing-300)",
          backgroundColor: "var(--salt-container-primary-background)",
          position: "fixed",
          width: "100%",
          borderBottom:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)",
        }}
        justify="space-between"
        gap={3}
      >
        <FlexItem align="center">
          <img
            alt="logo"
            src={logo}
            style={{
              display: "block",
              height: "calc(var(--salt-size-base) - var(--salt-spacing-150))",
            }}
          />
        </FlexItem>
        <nav>
          <ul
            style={{
              display: "flex",
              listStyle: "none",
              padding: "0",
              margin: "0",
            }}
          >
            {items?.map((item) => (
              <li key={item}>
                <NavigationItem href="#">{item}</NavigationItem>
              </li>
            ))}
          </ul>
        </nav>
        <FlexItem align="center">
          <Menu>
            <MenuTrigger>
              <Avatar size={1} render={<button />} />
            </MenuTrigger>
            <MenuPanel>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Log out</MenuItem>
            </MenuPanel>
          </Menu>
        </FlexItem>
      </FlexLayout>
    </header>
  );
};

InteractiveAvatar.parameters = {
  layout: "fullscreen",
};

export const LinkAvatar = Template.bind({});
LinkAvatar.args = {
  render: <a href="#" />,
};
