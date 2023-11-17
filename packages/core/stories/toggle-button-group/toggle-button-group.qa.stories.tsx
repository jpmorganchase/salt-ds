import { ToggleButton, ToggleButtonGroup } from "@salt-ds/core";
import { AppSwitcherIcon, FolderClosedIcon, VisibleIcon } from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";
import {
  QAContainer,
  QAContainerNoStyleInjection,
  QAContainerNoStyleInjectionProps,
  QAContainerProps,
} from "docs/components";

export default {
  title: "Core/Toggle Button Group/ToggleButton Group QA",
  component: ToggleButtonGroup,
} as Meta<typeof ToggleButtonGroup>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} cols={1} itemPadding={4} {...props}>
    <ToggleButtonGroup defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const NoStyleInjectionGrid: StoryFn<QAContainerNoStyleInjectionProps> = (
  props
) => (
  <QAContainerNoStyleInjection
    height={500}
    width={1000}
    cols={1}
    itemPadding={4}
    {...props}
  >
    <ToggleButtonGroup defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
    <ToggleButtonGroup orientation="vertical" defaultValue="active">
      <ToggleButton value="all">
        <AppSwitcherIcon aria-hidden />
        All
      </ToggleButton>
      <ToggleButton value="active">
        <VisibleIcon aria-hidden />
        Active
      </ToggleButton>
      <ToggleButton disabled value="search">
        <FolderClosedIcon aria-hidden />
        Archived
      </ToggleButton>
    </ToggleButtonGroup>
  </QAContainerNoStyleInjection>
);

NoStyleInjectionGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
