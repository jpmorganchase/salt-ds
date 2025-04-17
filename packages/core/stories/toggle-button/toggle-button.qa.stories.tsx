import { FlowLayout, StackLayout, ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  type QAContainerNoStyleInjectionProps,
  type QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Toggle Button/Toggle Button QA",
  component: ToggleButton,
} as Meta<typeof ToggleButton>;

const ToggleButtonDefault = () => (
  <FlowLayout gap={6}>
    <ToggleButton value="Default">
      <HomeIcon />
    </ToggleButton>
    <ToggleButton value="Default" selected>
      <HomeIcon /> Default
    </ToggleButton>
    <ToggleButton value="Default" selected appearance="bordered">
      Selected
    </ToggleButton>
  </FlowLayout>
);

const ToggleButtonSentiments = () => (
  <StackLayout>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="Accented">
        Accented
      </ToggleButton>
      <ToggleButton sentiment="positive" value="Positive">
        Positive
      </ToggleButton>
      <ToggleButton sentiment="negative" value="Negative">
        Negative
      </ToggleButton>
      <ToggleButton sentiment="caution" value="Caution">
        Caution
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="Accented" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="positive" value="Positive" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="negative" value="Negative" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="caution" value="Caution" selected>
        Selected
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton
        sentiment="accented"
        value="Accented"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="positive"
        value="Positive"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="negative"
        value="Negative"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="caution"
        value="Caution"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
    </FlowLayout>
  </StackLayout>
);

const ToggleButtonDisabled = () => (
  <StackLayout>
    <FlowLayout>
      <ToggleButton disabled value="Disabled">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="Disabled" sentiment="accented">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="Disabled" sentiment="positive">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="Disabled" sentiment="negative">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="Disabled" sentiment="caution">
        Disabled
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton disabled selected value="Disabled">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="Disabled" sentiment="accented">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="Disabled" sentiment="positive">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="Disabled" sentiment="negative">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="Disabled" sentiment="caution">
        Disabled selected
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton disabled selected value="Disabled" appearance="bordered">
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="Disabled"
        sentiment="accented"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="Disabled"
        sentiment="positive"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="Disabled"
        sentiment="negative"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="Disabled"
        sentiment="caution"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
    </FlowLayout>
  </StackLayout>
);

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} height={2200} width={1700} {...props}>
    <StackLayout gap={2}>
      <ToggleButtonDefault />
      <ToggleButtonSentiments />
      <ToggleButtonDisabled />
    </StackLayout>
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
  <QAContainerNoStyleInjection cols={1} height={2200} width={1700} {...props}>
    <StackLayout gap={2}>
      <ToggleButtonDefault />
      <ToggleButtonSentiments />
      <ToggleButtonDisabled />
    </StackLayout>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
