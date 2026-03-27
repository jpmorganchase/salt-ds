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
} from "@salt-ds/core";
import { GridIcon, ListIcon, SearchIcon } from "@salt-ds/icons";
import {
  DateInputSingle,
  ToolbarNext,
  ToolbarRegion,
  TooltrayNext,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";

export default {
  title: "Lab/Toolbar Next",
  component: ToolbarNext,
  subcomponents: {
    ToolbarRegion,
    TooltrayNext,
  },
} as Meta<typeof ToolbarNext>;

const options = ["Option A", "Option B", "Option C"];

export const FlatAlignSugar: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Flat toolbar">
    <TooltrayNext role="group" aria-label="Search and filter">
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <TooltrayNext role="group" align="end" aria-label="Actions">
      <Button appearance="transparent" aria-label="Grid view">
        <GridIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="List view">
        <ListIcon aria-hidden />
      </Button>
      <Button appearance="solid">Button</Button>
    </TooltrayNext>
  </ToolbarNext>
);

export const FlatWithDividers: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with dividers">
    <TooltrayNext role="group" aria-label="Search and filter">
      <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext>
      <Text>Description</Text>
    </TooltrayNext>
    <TooltrayNext align="end">
      <Dropdown bordered defaultSelected={["Option A"]}>
        {options.map((option) => (
          <Option value={option} key={option} />
        ))}
      </Dropdown>
    </TooltrayNext>
    <Divider orientation="vertical" variant="secondary" />
    <TooltrayNext role="group" align="end" aria-label="Actions">
      <Button appearance="transparent" aria-label="Grid view">
        <GridIcon aria-hidden />
      </Button>
      <Button appearance="transparent" aria-label="List view">
        <ListIcon aria-hidden />
      </Button>
      <Button appearance="solid">Button</Button>
    </TooltrayNext>
  </ToolbarNext>
);

export const Spacing300Groups: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Toolbar with spacing groups">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext
        role="group"
        aria-label="Actions"
        style={{ gap: "var(--salt-spacing-300)" }}
      >
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

export const RegionFirst: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Region first toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext>
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="center">
      <TooltrayNext role="group" aria-label="Toggle options">
        <ToggleButtonGroup>
          <ToggleButton value="toggle-1">Toggle</ToggleButton>
          <ToggleButton value="toggle-2">Toggle</ToggleButton>
          <ToggleButton value="toggle-3">Toggle</ToggleButton>
        </ToggleButtonGroup>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext>
        <Text>Description</Text>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

export const Transparent: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext variant="transparent" aria-label="App header toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Utility actions">
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

export const DataViewActions: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Data view toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext>
        <Text>Description</Text>
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext>
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <Divider orientation="vertical" variant="secondary" />
      <TooltrayNext role="group" aria-label="Actions">
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

export const MixedFormControls: StoryFn<typeof ToolbarNext> = () => (
  <ToolbarNext aria-label="Mixed controls toolbar">
    <ToolbarRegion position="start">
      <TooltrayNext role="group" aria-label="Criteria">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
        <DateInputSingle bordered />
      </TooltrayNext>
    </ToolbarRegion>
    <ToolbarRegion position="end">
      <TooltrayNext role="group" aria-label="Settings and actions">
        <Switch label="Pinned" />
        <Button appearance="solid">Run</Button>
      </TooltrayNext>
    </ToolbarRegion>
  </ToolbarNext>
);

export const RightToLeft: StoryFn<typeof ToolbarNext> = () => (
  <div dir="rtl">
    <ToolbarNext aria-label="RTL toolbar">
      <TooltrayNext role="group" aria-label="Search and filter">
        <Input bordered startAdornment={<SearchIcon />} placeholder="Search" />
        <Dropdown bordered defaultSelected={["Option A"]}>
          {options.map((option) => (
            <Option value={option} key={option} />
          ))}
        </Dropdown>
      </TooltrayNext>
      <TooltrayNext role="group" align="end" aria-label="Actions">
        <Button appearance="transparent" aria-label="Grid view">
          <GridIcon aria-hidden />
        </Button>
        <Button appearance="transparent" aria-label="List view">
          <ListIcon aria-hidden />
        </Button>
        <Button appearance="solid">Button</Button>
      </TooltrayNext>
    </ToolbarNext>
  </div>
);
