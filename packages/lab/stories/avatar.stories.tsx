import { UserGroupIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlowLayout, Label, StackLayout } from "@salt-ds/core";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { Avatar } from "@salt-ds/lab";
import persona1 from "./assets/persona1.png";

export default {
  title: "Lab/Avatar",
  component: Avatar,
} as ComponentMeta<typeof Avatar>;
const sizes = [1, 2, 3, 4] as const;

const Template: ComponentStory<typeof Avatar> = (props) => {
  return (
    <FlowLayout gap={7} align="baseline">
      {sizes.map((size) => (
        <StackLayout key={size} align="center">
          <Avatar {...props} key={size} size={size} />
          <Label>size: {size}</Label>
        </StackLayout>
      ))}
    </FlowLayout>
  );
};

export const Default = Template.bind({});

export const WithInitials = Template.bind({});
WithInitials.args = {
  name: "Alex Brailescu",
};

export const AlternativeIcon = Template.bind({});
AlternativeIcon.args = {
  fallbackIcon: <UserGroupIcon />,
};

export const WithImage = Template.bind({});
WithImage.args = {
  children: <img src={persona1} alt="Alex Brailescu" />,
};

const backgroundStyle = {
  "--saltAvatar-background": "var(--salt-color-orange-700)",
} as CSSProperties;

export const AlternativeBackground = Template.bind({});
AlternativeBackground.args = {
  style: backgroundStyle,
};

const CustomSVG = (
  <svg viewBox="0 0 12 12" role="img" aria-label="profile">
    <path d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0zm-7.207 4.853c-.7-.92-1.199-1.877-1.488-2.853H1.416a5.008 5.008 0 0 0 3.377 2.853zM1.1 7h1.984a6.978 6.978 0 0 1-.002-2H1.099a4.995 4.995 0 0 0 0 2zm.316-3h1.887c.288-.976.787-1.932 1.488-2.853A5.008 5.008 0 0 0 1.417 4zm2.936 0h3.262c-.329-.911-.876-1.819-1.655-2.709C5.197 2.181 4.666 3.09 4.352 4zm4.577 3H10.9a4.995 4.995 0 0 0 0-2H8.903a6.93 6.93 0 0 1 .027 2zm-1.634 3.831A5.01 5.01 0 0 0 10.584 8H8.722c-.273.968-.752 1.917-1.428 2.831zM7.677 8H4.356c.325.942.883 1.882 1.686 2.802C6.827 9.881 7.369 8.941 7.678 8zm.992-4h1.915A5.01 5.01 0 0 0 7.12 1.126C7.845 2.052 8.364 3.015 8.669 4zM4.095 5a5.94 5.94 0 0 0 .001 2h3.822a5.904 5.904 0 0 0-.031-2H4.094z" />
  </svg>
);

export const WithCustomSvg = Template.bind({});
WithCustomSvg.args = {
  children: CustomSVG,
};

export const ImageFallback: ComponentStory<typeof Avatar> = () => {
  const src = "bad_url";
  const alt = "profile";
  const [children, setChildren] = useState<ReactNode>(alt);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onerror = () => {
      setChildren(alt);
    };
    img.onload = () => {
      setChildren(<img src={src} alt={alt} />);
    };
  }, [src, alt]);

  return <Avatar size={3}>{children}</Avatar>;
};
