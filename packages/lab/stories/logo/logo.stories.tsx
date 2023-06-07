import { Link, Text } from "@salt-ds/core";
import { Logo, LogoImage, LogoSeparator } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

export const Default: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo} />
  </Logo>
);

export const ImageAndText: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo} />
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const LinkLogo: ComponentStory<typeof Logo> = (args) => (
  <Link href="">
    <Logo {...args}>
      <LogoImage src={PlaceholderLogo} />
      <LogoSeparator />
      <Text>App title</Text>
    </Logo>
  </Link>
);
export const LinkOnImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <Link href="">
      <LogoImage src={PlaceholderLogo} />
    </Link>
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const TextInsteadImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <Text>Logo text</Text>
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);
