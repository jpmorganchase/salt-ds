import {
  Button,
  ComboBox,
  Divider,
  Dropdown,
  Input,
  Option,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import { CurrencyIcon, SearchIcon } from "@salt-ds/icons";
import { ToolbarContentNext, ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { AdjustableFlexbox } from "../components";

export default {
  title: "Lab/Toolbar Next/Cypress Test Fixtures",
  component: ToolbarNext,
} as Meta<typeof ToolbarNext>;

const options = ["Option A", "Option B", "Option C"];

function ToolbarHarness({
  children,
  height = 220,
  width = 760,
}: {
  children: ReactNode;
  height?: number;
  width?: number;
}) {
  return (
    <div className="Flexbox" style={{ height, width }}>
      {children}
    </div>
  );
}

function KeyboardHarness({
  children,
  width = 640,
}: {
  children: ReactNode;
  width?: number;
}) {
  return (
    <AdjustableFlexbox height={240} width={width}>
      <button data-testid="toolbar-before">Before toolbar</button>
      {children}
      <button data-testid="toolbar-after">After toolbar</button>
    </AdjustableFlexbox>
  );
}

export function OverflowDividersFixture({ width = 560 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with divider overflow">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <TooltrayNext overflowMode="independent" overflowPriority={5}>
          <span>Description</span>
        </TooltrayNext>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <TooltrayNext overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function NamedOverflowWithDividersFixture({
  width = 760,
}: {
  width?: number;
}) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Data entry toolbar with named overflow">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            placeholder="Enter price"
            startAdornment={<CurrencyIcon aria-hidden />}
          />
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={3}
        >
          <Dropdown
            aria-label="Primary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="independent"
          overflowPriority={4}
        >
          <Dropdown
            aria-label="Secondary filter"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <Divider aria-hidden orientation="vertical" variant="secondary" />
        <TooltrayNext
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Decline Request</Button>
          <Button appearance="solid">Adjust Price</Button>
        </TooltrayNext>
        <TooltrayNext align="end" overflowMode="none">
          <Button appearance="transparent">Search</Button>
          <Button appearance="transparent">Settings</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function SpacingOverflowFixture({ width = 520 }: { width?: number }) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with overflow spacing">
        <TooltrayNext
          overflowMode="none"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="independent" overflowPriority={6}>
          <Button appearance="transparent">Secondary</Button>
        </TooltrayNext>
        <TooltrayNext
          align="end"
          overflowMode="none"
          style={{ marginRight: "var(--salt-spacing-300)" }}
        >
          <Button appearance="transparent">Primary</Button>
        </TooltrayNext>
        <TooltrayNext align="end" overflowMode="none">
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function DefaultSharedOverflowFixture({
  width = 360,
}: {
  width?: number;
}) {
  return (
    <ToolbarHarness width={width}>
      <ToolbarNext aria-label="Toolbar with default shared overflow">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowPriority={4}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Columns
          </Button>
        </TooltrayNext>
        <TooltrayNext align="end" overflowPriority={6}>
          <Button appearance="transparent" style={{ width: 140 }}>
            Export
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </ToolbarHarness>
  );
}

export function KeyboardButtonsFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard buttons toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent">Cut</Button>
            <Button appearance="transparent">Copy</Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardTextInputFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard text input toolbar">
        <TooltrayNext overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardComboBoxFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard combo box toolbar">
        <TooltrayNext overflowMode="none">
          <ComboBox
            aria-label="Selection"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </ComboBox>
        </TooltrayNext>
        <TooltrayNext overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardDropdownFixture({ width = 620 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard dropdown toolbar">
        <TooltrayNext overflowMode="none">
          <Dropdown
            aria-label="Selection"
            bordered
            defaultSelected={["Option A"]}
          >
            {options.map((option) => (
              <Option key={option} value={option} />
            ))}
          </Dropdown>
        </TooltrayNext>
        <TooltrayNext overflowMode="none">
          <Button appearance="transparent">Columns</Button>
          <Button appearance="solid">Run</Button>
        </TooltrayNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardDatePickerFixture({ width = 720 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard date picker toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <DatePicker selectionVariant="single">
              <DatePickerTrigger>
                <DatePickerSingleInput
                  aria-label="Date"
                  bordered
                  placeholder="Select date"
                />
              </DatePickerTrigger>
              <DatePickerOverlay>
                <DatePickerSingleGridPanel />
              </DatePickerOverlay>
            </DatePicker>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Button appearance="solid">Apply</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardToggleGroupFixture({
  disableFirstToggle = false,
  width = 680,
}: {
  disableFirstToggle?: boolean;
  width?: number;
}) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard toggle group toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button appearance="solid">First Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="center">
          <TooltrayNext overflowMode="none">
            <ToggleButtonGroup aria-label="View toggle" defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowToggleGroupFixture({
  disableFirstToggle = false,
  width = 260,
}: {
  disableFirstToggle?: boolean;
  width?: number;
}) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow toggle group toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button appearance="solid">Pinned</Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext
            overflowGroup="Views"
            overflowLabel="Views"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Before toggles</Button>
            <ToggleButtonGroup aria-label="View filter" defaultValue="all">
              <ToggleButton disabled={disableFirstToggle} value="all">
                All
              </ToggleButton>
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
            <Button appearance="solid">Confirm view</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowFixture({ width = 420 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Input
              bordered
              startAdornment={<SearchIcon aria-hidden />}
              placeholder="Search"
            />
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardOverflowRerenderFixture({
  width = 420,
}: {
  width?: number;
}) {
  const [clickCount, setClickCount] = useState(0);

  return (
    <KeyboardHarness width={width}>
      <ToolbarNext aria-label="Keyboard overflow rerender toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Input
              bordered
              startAdornment={<SearchIcon aria-hidden />}
              placeholder="Search"
            />
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Export</Button>
            <Button
              appearance="solid"
              onClick={() => {
                setClickCount((current) => current + 1);
              }}
            >
              Re-render {clickCount}
            </Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </KeyboardHarness>
  );
}

export function KeyboardRtlFixture({ width = 560 }: { width?: number }) {
  return (
    <KeyboardHarness width={width}>
      <div dir="rtl">
        <ToolbarNext aria-label="Keyboard RTL toolbar">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent">Columns</Button>
            <Button appearance="transparent">Status</Button>
          </TooltrayNext>
          <TooltrayNext overflowMode="none" align="end">
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarNext>
      </div>
    </KeyboardHarness>
  );
}
