import { Link, StackLayout, Text } from "@salt-ds/core";
import { Logo, LogoImage, LogoSeparator } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";
import { ChaseLogo } from "./assets/ChaseLogo";
import { ChaseCompactLogo } from "./assets/ChaseCompactLogo";

export default {
  title: "Lab/Logo",
  component: Logo,
} as ComponentMeta<typeof Logo>;

export const Default: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} />
  </Logo>
);

export const ImageAndText: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} />
    <Text>App title</Text>
  </Logo>
);

export const ImageAndTextWithSeparator: ComponentStory<typeof Logo> = (
  args
) => (
  <Logo {...args}>
    <LogoImage src={PlaceholderLogo as string} />
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const LinkLogo: ComponentStory<typeof Logo> = (args) => (
  <Link href="">
    <Logo {...args}>
      <LogoImage src={PlaceholderLogo as string} />
      <LogoSeparator />
      <Text>App title</Text>
    </Logo>
  </Link>
);
export const LinkOnImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <Link href="">
      <LogoImage src={PlaceholderLogo as string} />
    </Link>
    <LogoSeparator />
    <Text>App title</Text>
  </Logo>
);

export const TextInsteadImage: ComponentStory<typeof Logo> = (args) => (
  <Logo {...args}>
    <Text>Logo text</Text>
    <LogoSeparator />
    <Text styleAs="h3">App title</Text>
  </Logo>
);

export const RegularVsCompact: ComponentStory<typeof Logo> = (args) => (
  <StackLayout>
    <Logo {...args}>
      <ChaseLogo />
      <LogoSeparator />
      <Text styleAs="h3">App title</Text>
    </Logo>
    <Logo {...args}>
      <ChaseCompactLogo />
      <LogoSeparator />
      <Text styleAs="h3">App title</Text>
    </Logo>
  </StackLayout>
);
