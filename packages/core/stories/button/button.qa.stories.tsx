import { Button } from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Button/Button QA",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Button>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Button variant="primary">Button</Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon /> Button
    </Button>
    <Button variant="secondary">Button</Button>
    <Button variant="secondary">
      <SearchIcon />
    </Button>
    <Button variant="secondary">
      <SearchIcon /> Button
    </Button>
    <Button variant="cta">Button</Button>
    <Button variant="cta">
      <SearchIcon />
    </Button>
    <Button variant="cta">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="solid">
      Button
    </Button>
    <Button sentiment="accented" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="bordered">
      Button
    </Button>
    <Button sentiment="accented" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="transparent">
      Button
    </Button>
    <Button sentiment="accented" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="solid">
      Button
    </Button>
    <Button sentiment="neutral" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      Button
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      Button
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="solid">
      Button
    </Button>
    <Button sentiment="positive" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="bordered">
      Button
    </Button>
    <Button sentiment="positive" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="transparent">
      Button
    </Button>
    <Button sentiment="positive" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="solid">
      Button
    </Button>
    <Button sentiment="negative" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="bordered">
      Button
    </Button>
    <Button sentiment="negative" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="transparent">
      Button
    </Button>
    <Button sentiment="negative" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="solid">
      Button
    </Button>
    <Button sentiment="caution" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="bordered">
      Button
    </Button>
    <Button sentiment="caution" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="transparent">
      Button
    </Button>
    <Button sentiment="caution" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      <SearchIcon /> Button
    </Button>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props,
) => (
  <QAContainerNoStyleInjection height={500} width={1000} {...props}>
    <Button variant="primary">Button</Button>
    <Button variant="primary">
      <SearchIcon />
    </Button>
    <Button variant="primary">
      <SearchIcon /> Button
    </Button>
    <Button variant="secondary">Button</Button>
    <Button variant="secondary">
      <SearchIcon />
    </Button>
    <Button variant="secondary">
      <SearchIcon /> Button
    </Button>
    <Button variant="cta">Button</Button>
    <Button variant="cta">
      <SearchIcon />
    </Button>
    <Button variant="cta">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="solid">
      Button
    </Button>
    <Button sentiment="accented" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="bordered">
      Button
    </Button>
    <Button sentiment="accented" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="accented" appearance="transparent">
      Button
    </Button>
    <Button sentiment="accented" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="accented" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="solid">
      Button
    </Button>
    <Button sentiment="neutral" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      Button
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      Button
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="neutral" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="solid">
      Button
    </Button>
    <Button sentiment="positive" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="bordered">
      Button
    </Button>
    <Button sentiment="positive" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="positive" appearance="transparent">
      Button
    </Button>
    <Button sentiment="positive" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="positive" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="solid">
      Button
    </Button>
    <Button sentiment="negative" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="bordered">
      Button
    </Button>
    <Button sentiment="negative" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="negative" appearance="transparent">
      Button
    </Button>
    <Button sentiment="negative" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="negative" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="solid">
      Button
    </Button>
    <Button sentiment="caution" appearance="solid">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="bordered">
      Button
    </Button>
    <Button sentiment="caution" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button sentiment="caution" appearance="transparent">
      Button
    </Button>
    <Button sentiment="caution" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button sentiment="caution" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="accented" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="neutral" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="positive" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="negative" appearance="transparent">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="solid">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="bordered">
      <SearchIcon /> Button
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      Button
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      <SearchIcon />
    </Button>
    <Button disabled sentiment="caution" appearance="transparent">
      <SearchIcon /> Button
    </Button>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
