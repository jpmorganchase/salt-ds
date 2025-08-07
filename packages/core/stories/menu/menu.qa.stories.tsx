import {
  Button,
  Menu,
  MenuGroup,
  MenuItem,
  MenuPanel,
  MenuTrigger,
} from "@salt-ds/core";
import {
  CopyIcon,
  ExportIcon,
  MicroMenuIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Core/Menu/Menu QA",
  component: Menu,
} as Meta<typeof Menu>;

export const SingleLevelExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      itemWidthAuto
      height={500}
      width={800}
      transposeDensity
      vertical
      {...props}
    >
      <div style={{ width: 190, height: 300 }}>
        <Menu open>
          <MenuTrigger>
            <Button appearance="transparent" aria-label="Open Menu">
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
      </div>
    </QAContainer>
  );
};

SingleLevelExamples.parameters = {
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
            <Button appearance="transparent" aria-label="Open Menu">
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

export const GroupedExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      itemWidthAuto
      height={500}
      width={800}
      transposeDensity
      vertical
      {...props}
    >
      <div style={{ width: 190, height: 300 }}>
        <Menu open>
          <MenuTrigger>
            <Button appearance="transparent" aria-label="Open Menu">
              <MicroMenuIcon aria-hidden />
            </Button>
          </MenuTrigger>
          <MenuPanel>
            <MenuGroup label="Actions">
              <MenuItem>Copy</MenuItem>
            </MenuGroup>
            <MenuGroup label="Styling">
              <MenuItem>Edit styling</MenuItem>
            </MenuGroup>
          </MenuPanel>
        </Menu>
      </div>
    </QAContainer>
  );
};

GroupedExamples.parameters = {
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

export const WithIconExamples: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      itemWidthAuto
      height={500}
      width={800}
      transposeDensity
      vertical
      {...props}
    >
      <div style={{ width: 190, height: 300 }}>
        <Menu open>
          <MenuTrigger>
            <Button appearance="transparent" aria-label="Open Menu">
              <MicroMenuIcon aria-hidden />
            </Button>
          </MenuTrigger>
          <MenuPanel>
            <MenuItem>
              <CopyIcon aria-hidden />
              Copy
            </MenuItem>
            <MenuItem>
              <ExportIcon aria-hidden />
              Export
            </MenuItem>
            <MenuItem>
              <SettingsIcon aria-hidden />
              Settings
            </MenuItem>
          </MenuPanel>
        </Menu>
      </div>
    </QAContainer>
  );
};

WithIconExamples.parameters = {
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
