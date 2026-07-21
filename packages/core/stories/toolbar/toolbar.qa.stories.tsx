import {
  Button,
  Divider,
  Dropdown,
  Input,
  Option,
  Switch,
  Text,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import {
  ExportIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import { userEvent, within } from "storybook/test";

import "docs/story.css";

export default {
  title: "Core/Toolbar/QA",
  component: Toolbar,
  subcomponents: {
    ToolbarContent,
    Tooltray,
  },
} as Meta<typeof Toolbar>;

const options = ["Option A", "Option B", "Option C"];
const toolbarVariants = ["primary", "secondary", "tertiary"] as const;

function ToolbarFrame({
  children,
  label,
  width = "100%",
}: {
  children: React.ReactNode;
  label: string;
  width?: number | string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--salt-spacing-100)",
        width,
      }}
    >
      <Text styleAs="label">{label}</Text>
      {children}
    </div>
  );
}

function SearchInput({ width = 160 }: { width?: number }) {
  return (
    <Input
      bordered
      startAdornment={<SearchIcon aria-hidden />}
      placeholder="Search"
      style={{ width }}
    />
  );
}

function OptionsDropdown({ width = 140 }: { width?: number }) {
  return (
    <Dropdown
      aria-label="Filter option"
      bordered
      defaultSelected={["Option A"]}
      style={{ width }}
    >
      {options.map((option) => (
        <Option value={option} key={option} />
      ))}
    </Dropdown>
  );
}

function ViewActions() {
  return (
    <>
      <Button appearance="transparent" aria-label="Grid view">
        <GridIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="List view">
        <ListIcon aria-hidden />
      </Button>
      <Button appearance="solid">Create</Button>
    </>
  );
}

function BasicToolbar({
  appearance,
  variant,
}: Pick<React.ComponentProps<typeof Toolbar>, "appearance" | "variant">) {
  return (
    <Toolbar
      appearance={appearance}
      variant={variant}
      aria-label={`${variant ?? "transparent"} toolbar`}
    >
      <Tooltray>
        <SearchInput />
        <OptionsDropdown />
      </Tooltray>
      <Tooltray align="end">
        <ViewActions />
      </Tooltray>
    </Toolbar>
  );
}

function CenteredToolbar() {
  return (
    <Toolbar aria-label="Centered toolbar">
      <ToolbarContent position="start">
        <Tooltray>
          <SearchInput width={140} />
        </Tooltray>
      </ToolbarContent>
      <ToolbarContent position="center">
        <Tooltray>
          <ToggleButtonGroup aria-label="View options" defaultValue="grid">
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
        </Tooltray>
      </ToolbarContent>
      <ToolbarContent position="end">
        <Tooltray>
          <Switch label="Pinned" />
        </Tooltray>
      </ToolbarContent>
    </Toolbar>
  );
}

function SharedOverflowToolbar() {
  return (
    <Toolbar aria-label="Shared overflow toolbar">
      <Tooltray overflowMode="none">
        <SearchInput width={120} />
      </Tooltray>
      <Tooltray align="end" overflowPriority={6}>
        <Button appearance="transparent" aria-label="Export">
          <ExportIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="Settings">
          <SettingsIcon aria-hidden />
        </Button>
      </Tooltray>
    </Toolbar>
  );
}

function NamedOverflowToolbar() {
  return (
    <Toolbar aria-label="Named overflow toolbar">
      <ToolbarContent position="start">
        <Tooltray overflowMode="none">
          <SearchInput width={120} />
        </Tooltray>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <Tooltray
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={6}
        >
          <OptionsDropdown />
          <Button appearance="transparent">
            <FilterIcon aria-hidden />
            Filters
          </Button>
        </Tooltray>
      </ToolbarContent>
      <ToolbarContent position="end">
        <Tooltray
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">
            <ExportIcon aria-hidden />
            Export
          </Button>
          <Button appearance="solid">Apply</Button>
        </Tooltray>
      </ToolbarContent>
    </Toolbar>
  );
}

export const QA: StoryFn<QAContainerProps> = (props) => (
  <QAContainer cols={1} height={1200} itemPadding={8} width={1400} {...props}>
    <ToolbarFrame label="Bordered variants">
      <div
        style={{
          display: "grid",
          gap: "var(--salt-spacing-100)",
        }}
      >
        {toolbarVariants.map((variant) => (
          <BasicToolbar variant={variant} key={variant} />
        ))}
      </div>
    </ToolbarFrame>
    <ToolbarFrame label="Transparent appearance">
      <BasicToolbar appearance="transparent" />
    </ToolbarFrame>
    <ToolbarFrame label="Centered content">
      <CenteredToolbar />
    </ToolbarFrame>
    <ToolbarFrame label="Shared overflow open" width={260}>
      <SharedOverflowToolbar />
    </ToolbarFrame>
    <ToolbarFrame label="Named overflow" width={420}>
      <NamedOverflowToolbar />
    </ToolbarFrame>
    <ToolbarFrame label="Right to left" width={520}>
      <div dir="rtl">
        <BasicToolbar variant="secondary" />
      </div>
    </ToolbarFrame>
  </QAContainer>
);

QA.parameters = {
  chromatic: { disableSnapshot: false },
};

QA.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const [trigger] = await canvas.findAllByRole("button", {
    name: /^Overflow\./,
  });

  await userEvent.click(trigger);
  await within(canvasElement.ownerDocument.body).findByRole("toolbar", {
    name: "More overflow",
  });
};
