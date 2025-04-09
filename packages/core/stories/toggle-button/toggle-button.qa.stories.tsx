import { FlowLayout, StackLayout, ToggleButton } from "@salt-ds/core";
import { FavoriteSolidIcon, HomeIcon } from "@salt-ds/icons";
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

const ToggleButtonWithSentiments = () => (
  <StackLayout style={{ width: "100%" }}>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="Accented">
        <HomeIcon />
      </ToggleButton>
      <ToggleButton sentiment="positive" value="Positive">
        Home
      </ToggleButton>
      <ToggleButton sentiment="negative" value="Negative">
        <HomeIcon /> Home
      </ToggleButton>

      <ToggleButton sentiment="caution" value="Caution">
        Home
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="Accented" selected>
        <HomeIcon />
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
        appearance="bordered"
        sentiment="accented"
        value="Accented"
        selected
      >
        <HomeIcon />
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="positive"
        value="Positive"
        selected
      >
        Selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="negative"
        value="Negative"
        selected
      >
        Selected
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="caution"
        value="Caution"
        selected
      >
        Selected
      </ToggleButton>
    </FlowLayout>
  </StackLayout>
);

const ToggleButtonBordered = () => (
  <FlowLayout>
    <ToggleButton appearance="bordered" value="Bordered">
      Home
    </ToggleButton>
    <ToggleButton appearance="bordered" value="Bordered" selected>
      Selected
    </ToggleButton>
    <ToggleButton appearance="bordered" value="Bordered">
      <HomeIcon /> Home
    </ToggleButton>
    <ToggleButton appearance="bordered" value="Bordered" selected>
      <HomeIcon /> Selected
    </ToggleButton>
    <ToggleButton appearance="bordered" value="Bordered">
      <HomeIcon />
    </ToggleButton>
  </FlowLayout>
);

const ToggleButtonSolid = () => (
  <FlowLayout>
    <ToggleButton value="Solid">Home</ToggleButton>
    <ToggleButton value="Solid" selected>
      Selected
    </ToggleButton>
    <ToggleButton value="Solid">
      <HomeIcon /> Home
    </ToggleButton>
    <ToggleButton value="Solid" selected>
      <HomeIcon /> Selected
    </ToggleButton>
    <ToggleButton value="Solid">
      <HomeIcon />
    </ToggleButton>
  </FlowLayout>
);

const ToggleButtonDisabled = () => (
  <StackLayout style={{ width: "100%" }}>
    <FlowLayout>
      <ToggleButton value="Neutral" disabled>
        <HomeIcon />
      </ToggleButton>
      <ToggleButton sentiment="accented" value="Accented" disabled>
        <HomeIcon />
      </ToggleButton>
      <ToggleButton sentiment="positive" value="Positive" disabled>
        Home
      </ToggleButton>
      <ToggleButton sentiment="negative" value="Negative" disabled>
        <HomeIcon /> Home
      </ToggleButton>

      <ToggleButton sentiment="caution" value="Caution" disabled>
        Home
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton value="Neutral" selected disabled>
        <HomeIcon />
      </ToggleButton>
      <ToggleButton sentiment="accented" value="Accented" selected disabled>
        <HomeIcon />
      </ToggleButton>
      <ToggleButton sentiment="positive" value="Positive" selected disabled>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="negative" value="Negative" selected disabled>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="caution" value="Caution" selected disabled>
        Selected
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton appearance="bordered" value="Neutral" disabled selected>
        <HomeIcon />
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="accented"
        value="Accented"
        disabled
        selected
      >
        <HomeIcon />
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="positive"
        value="Positive"
        disabled
        selected
      >
        Home
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="negative"
        value="Negative"
        disabled
        selected
      >
        <HomeIcon /> Home
      </ToggleButton>

      <ToggleButton
        appearance="bordered"
        sentiment="caution"
        value="Caution"
        disabled
        selected
      >
        Home
      </ToggleButton>
    </FlowLayout>
  </StackLayout>
);

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} height={500} width={1400} {...props}>
    <StackLayout gap={3}>
      <ToggleButtonSolid />
      <ToggleButtonBordered />
      <ToggleButtonWithSentiments />
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
  <QAContainerNoStyleInjection height={500} width={1000} {...props}>
    <ToggleButton aria-label="favorite" value="Icon only">
      <FavoriteSolidIcon />
    </ToggleButton>
    <ToggleButton value="Text only">AND</ToggleButton>
    <ToggleButton value="Icon and text">
      <HomeIcon aria-hidden /> Home
    </ToggleButton>
    <ToggleButton aria-label="favorite" value="Icon only disabled" disabled>
      <FavoriteSolidIcon />
    </ToggleButton>
    <ToggleButton value="Text only disabled" disabled>
      AND
    </ToggleButton>
    <ToggleButton value="Icon and text disabled" disabled>
      <HomeIcon aria-hidden /> Home
    </ToggleButton>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
