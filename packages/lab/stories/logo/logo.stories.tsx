import { FlowLayout, Link, StackLayout, Text } from "@salt-ds/core";
import { Logo, LogoImage, LogoSeparator } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import PlaceholderLogo from "docs/assets/placeholder.svg";
import Chase from "docs/assets/chase.svg";
import ChaseCompact from "docs/assets/chase-compact.svg";

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
    <Text>App title</Text>
  </Logo>
);

export const ImageAndTextWithSeparator: ComponentStory<typeof Logo> = (
  args
) => (
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
    <Text styleAs="h3">App title</Text>
  </Logo>
);

export const RegularVsCompact: ComponentStory<typeof Logo> = (args) => (
  <StackLayout>
    <Logo {...args}>
      <LogoImage src={Chase} alt="Logo" />
      <LogoSeparator />
      <Text styleAs="h3">App title</Text>
    </Logo>
    <Logo {...args}>
      <LogoImage src={ChaseCompact} alt="Compact Logo" />
      <LogoSeparator />
      <Text styleAs="h3">App title</Text>
    </Logo>
  </StackLayout>
);
