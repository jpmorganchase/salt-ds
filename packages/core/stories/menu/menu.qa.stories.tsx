import { Meta, StoryFn } from "@storybook/react";
import { QAContainer, QAContainerProps } from "docs/components";
import {
  Button,
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import { MicroMenuIcon } from "@salt-ds/icons";
import "./menu.qa.stories.css";

export default {
  title: "Core/Menu/Menu QA",
  component: Menu,
} as Meta<typeof Menu>;

export const SingleLevelExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      className="singleLevel"
      cols={8}
      height={860}
      width={1400}
      transposeDensity
      {...props}
    >
      <Menu open>
        <MenuTrigger>
          <Button variant="secondary" aria-label="Open Menu">
            <MicroMenuIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuItem>Copy</MenuItem>
          <MenuItem>Paste</MenuItem>
          <MenuItem>Export</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuPanel>
      </Menu>
      <Menu open>
        <MenuTrigger>
          <Button variant="secondary" aria-label="Open Menu">
            <MicroMenuIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          <MenuGroup label="Actions">
            <MenuItem>Copy</MenuItem>
            <MenuItem>Paste</MenuItem>
          </MenuGroup>
          <MenuGroup label="Styling">
            <MenuItem>Edit styling</MenuItem>
            <MenuItem>Clear styling</MenuItem>
          </MenuGroup>
        </MenuPanel>
      </Menu>
    </QAContainer>
  );
};

SingleLevelExamples.parameters = {
  chromatic: { disableSnapshot: false },
};

export const MultilevelExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      itemWidthAuto
      height={500}
      width={1200}
      transposeDensity
      vertical
      {...props}
    >
      <div style={{ width: 290, height: 300 }}>
        <Menu open>
          <MenuTrigger>
            <Button variant="secondary" aria-label="Open Menu">
              <MicroMenuIcon aria-hidden />
            </Button>
          </MenuTrigger>
          <MenuPanel>
            <MenuItem>Copy</MenuItem>
            <Menu open>
              <MenuTrigger>
                <MenuItem>Clear styling</MenuItem>
              </MenuTrigger>
              <MenuPanel>
                <MenuItem>Column</MenuItem>
                <MenuItem>Cell</MenuItem>
                <MenuItem>Row</MenuItem>
              </MenuPanel>
            </Menu>
            <MenuItem>Export</MenuItem>
            <MenuItem>Settings</MenuItem>
          </MenuPanel>
        </Menu>
      </div>
    </QAContainer>
  );
};

MultilevelExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
