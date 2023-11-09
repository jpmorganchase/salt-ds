import { ToggleButton } from "@salt-ds/core";
import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import { FavoriteSolidIcon, HomeIcon } from "@salt-ds/icons";

export default {
  title: "Core/Toggle Button/Toggle Button QA",
  component: ToggleButton,
} as Meta<typeof ToggleButton>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
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
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
