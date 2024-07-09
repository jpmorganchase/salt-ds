import { MicroMenuIcon, UserSolidIcon } from "@salt-ds/icons";
import { MenuButton, type MenuDescriptor } from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react";

export default {
  title: "Lab/MenuButton",
  component: MenuButton,
};

const makeMenuItems = (levels: number, count: number): MenuDescriptor[] => {
  const f = (level = 0, parentName?: string) =>
    [...Array(count).keys()].map((i) => {
      const name = parentName ? [parentName, `${i + 1}`].join(".") : `${i + 1}`;
      const item: MenuDescriptor = {
        title: `Level ${level + 1} Menu Item ${name}`,
      };
      if (level < levels - 1) {
        item.menuItems = f(level + 1, name);
      }
      return item;
    });
  return f();
};

const initialSource = { menuItems: makeMenuItems(3, 3) };

const PrimaryStory: StoryFn = () => {
  return (
    <MenuButton
      CascadingMenuProps={{ initialSource }}
      variant="primary"
      data-testid="menu-button-example"
    >
      <UserSolidIcon />
    </MenuButton>
  );
};

export const Primary = PrimaryStory.bind({});

const SecondaryStory: StoryFn = () => {
  return (
    <MenuButton
      CascadingMenuProps={{ initialSource }}
      data-testid="menu-button-example"
    >
      <UserSolidIcon />
    </MenuButton>
  );
};

export const Secondary = SecondaryStory.bind({});

const HideCaretStory: StoryFn = () => (
  <MenuButton
    CascadingMenuProps={{ initialSource }}
    data-testid="menu-button-example"
    hideCaret
  >
    <MicroMenuIcon />
  </MenuButton>
);

export const HideCaret = HideCaretStory.bind({});
