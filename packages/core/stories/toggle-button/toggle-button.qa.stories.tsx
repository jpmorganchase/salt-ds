import { FlowLayout, StackLayout, ToggleButton } from "@salt-ds/core";
import { HomeIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Toggle Button/Toggle Button QA",
  component: ToggleButton,
} as Meta<typeof ToggleButton>;

const ToggleButtonDefault = () => (
  <FlowLayout gap={6}>
    <ToggleButton value="default">
      <HomeIcon />
    </ToggleButton>
    <ToggleButton value="default" selected>
      <HomeIcon /> Default
    </ToggleButton>
    <ToggleButton value="default" selected appearance="bordered">
      Selected
    </ToggleButton>
  </FlowLayout>
);

const ToggleButtonSentiments = () => (
  <StackLayout>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="accented">
        Accented
      </ToggleButton>
      <ToggleButton sentiment="positive" value="positive">
        Positive
      </ToggleButton>
      <ToggleButton sentiment="negative" value="negative">
        Negative
      </ToggleButton>
      <ToggleButton sentiment="caution" value="caution">
        Caution
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton sentiment="accented" value="accented" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="positive" value="positive" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="negative" value="negative" selected>
        Selected
      </ToggleButton>
      <ToggleButton sentiment="caution" value="caution" selected>
        Selected
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton
        sentiment="accented"
        value="accented"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="positive"
        value="positive"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="negative"
        value="negative"
        selected
        appearance="bordered"
      >
        Selected
      </ToggleButton>
      <ToggleButton
        sentiment="caution"
        value="caution"
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
      <ToggleButton disabled value="disabled">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="disabled" sentiment="accented">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="disabled" sentiment="positive">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="disabled" sentiment="negative">
        Disabled
      </ToggleButton>
      <ToggleButton disabled value="disabled" sentiment="caution">
        Disabled
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton disabled selected value="disabled">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="disabled" sentiment="accented">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="disabled" sentiment="positive">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="disabled" sentiment="negative">
        Disabled selected
      </ToggleButton>
      <ToggleButton disabled selected value="disabled" sentiment="caution">
        Disabled selected
      </ToggleButton>
    </FlowLayout>
    <FlowLayout>
      <ToggleButton disabled selected value="disabled" appearance="bordered">
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="disabled"
        sentiment="accented"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="disabled"
        sentiment="positive"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="disabled"
        sentiment="negative"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
      <ToggleButton
        disabled
        selected
        value="disabled"
        sentiment="caution"
        appearance="bordered"
      >
        Disabled selected
      </ToggleButton>
    </FlowLayout>
  </StackLayout>
);

const ToggleButtonReadOnly = () => (
  <FlowLayout gap={6}>
    <ToggleButton value="readOnly" readOnly>
      <HomeIcon /> Read only
    </ToggleButton>
    <ToggleButton value="readOnly" selected>
      Read only
    </ToggleButton>
    <ToggleButton value="readOnly" selected appearance="bordered">
      Read only
    </ToggleButton>
  </FlowLayout>
);

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} height={2200} width={1700} {...props}>
    <StackLayout gap={2}>
      <ToggleButtonDefault />
      <ToggleButtonSentiments />
      <ToggleButtonReadOnly />
      <ToggleButtonDisabled />
    </StackLayout>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,

    modes: {
      theme: {
        theme: "legacy",
      },
      themeNext: {
        theme: "brand",
      },
    },
  },
};
