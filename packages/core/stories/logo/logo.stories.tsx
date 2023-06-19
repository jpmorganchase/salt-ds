import {
  Link,
  Logo,
  LogoImage,
  LogoSeparator,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";
import { ChaseLogo } from "./assets/ChaseLogo";
import { ChaseCompactLogo } from "./assets/ChaseCompactLogo";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

export const LogoWithImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} alt="Logo image" />
  </Logo>
);

export const ImageAndText: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} alt="Logo image" />
    <Text>App title</Text>
  </Logo>
);

export const ImageAndTextWithSeparator: ComponentStory<typeof Logo> = (
  args
) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} alt="Logo image" />
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const LinkLogo: ComponentStory<typeof Logo> = (args) => (
  <Link href="">
    <Logo {...args}>
      <ChaseLogo />
      <LogoSeparator />
      <Text>App title</Text>
    </Logo>
  </Link>
);
export const LinkOnImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <Link href="">
      <ChaseLogo />
    </Link>
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const RegularVsCompact: ComponentStory<typeof Logo> = (args) => (
  <StackLayout>
    <Logo {...args}>
      <ChaseLogo />
      <LogoSeparator />
      <Text styleAs="h3">Regular Logo</Text>
    </Logo>
    <Logo {...args}>
      <ChaseCompactLogo />
    </Logo>
  </StackLayout>
);
