import { Menu, MenuItem, MenuPanel, MenuTrigger, Pill } from "@salt-ds/core";
import { FavoriteIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Pill/Pill QA",
  component: Pill,
} as Meta<typeof Pill>;

const noop = () => undefined;

export const ExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  const { className, ...rest } = props;
  return (
    <QAContainer
      itemWidthAuto
      cols={4}
      height={300}
      itemPadding={21}
      width={1300}
      {...rest}
    >
      <Pill className={className} onClick={noop}>
        Default Pill
      </Pill>
      <Pill className={className} onClick={noop} disabled>
        Disabled Pill
      </Pill>
      <Pill className={className} onClick={noop}>
        <FavoriteIcon /> With Icon Pill
      </Pill>
      <Menu open>
        <MenuTrigger>
          <Pill>Menu Pill</Pill>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Copy</MenuItem>
        </MenuPanel>
      </Menu>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
