import {
  Button,
  ComboBox,
  Dropdown,
  Input,
  Option,
  Switch,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import { composeStories } from "@storybook/react-vite";
import { type FocusEventHandler, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type Locator, page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as toolbarStories from "~stories/toolbar/toolbar.test.stories";

const {
  DefaultSharedOverflowFixture,
  KeyboardButtonsFixture,
  KeyboardComboBoxFixture,
  KeyboardDatePickerFixture,
  KeyboardDropdownFixture,
  KeyboardOverflowFixture,
  KeyboardOverflowRerenderFixture,
  KeyboardOverflowToggleGroupFixture,
  KeyboardRtlFixture,
  KeyboardTextInputFixture,
  KeyboardToggleGroupFixture,
  NamedOverflowWithDividersFixture,
  OverflowDividersFixture,
  SpacingOverflowFixture,
} = composeStories(toolbarStories);

const adapterDayjs = new AdapterDayjs();
const toolbarHarnessStyle = { height: 220, width: 760 };
const statusOptions = ["All", "New", "Working", "Fully Filled", "Cancelled"];

type QueuedAnimationFrame = {
  callback: FrameRequestCallback;
  cancelled: boolean;
  id: number;
};

interface GuardedResizeControls {
  deliverResize: (target: Element) => void;
  flushNextFrame: () => void;
  restore: () => void;
}

type GuardedResizeWindow = Window & {
  __toolbarGuardedResizeTest?: GuardedResizeControls;
  ResizeObserver: typeof ResizeObserver;
};

function installGuardedResizeControls(win: Window) {
  const testWindow = win as GuardedResizeWindow;
  testWindow.__toolbarGuardedResizeTest?.restore();
  const originalRequestAnimationFrame = win.requestAnimationFrame.bind(win);
  const originalCancelAnimationFrame = win.cancelAnimationFrame.bind(win);
  const originalResizeObserver = testWindow.ResizeObserver;
  const frameQueue: QueuedAnimationFrame[] = [];
  const observers: ControlledResizeObserver[] = [];
  let nextFrameId = 1;

  class ControlledResizeObserver implements ResizeObserver {
    readonly observedTargets = new Set<Element>();
    readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }

    observe(target: Element) {
      this.observedTargets.add(target);
    }

    unobserve(target: Element) {
      this.observedTargets.delete(target);
    }

    disconnect() {
      this.observedTargets.clear();
    }

    deliver(target: Element) {
      if (!this.observedTargets.has(target)) return false;
      this.callback(
        [
          {
            contentRect: target.getBoundingClientRect(),
            target,
          } as ResizeObserverEntry,
        ],
        this,
      );
      return true;
    }
  }

  win.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    const id = nextFrameId++;
    frameQueue.push({ callback, cancelled: false, id });
    return id;
  }) as typeof win.requestAnimationFrame;
  win.cancelAnimationFrame = ((id: number) => {
    const frame = frameQueue.find((entry) => entry.id === id);
    if (frame) frame.cancelled = true;
  }) as typeof win.cancelAnimationFrame;
  testWindow.ResizeObserver = ControlledResizeObserver;

  testWindow.__toolbarGuardedResizeTest = {
    deliverResize(target) {
      expect(observers.some((observer) => observer.deliver(target))).toBe(true);
    },
    flushNextFrame() {
      const frame = frameQueue.shift();
      expect(frame).toBeDefined();
      if (frame && !frame.cancelled) frame.callback(win.performance.now());
    },
    restore() {
      win.requestAnimationFrame = originalRequestAnimationFrame;
      win.cancelAnimationFrame = originalCancelAnimationFrame;
      testWindow.ResizeObserver = originalResizeObserver;
      delete testWindow.__toolbarGuardedResizeTest;
    },
  };
}

afterEach(() => {
  (window as GuardedResizeWindow).__toolbarGuardedResizeTest?.restore();
});

function WidthChangingButton({
  ariaLabel,
  collapsedLabel,
  collapsedWidth,
  expandedLabel,
  expandedWidth,
}: {
  ariaLabel: string;
  collapsedLabel: string;
  collapsedWidth: number;
  expandedLabel: string;
  expandedWidth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Button
      appearance="transparent"
      aria-label={ariaLabel}
      aria-pressed={expanded}
      onClick={() => setExpanded((current) => !current)}
      style={{ width: expanded ? expandedWidth : collapsedWidth }}
    >
      {expanded ? expandedLabel : collapsedLabel}
    </Button>
  );
}

function SharedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 500 }}>
      <Toolbar aria-label="Toolbar with shared intrinsic width changes">
        <Tooltray overflowMode="none">
          <WidthChangingButton
            ariaLabel="Toggle shared width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={300}
          />
        </Tooltray>
        <Tooltray overflowMode="independent" overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 150 }}>
            Columns
          </Button>
        </Tooltray>
        <Tooltray overflowMode="none">
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </Tooltray>
      </Toolbar>
    </div>
  );
}

function GuardedResizeTestCase() {
  return (
    <div className="GuardedResizeHarness" style={{ height: 220, width: 500 }}>
      <Toolbar aria-label="Toolbar with guarded resize work">
        <Tooltray overflowMode="none">
          <Button
            appearance="transparent"
            aria-label="Resize guarded tray"
            style={{ width: "var(--guarded-resize-width, 120px)" }}
          >
            Search
          </Button>
        </Tooltray>
        <Tooltray overflowMode="independent" overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 150 }}>
            Columns
          </Button>
        </Tooltray>
        <Tooltray overflowMode="none">
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </Tooltray>
      </Toolbar>
    </div>
  );
}

function OverflowPrioritiesKeyboardTestCase() {
  return (
    <Toolbar aria-label="Toolbar with overflow priorities">
      {[
        ["Pinned", 1],
        ["Views", 1],
        ["Status", 3],
        ["Export", 5],
      ].map(([label, priority]) => (
        <Tooltray
          key={label}
          overflowMode="independent"
          overflowPriority={priority as number}
        >
          <Button appearance="transparent">{label}</Button>
        </Tooltray>
      ))}
    </Toolbar>
  );
}

function NamedGroupCollapseTestCase({
  overflowMode,
}: {
  overflowMode: "grouped" | "independent";
}) {
  return (
    <div className="Flexbox" style={toolbarHarnessStyle}>
      <Toolbar aria-label={`${overflowMode} named filters toolbar`}>
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button style={{ width: 140 }}>Search</Button>
          </Tooltray>
          {[
            ["Filter A", 3],
            ["Status", 4],
            ["Columns", 5],
          ].map(([label, priority]) => (
            <Tooltray
              key={label}
              overflowGroup="Filters"
              overflowLabel="Filters"
              overflowMode={overflowMode}
              overflowPriority={priority as number}
            >
              <Button appearance="transparent" style={{ width: 110 }}>
                {label}
              </Button>
            </Tooltray>
          ))}
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Button appearance="transparent" style={{ width: 100 }}>
              Refresh
            </Button>
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
}

function CenteredToolbarTestCase({
  ariaLabel,
  includeStart = true,
  includeOverflow = false,
  startWidth = 120,
  endWidth = 120,
}: {
  ariaLabel: string;
  includeOverflow?: boolean;
  includeStart?: boolean;
  startWidth?: number;
  endWidth?: number;
}) {
  return (
    <div className="Flexbox" style={toolbarHarnessStyle}>
      <Toolbar aria-label={ariaLabel}>
        {includeStart ? (
          <ToolbarContent position="start">
            <Tooltray overflowMode="none">
              <Button style={{ width: startWidth }}>Start</Button>
            </Tooltray>
          </ToolbarContent>
        ) : null}
        <ToolbarContent position="center">
          <Tooltray overflowMode="none">
            <Button style={{ width: 140 }}>Center action</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode={includeOverflow ? "grouped" : "none"}
            overflowPriority={5}
          >
            <Button appearance="transparent" style={{ width: endWidth }}>
              End primary
            </Button>
            {includeOverflow ? (
              <Button appearance="transparent" style={{ width: 120 }}>
                End secondary
              </Button>
            ) : null}
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
}

function NamedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 480 }}>
      <Toolbar aria-label="Toolbar with named intrinsic width changes">
        <Tooltray overflowMode="none">
          <WidthChangingButton
            ariaLabel="Toggle named width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={360}
          />
        </Tooltray>
        <Tooltray
          align="end"
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Export</Button>
          <Button appearance="solid">Apply</Button>
        </Tooltray>
      </Toolbar>
    </div>
  );
}

function HiddenOverflowWidthChangeTestCase({
  initialWide = false,
}: {
  initialWide?: boolean;
}) {
  const [wide, setWide] = useState(initialWide);
  const nextWide = !initialWide;
  return (
    <>
      <Button onClick={() => setWide(nextWide)}>
        {nextWide ? "Use long hidden label" : "Use short hidden label"}
      </Button>
      <div className="Flexbox" style={{ height: 220, width: 260 }}>
        <Toolbar aria-label="Toolbar with hidden intrinsic width changes">
          <Tooltray overflowMode="none">
            <Button appearance="transparent" style={{ width: 120 }}>
              Pinned
            </Button>
          </Tooltray>
          <Tooltray overflowMode="independent" overflowPriority={5}>
            <Button appearance="transparent" style={{ width: wide ? 320 : 80 }}>
              {wide ? "Hidden action with a long label" : "Short"}
            </Button>
          </Tooltray>
          <Tooltray align="end" overflowMode="none">
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </Tooltray>
        </Toolbar>
      </div>
    </>
  );
}

function NamedOverflowFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Named overflow focus toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Input bordered placeholder="Search" />
          </Tooltray>
          <Tooltray
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <Button appearance="transparent">Filters</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={6}
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="transparent">Settings</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function NamedOverflowInputFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Named overflow input focus toolbar">
        <ToolbarContent position="start">
          <Tooltray
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode="grouped"
            overflowPriority={6}
          >
            <Dropdown
              aria-label="Filter option"
              bordered
              defaultSelected={["Option A"]}
              style={{ width: 160 }}
            >
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <Button appearance="transparent">Filters</Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={5}
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="transparent">Settings</Button>
            <Input bordered placeholder="Search" style={{ width: 180 }} />
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function SharedOverflowDateInputFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 260, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Shared overflow date input focus toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowPriority={6}>
            <Dropdown
              aria-label="Criteria option"
              bordered
              defaultSelected={["Option A"]}
            >
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <DatePicker selectionVariant="single">
              <DatePickerTrigger>
                <DatePickerSingleInput
                  aria-label="Settlement date"
                  bordered
                  placeholder="dd mmm yyyy"
                />
              </DatePickerTrigger>
              <DatePickerOverlay>
                <DatePickerSingleGridPanel />
              </DatePickerOverlay>
            </DatePicker>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray>
            <Button appearance="transparent">Pinned</Button>
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function SharedOverflowFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Shared overflow focus toolbar">
        <ToolbarContent position="start">
          <Tooltray>
            <Input bordered placeholder="Search" style={{ width: 130 }} />
            <Dropdown
              bordered
              defaultSelected={["Option A"]}
              style={{ width: 90 }}
            >
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray>
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function PointerEntryControlsTestCase() {
  return (
    <div className="Flexbox" style={{ height: 220, width: 640 }}>
      <Toolbar aria-label="Pointer entry controls toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Input bordered placeholder="Search" />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Switch label="Pinned" />
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
}

function OverflowPointerEntryControlsTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 260, width: 220, flexDirection: "column" }}
    >
      <button type="button" data-testid="overflow-pointer-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Overflow pointer entry controls toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button appearance="transparent" style={{ width: 170 }}>
              Pinned
            </Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowPriority={5}>
            <Input bordered placeholder="Overflow search" />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <Switch label="Overflow pinned" />
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
    </div>
  );
}

function SharedOverflowComboBoxFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Shared overflow combo box toolbar">
        <ToolbarContent position="start">
          <Tooltray>
            <Input bordered placeholder="Search" />
            <ComboBox bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
              <Option value="Option C" />
            </ComboBox>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray>
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function MultiselectComboBoxKeyboardTestCase({
  onComboBoxFocus,
}: {
  onComboBoxFocus?: FocusEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="Flexbox" style={{ height: 240, width: 680 }}>
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Multiselect combo box keyboard toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <ComboBox
              aria-label="Status filter"
              bordered
              defaultSelected={["New", "Working"]}
              multiselect
              onFocus={onComboBoxFocus}
              truncate
              style={{ width: 260 }}
            >
              {statusOptions.map((option) => (
                <Option key={option} value={option} />
              ))}
            </ComboBox>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowMode="none">
            <Button appearance="transparent">Export</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function SharedOverflowDropdownPopupTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 220, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Shared overflow dropdown toolbar">
        <ToolbarContent position="start">
          <Tooltray overflowMode="none">
            <Button appearance="transparent" style={{ width: 170 }}>
              Pinned
            </Button>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray overflowPriority={5}>
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function MixedControlsWidthChangeTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 520, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Mixed controls width change toolbar">
        <ToolbarContent position="start">
          <Tooltray>
            <Input bordered placeholder="Search" style={{ width: 150 }} />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </Tooltray>
        </ToolbarContent>
        <ToolbarContent position="end">
          <Tooltray>
            <Button appearance="transparent">Toggle</Button>
            <Button appearance="solid">Run</Button>
          </Tooltray>
        </ToolbarContent>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function OverflowTextInputKeyboardTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 180, flexDirection: "column" }}
    >
      <button type="button" data-testid="toolbar-before">
        Before toolbar
      </button>
      <Toolbar aria-label="Overflow text input toolbar">
        <Tooltray
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Reset</Button>
          <Input bordered placeholder="Overflow search" />
          <Button appearance="transparent">Apply</Button>
        </Tooltray>
      </Toolbar>
      <button type="button" data-testid="toolbar-after">
        After toolbar
      </button>
    </div>
  );
}

function SharedBoundaryCollapseTestCase() {
  return (
    <div className="Flexbox" style={{ height: 220, width: 760 }}>
      <Toolbar aria-label="Shared boundary toolbar">
        <Tooltray overflowMode="none">
          <Button appearance="transparent" style={{ width: 120 }}>
            Pinned
          </Button>
        </Tooltray>
        <Tooltray overflowPriority={1}>
          <Button appearance="transparent" style={{ width: 110 }}>
            Low priority
          </Button>
        </Tooltray>
        <Tooltray overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 130 }}>
            High priority
          </Button>
        </Tooltray>
        <Tooltray overflowPriority={0}>
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </Tooltray>
      </Toolbar>
    </div>
  );
}

function MixedTrayCompressionTestCase() {
  return (
    <div className="Flexbox" style={{ height: 220, width: 760 }}>
      <Toolbar aria-label="Mixed tray compression toolbar">
        <Tooltray overflowMode="none">
          <Button appearance="transparent" style={{ width: 120 }}>
            Pinned
          </Button>
        </Tooltray>
        <Tooltray overflowPriority={5}>
          <Switch label="Show total" />
          <Dropdown
            bordered
            defaultSelected={["Sort by highest balance"]}
            style={{ width: 240 }}
          >
            <Option value="Sort by highest balance" />
            <Option value="Sort by lowest balance" />
          </Dropdown>
          <Button appearance="bordered">Add view</Button>
        </Tooltray>
      </Toolbar>
    </div>
  );
}

const subpixelItemLabels = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

function SubpixelWidthRoundingTestCase() {
  return (
    <div className="Flexbox" style={{ height: 220, width: 760 }}>
      <Toolbar
        appearance="transparent"
        aria-label="Subpixel width rounding toolbar"
      >
        <ToolbarContent position="start" style={{ gap: 0 }}>
          {subpixelItemLabels.map((label, index) => (
            <Tooltray key={label} overflowPriority={index}>
              <span
                style={{
                  boxSizing: "border-box",
                  display: "inline-flex",
                  width: 20.2,
                }}
              >
                {label}
              </span>
            </Tooltray>
          ))}
        </ToolbarContent>
      </Toolbar>
    </div>
  );
}

function isVisibleElement(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (
    element.parentElement?.closest(
      '[aria-hidden="true"], .saltToolbar-measurements',
    )
  ) {
    return false;
  }
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function visibleToolbarSlotWidth(name: string) {
  const element = page.getByRole("toolbar", { name }).element();
  return Array.from(
    element.querySelectorAll<HTMLElement>(".saltToolbarOverflow-slot"),
  )
    .filter(isVisibleElement)
    .reduce((total, slot) => total + slot.getBoundingClientRect().width, 0);
}

function setFixtureWidth(width: number) {
  const fixture = document.querySelector<HTMLElement>(".Flexbox");
  if (!fixture) throw new Error("Toolbar .Flexbox fixture not found");
  fixture.style.width = `${width}px`;
}

function shrinkBelowVisibleContent(name: string) {
  const element = page.getByRole("toolbar", { name }).element();
  const styles = getComputedStyle(element);
  const rects = Array.from(
    element.querySelectorAll<HTMLElement>(".saltToolbarOverflow-slot"),
  )
    .filter(isVisibleElement)
    .map((slot) => slot.getBoundingClientRect());
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const frame = [
    styles.paddingLeft,
    styles.paddingRight,
    styles.borderLeftWidth,
    styles.borderRightWidth,
  ].reduce((total, value) => total + (Number.parseFloat(value) || 0), 0);
  setFixtureWidth(Math.ceil(right - left + frame) - 1);
}

async function expectToolbarFits(name: string) {
  await expect
    .poll(() => {
      const element = page.getByRole("toolbar", { name }).element();
      return element.scrollWidth <= element.clientWidth;
    })
    .toBe(true);
}

async function expectSlotsDoNotIntersect(name: string) {
  await expect
    .poll(() => {
      const element = page.getByRole("toolbar", { name }).element();
      const rects = Array.from(
        element.querySelectorAll<HTMLElement>(".saltToolbarOverflow-slot"),
      )
        .filter(isVisibleElement)
        .map((slot) => slot.getBoundingClientRect());
      return rects.every((rect, index) =>
        rects.slice(index + 1).every((next) => {
          const horizontal =
            Math.min(rect.right, next.right) - Math.max(rect.left, next.left);
          const vertical =
            Math.min(rect.bottom, next.bottom) - Math.max(rect.top, next.top);
          return !(horizontal > 0.5 && vertical > 0.5);
        }),
      );
    })
    .toBe(true);
}

async function expectVisibleSeparators(count: number) {
  await expect
    .poll(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>('[role="separator"]'),
        ).filter(isVisibleElement).length,
    )
    .toBe(count);
}

async function expectButton(name: string | RegExp, visible: boolean) {
  await expect
    .poll(async () =>
      (await page.getByRole("button", { name }).elements()).some(
        isVisibleElement,
      ),
    )
    .toBe(visible);
}

async function visibleLocator(locator: Locator) {
  let visibleElement: HTMLElement | undefined;
  await expect
    .poll(async () => {
      visibleElement = (await locator.elements()).find(isVisibleElement);
      return visibleElement !== undefined;
    })
    .toBe(true);
  if (!visibleElement) throw new Error("Expected a visible locator match");
  return page.elementLocator(visibleElement);
}

async function expectCentered(name: string) {
  await expect
    .poll(() => {
      const toolbarRect = page
        .getByRole("toolbar", { name })
        .element()
        .getBoundingClientRect();
      const buttonRect = page
        .getByRole("button", { name: "Center action" })
        .element()
        .getBoundingClientRect();
      return Math.abs(
        toolbarRect.left +
          toolbarRect.width / 2 -
          (buttonRect.left + buttonRect.width / 2),
      );
    })
    .toBeLessThan(1.5);
}

const overflowTrigger = (name: string | RegExp = /Overflow\./i) =>
  page.getByRole("button", { name });

async function openOverflowWithKeyboard(name: string | RegExp) {
  await expectButton(name, true);
  const trigger = overflowTrigger(name);
  trigger.element().focus();
  await expect.element(trigger).toHaveFocus();
  await userEvent.keyboard(" ");
}

describe("Toolbar variants and layout", () => {
  it.each([
    [
      "default",
      undefined,
      undefined,
      ["saltToolbar-primary", "saltToolbar-bordered"],
    ],
    [
      "secondary",
      "secondary",
      undefined,
      ["saltToolbar-secondary", "saltToolbar-bordered"],
    ],
    [
      "tertiary",
      "tertiary",
      undefined,
      ["saltToolbar-tertiary", "saltToolbar-bordered"],
    ],
    [
      "transparent",
      undefined,
      "transparent",
      ["saltToolbar-primary", "saltToolbar-transparent"],
    ],
  ] as const)(
    "applies %s classes",
    async (name, variant, appearance, classes) => {
      await renderWithSalt(
        <Toolbar
          aria-label={`${name} toolbar`}
          variant={variant}
          appearance={appearance}
        >
          <Tooltray>
            <Button>Action</Button>
          </Tooltray>
        </Toolbar>,
      );
      const element = page.getByRole("toolbar", { name: `${name} toolbar` });
      for (const className of classes)
        await expect.element(element).toHaveClass(className);
      if (name === "transparent")
        await expect.element(element).not.toHaveClass("saltToolbar-bordered");
    },
  );

  it("does not overflow subpixel widths within epsilon", async () => {
    await renderWithSalt(<SubpixelWidthRoundingTestCase />);
    await expectButton(/Overflow\./i, false);
    const width = visibleToolbarSlotWidth("Subpixel width rounding toolbar");
    setFixtureWidth(width - 0.4);
    await expectButton(/Overflow\./i, false);
    await expectToolbarFits("Subpixel width rounding toolbar");
    setFixtureWidth(width - 1);
    await expectButton(/Overflow\./i, true);
    await expectToolbarFits("Subpixel width rounding toolbar");
  });

  it("collapses the highest-priority shared tray at the content boundary", async () => {
    await renderWithSalt(<SharedBoundaryCollapseTestCase />);
    await expectButton(/Overflow\./i, false);
    shrinkBelowVisibleContent("Shared boundary toolbar");
    await expectButton(/Overflow\./i, true);
    await expectButton("High priority", false);
    for (const name of ["Low priority", "Pinned", "Run"])
      await expectButton(name, true);
    await expectToolbarFits("Shared boundary toolbar");
    await expectSlotsDoNotIntersect("Shared boundary toolbar");
  });

  it("collapses mixed controls before they compress", async () => {
    await renderWithSalt(<MixedTrayCompressionTestCase />);
    await expectButton(/Overflow\./i, false);
    shrinkBelowVisibleContent("Mixed tray compression toolbar");
    await expectButton(/Overflow\./i, true);
    await expectButton("Add view", false);
    await expectButton("Pinned", true);
    await expectToolbarFits("Mixed tray compression toolbar");
    await expectSlotsDoNotIntersect("Mixed tray compression toolbar");
  });

  it("uses generic shared overflow when overflowMode is omitted", async () => {
    await renderWithSalt(<DefaultSharedOverflowFixture width={420} />);
    await expectButton(/Overflow\./i, true);
    await expectButton("Export", false);
    await expectButton("Columns", true);
    await expectToolbarFits("Toolbar with default shared overflow");
  });

  it("keeps divider-heavy shared overflow clipped-free", async () => {
    await renderWithSalt(<OverflowDividersFixture width={560} />);
    await expectVisibleSeparators(2);
    setFixtureWidth(360);
    await expectButton(/Overflow\./i, true);
    await expectVisibleSeparators(1);
    setFixtureWidth(260);
    await expectVisibleSeparators(0);
    await expectToolbarFits("Toolbar with divider overflow");
  });

  it("preserves named overflow anchors and dividers", async () => {
    await renderWithSalt(<NamedOverflowWithDividersFixture width={760} />);
    setFixtureWidth(540);
    await expectButton(/Actions overflow\./i, true);
    expect(
      overflowTrigger(/Actions overflow\./i)
        .element()
        .closest('[data-position="start"]'),
    ).not.toBeNull();
    await expectVisibleSeparators(1);
    setFixtureWidth(420);
    await expectButton(/Filters overflow\./i, true);
    await expectButton(/Actions overflow\./i, true);
    await expectToolbarFits("Data entry toolbar with named overflow");
  });

  it("accounts for spacing overrides", async () => {
    await renderWithSalt(<SpacingOverflowFixture width={520} />);
    await expectButton(/Overflow\./i, false);
    setFixtureWidth(360);
    await expectButton(/Overflow\./i, true);
    await expectButton("Primary", true);
    await expectButton("Run", true);
    await expectToolbarFits("Toolbar with overflow spacing");
  });

  it("remeasures visible shared trays as intrinsic width changes", async () => {
    await renderWithSalt(<SharedIntrinsicWidthTestCase />);
    await expectButton(/Overflow\./i, false);
    await page.getByRole("button", { name: "Toggle shared width" }).click();
    await expectButton(/Overflow\./i, true);
    await expectButton("Columns", false);
    await page.getByRole("button", { name: "Toggle shared width" }).click();
    await expectButton(/Overflow\./i, false);
    await expectButton("Columns", true);
  });

  it("queues resize work while overflow computation is guarded", async () => {
    installGuardedResizeControls(window);
    await renderWithSalt(<GuardedResizeTestCase />);
    const controls = (window as GuardedResizeWindow).__toolbarGuardedResizeTest;
    controls?.flushNextFrame();
    const button = page
      .getByRole("button", { name: "Resize guarded tray" })
      .element();
    const harness = button.closest<HTMLElement>(".GuardedResizeHarness");
    const slot = button.closest<HTMLElement>(".saltToolbarOverflow-slot");
    expect(harness).not.toBeNull();
    expect(slot).not.toBeNull();
    harness?.style.setProperty("--guarded-resize-width", "320px");
    if (slot && controls) {
      controls.deliverResize(slot);
      controls.flushNextFrame();
      controls.flushNextFrame();
      controls.flushNextFrame();
    }
    await expectButton(/Overflow\./i, true);
    await expectButton("Columns", false);
  });

  it("remeasures visible named trays as intrinsic width changes", async () => {
    await renderWithSalt(<NamedIntrinsicWidthTestCase />);
    await expectButton(/Actions overflow\./i, false);
    await page.getByRole("button", { name: "Toggle named width" }).click();
    await expectButton(/Actions overflow\./i, true);
    await expectButton("Export", false);
    await page.getByRole("button", { name: "Toggle named width" }).click();
    await expectButton(/Actions overflow\./i, false);
    await expectButton("Export", true);
  });

  it.each([
    ["grows", false, "Use long hidden label", true],
    ["shrinks", true, "Use short hidden label", false],
  ] as const)(
    "remeasures when a hidden tray %s",
    async (_name, initialWide, action, remainsOverflowed) => {
      await renderWithSalt(
        <HiddenOverflowWidthChangeTestCase initialWide={initialWide} />,
      );
      await expectButton(/Overflow\./i, true);
      const toolbar = page
        .getByRole("toolbar", {
          name: "Toolbar with hidden intrinsic width changes",
        })
        .element();
      const snapshots: string[] = [];
      const record = () =>
        snapshots.push(
          Array.from(toolbar.querySelectorAll<HTMLElement>("button"))
            .filter(isVisibleElement)
            .map((button) => button.textContent?.trim() ?? "")
            .join("|"),
        );
      record();
      const observer = new MutationObserver(record);
      observer.observe(toolbar, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      await page.getByRole("button", { name: action }).click();
      setFixtureWidth(420);
      await expectButton(/Overflow\./i, remainsOverflowed);
      if (remainsOverflowed)
        expect(
          snapshots.some((snapshot) =>
            snapshot.includes("Hidden action with a long label"),
          ),
        ).toBe(false);
      else await expectButton("Short", true);
      observer.disconnect();
    },
  );

  it.each(["independent", "grouped"] as const)(
    "preserves %s named collapse semantics",
    async (mode) => {
      await renderWithSalt(<NamedGroupCollapseTestCase overflowMode={mode} />);
      setFixtureWidth(590);
      await expectButton(/Filters overflow\./i, true);
      await expectButton("Columns", false);
      await expectButton("Filter A", mode === "independent");
      await expectToolbarFits(`${mode} named filters toolbar`);
    },
  );

  it.each([
    [
      "asymmetric",
      {
        ariaLabel: "Centered asymmetric toolbar",
        endWidth: 80,
        startWidth: 220,
      },
    ],
    [
      "end-only",
      {
        ariaLabel: "Centered end-only toolbar",
        endWidth: 180,
        includeStart: false,
      },
    ],
  ] as const)("centers content with %s side bands", async (_name, props) => {
    await renderWithSalt(<CenteredToolbarTestCase {...props} />);
    await expectCentered(props.ariaLabel);
    await expectToolbarFits(props.ariaLabel);
  });

  it("keeps centered content centered after named overflow", async () => {
    await renderWithSalt(
      <CenteredToolbarTestCase
        ariaLabel="Centered named overflow toolbar"
        endWidth={180}
        includeOverflow
      />,
    );
    setFixtureWidth(420);
    await expectButton(/Actions overflow\./i, true);
    expect(
      overflowTrigger(/Actions overflow\./i)
        .element()
        .closest('[data-band-position="end"]'),
    ).not.toBeNull();
    await expectCentered("Centered named overflow toolbar");
  });
});

describe("Toolbar keyboard, focus and portals", () => {
  it("restores the last focused button on re-entry", async () => {
    await renderWithSalt(<KeyboardButtonsFixture />);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Cut" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{Tab}{Shift>}{Tab}{/Shift}");
    await expect
      .element(page.getByRole("button", { name: "Copy" }))
      .toHaveFocus();
  });

  it.each(["dropdown", "switch"])(
    "keeps focus on a pointer-entered %s",
    async (control) => {
      await renderWithSalt(<PointerEntryControlsTestCase />);
      const target =
        control === "dropdown"
          ? page.getByRole("combobox")
          : page.getByText("Pinned");
      await target.click();
      const focused =
        control === "dropdown"
          ? page.getByRole("combobox")
          : page.getByRole("switch", { name: "Pinned" });
      await expect.element(focused).toHaveFocus();
      await expect.element(page.getByPlaceholder("Search")).not.toHaveFocus();
    },
  );

  it.each(["dropdown", "switch"])(
    "keeps focus on a pointer-entered overflow %s",
    async (control) => {
      await renderWithSalt(<OverflowPointerEntryControlsTestCase />);
      await overflowTrigger().click();
      page.getByTestId("overflow-pointer-before").element().focus();
      const panel = page.getByRole("toolbar", { name: "More overflow" });
      const target =
        control === "dropdown"
          ? panel.getByRole("combobox")
          : panel.getByText("Overflow pinned");
      await target.click();
      const focused =
        control === "dropdown"
          ? panel.getByRole("combobox")
          : panel.getByRole("switch", { name: "Overflow pinned" });
      await expect.element(focused).toHaveFocus();
    },
  );

  it.each(["pointer", "keyboard"])(
    "sets initial overflow focus for %s opening",
    async (interaction) => {
      await renderWithSalt(<OverflowPointerEntryControlsTestCase />);
      if (interaction === "pointer") await overflowTrigger().click();
      else await openOverflowWithKeyboard(/Overflow\./i);
      await expect
        .element(page.getByRole("toolbar", { name: "More overflow" }))
        .toBeVisible();
      if (interaction === "pointer")
        await expect.element(overflowTrigger()).toHaveFocus();
      else
        await expect
          .element(page.getByPlaceholder("Overflow search"))
          .toHaveFocus();
    },
  );

  it("moves before the toolbar on Shift+Tab", async () => {
    await renderWithSalt(<KeyboardButtonsFixture />);
    page.getByRole("button", { name: "Run" }).element().focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByTestId("toolbar-before")).toHaveFocus();
  });

  it("does not Tab between buttons without a following focus target", async () => {
    await renderWithSalt(<OverflowPrioritiesKeyboardTestCase />);
    page.getByRole("button", { name: "Pinned" }).element().focus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Pinned" }))
      .not.toHaveFocus();
    await expect
      .element(page.getByRole("button", { name: "Views" }))
      .not.toHaveFocus();
  });

  it("wraps horizontal button navigation", async () => {
    await renderWithSalt(<KeyboardButtonsFixture />);
    page.getByRole("button", { name: "Cut" }).element().focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(page.getByRole("button", { name: "Run" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Cut" }))
      .toHaveFocus();
  });

  it("keeps text input arrows native and Tabs out", async () => {
    await renderWithSalt(<KeyboardTextInputFixture />);
    (await visibleLocator(page.getByPlaceholder("Search"))).element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(page.getByPlaceholder("Search")).toHaveFocus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Columns" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
  });

  it("keeps overflow text input arrows native and Tabs within its panel", async () => {
    await renderWithSalt(<OverflowTextInputKeyboardTestCase />);
    await overflowTrigger(/Filters overflow\./i).click();
    const input = page.getByPlaceholder("Overflow search");
    await input.click();
    await userEvent.keyboard("{ArrowRight}{Shift>}{Tab}{/Shift}");
    await expect
      .element(page.getByRole("button", { name: "Reset" }))
      .toHaveFocus();
    await input.click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Apply" }))
      .toHaveFocus();
  });

  it("keeps ComboBox arrows native and uses native Tab order", async () => {
    await renderWithSalt(<KeyboardComboBoxFixture />);
    const combo = page.getByRole("combobox");
    combo.element().focus();
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}{ArrowDown}");
    await expect.element(combo).toHaveAttribute("aria-activedescendant");
    await userEvent.keyboard("{Escape}{Tab}");
    await expect
      .element(page.getByRole("button", { name: "Columns" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
  });

  it("keeps multiselect pill arrows inside ComboBox", async () => {
    await renderWithSalt(<MultiselectComboBoxKeyboardTestCase />);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Remove New" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Remove Working" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}");
    await expect
      .element(page.getByRole("button", { name: "Remove Working" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(page.getByRole("button", { name: "Remove New" }))
      .toHaveFocus();
  });

  it("restores remembered focus without firing ComboBox focus", async () => {
    const onFocus = vi.fn();
    await renderWithSalt(
      <MultiselectComboBoxKeyboardTestCase onComboBoxFocus={onFocus} />,
    );
    await page.getByRole("button", { name: "Export" }).click();
    await page.getByTestId("toolbar-before").click();
    expect(onFocus).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Export" }))
      .toHaveFocus();
    expect(onFocus).not.toHaveBeenCalled();
  });

  it("uses arrows within and Tab outside a Dropdown", async () => {
    await renderWithSalt(<KeyboardDropdownFixture />);
    const combo = page.getByRole("combobox");
    combo.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Columns" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(combo).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
    combo.element().focus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByTestId("toolbar-before")).toHaveFocus();
  });

  it("Tabs inside DatePicker trigger and arrows from its calendar button", async () => {
    await renderWithSalt(<KeyboardDatePickerFixture />, {
      dateAdapter: adapterDayjs,
    });
    page.getByPlaceholder("Select date").element().focus();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Open Calendar" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Apply" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
  });

  it.each([false, true])(
    "hands off around toggle groups when firstDisabled=%s",
    async (disabled) => {
      await renderWithSalt(
        <KeyboardToggleGroupFixture disableFirstToggle={disabled} />,
      );
      page.getByRole("button", { name: "First Run" }).element().focus();
      const sequence = disabled
        ? ["Active", "Archived", "Run"]
        : ["All", "Active", "Archived", "Run"];
      for (const name of sequence) {
        await userEvent.keyboard("{ArrowRight}");
        const role = name === "Run" ? "button" : "radio";
        await expect
          .element(page.getByRole(role, { name, exact: true }))
          .toHaveFocus();
      }
      for (const name of sequence.slice(0, -1).reverse()) {
        await userEvent.keyboard("{ArrowLeft}");
        await expect.element(page.getByRole("radio", { name })).toHaveFocus();
      }
      await userEvent.keyboard("{ArrowLeft}");
      await expect
        .element(page.getByRole("button", { name: "First Run" }))
        .toHaveFocus();
    },
  );

  it.each([false, true])(
    "hands off inside overflow toggle groups when firstDisabled=%s",
    async (disabled) => {
      await renderWithSalt(
        <KeyboardOverflowToggleGroupFixture
          disableFirstToggle={disabled}
          width={260}
        />,
      );
      await openOverflowWithKeyboard(/Views overflow\./i);
      const sequence = disabled
        ? ["Active", "Archived", "Confirm view"]
        : ["All", "Active", "Archived", "Confirm view"];
      await expect
        .element(page.getByRole("button", { name: "Before toggles" }))
        .toHaveFocus();
      for (const name of sequence) {
        await userEvent.keyboard("{ArrowRight}");
        const role = name === "Confirm view" ? "button" : "radio";
        await expect.element(page.getByRole(role, { name })).toHaveFocus();
      }
    },
  );

  it("exposes overflow disclosure semantics", async () => {
    await renderWithSalt(<KeyboardOverflowFixture width={260} />);
    const trigger = overflowTrigger(/Actions overflow\./i);
    await expect.element(trigger).not.toHaveAttribute("aria-haspopup");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.element(trigger).toHaveAttribute("aria-controls");
    await trigger.click();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    await expect
      .poll(() => {
        const panelId = trigger.element().getAttribute("aria-controls");
        return panelId
          ? Boolean(
              document
                .getElementById(panelId)
                ?.querySelector('[role="toolbar"]'),
            )
          : false;
      })
      .toBe(true);
    await expect
      .element(page.getByRole("toolbar", { name: "Actions overflow" }))
      .toBeVisible();
  });

  it("navigates overflow and restores trigger focus on Escape", async () => {
    await renderWithSalt(<KeyboardOverflowFixture width={260} />);
    await openOverflowWithKeyboard(/Actions overflow\./i);
    await expect
      .element(page.getByRole("button", { name: "Export" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Run" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByRole("toolbar", { name: "Actions overflow" }))
      .not.toBeInTheDocument();
    await expect.element(overflowTrigger(/Actions overflow\./i)).toHaveFocus();
  });

  it.each([
    ["Tab", "{Tab}", "after"],
    ["Shift+Tab", "{Shift>}{Tab}{/Shift}", "trigger"],
  ])("closes overflow on %s", async (_name, key, target) => {
    await renderWithSalt(<KeyboardOverflowFixture width={260} />);
    await openOverflowWithKeyboard(/Actions overflow\./i);
    await userEvent.keyboard(key);
    await expect
      .element(page.getByRole("toolbar", { name: "Actions overflow" }))
      .not.toBeInTheDocument();
    if (target === "after")
      await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
    else
      await expect
        .element(overflowTrigger(/Actions overflow\./i))
        .toHaveFocus();
  });

  it("closes overflow when focus moves outside", async () => {
    await renderWithSalt(<KeyboardOverflowFixture width={260} />);
    await overflowTrigger(/Actions overflow\./i).click();
    await page.getByTestId("toolbar-after").click();
    await expect
      .element(page.getByRole("toolbar", { name: "Actions overflow" }))
      .not.toBeInTheDocument();
  });

  it("restores named overflow focus and panel navigation on re-entry", async () => {
    await renderWithSalt(<NamedOverflowFocusReentryTestCase />);
    await expectButton(/Filters overflow\./i, true);
    (await visibleLocator(page.getByPlaceholder("Search"))).element().focus();
    await expect
      .element(await visibleLocator(page.getByPlaceholder("Search")))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(overflowTrigger(/Filters overflow\./i)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(page.getByRole("combobox")).toHaveFocus();
    await page.getByTestId("toolbar-after").click();
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect.element(overflowTrigger(/Filters overflow\./i)).toHaveFocus();
    await userEvent.keyboard(" {ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Filters", exact: true }))
      .toHaveFocus();
  });

  it("restores visible shared overflow controls on re-entry", async () => {
    await renderWithSalt(<SharedOverflowFocusReentryTestCase />);
    page.getByPlaceholder("Search").element().focus();
    await userEvent.tab();
    await expect.element(page.getByRole("combobox")).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByTestId("toolbar-after")).toHaveFocus();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByRole("combobox")).toHaveFocus();
  });

  it.each([
    [
      "shared dropdown",
      () => <SharedOverflowDropdownPopupTestCase />,
      /Overflow\./i,
      "text",
    ],
    [
      "shared ComboBox",
      () => <SharedOverflowComboBoxFocusReentryTestCase />,
      /Overflow\./i,
      "value",
    ],
    [
      "named dropdown",
      () => <NamedOverflowFocusReentryTestCase />,
      /Filters overflow\./i,
      "text",
    ],
  ])(
    "keeps portaled %s selection inside overflow",
    async (_name, createFixture, triggerName, valueKind) => {
      await renderWithSalt(createFixture());
      await overflowTrigger(triggerName).click();
      const combo = page.getByRole("combobox");
      await combo.click();
      await page.getByRole("option", { name: "Option B" }).click();
      const panelName = String(triggerName).includes("Filters")
        ? "Filters overflow"
        : "More overflow";
      await expect
        .element(page.getByRole("toolbar", { name: panelName }))
        .toBeVisible();
      if (valueKind === "value")
        await expect.element(combo).toHaveValue("Option B");
      else await expect.element(combo).toHaveTextContent("Option B");
      await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
    },
  );

  it("preserves dropdown focus and selection when it moves into shared overflow", async () => {
    await renderWithSalt(<MixedControlsWidthChangeTestCase />);
    const combo = page.getByRole("combobox");
    await combo.click();
    await page.getByRole("option", { name: "Option B" }).click();
    setFixtureWidth(180);
    await openOverflowWithKeyboard(/Overflow\./i);
    await expect.element(combo).toHaveTextContent("Option B");
    await expect.element(combo).toHaveFocus();
  });

  it("keeps keyboard-opened overflow open during child-popup selection", async () => {
    await renderWithSalt(<SharedOverflowDropdownPopupTestCase />);
    await openOverflowWithKeyboard(/Overflow\./i);
    const combo = page.getByRole("combobox");
    await combo.click();
    await page.getByRole("option", { name: "Option B" }).click();
    await expect
      .element(page.getByRole("toolbar", { name: "More overflow" }))
      .toBeVisible();
    await expect.element(combo).toHaveTextContent("Option B");
  });

  it("closes overflow and child popup on outside click", async () => {
    await renderWithSalt(<SharedOverflowDropdownPopupTestCase />);
    await overflowTrigger().click();
    await page.getByRole("combobox").click();
    await page.getByTestId("toolbar-after").click();
    await expect
      .element(page.getByRole("toolbar", { name: "More overflow" }))
      .not.toBeInTheDocument();
    await expect.element(page.getByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps reopened child popups above overflow", async () => {
    await renderWithSalt(<SharedOverflowDropdownPopupTestCase />);
    await overflowTrigger().click();
    await page.getByRole("combobox").click();
    await page.getByTestId("toolbar-after").click();
    await overflowTrigger().click();
    await page.getByRole("combobox").click();
    await expect
      .element(page.getByRole("listbox"))
      .toHaveStyle({ zIndex: "1501" });
  });

  it("restores named controls to main toolbar arrow navigation after expansion", async () => {
    await renderWithSalt(<NamedOverflowFocusReentryTestCase />);
    await openOverflowWithKeyboard(/Filters overflow\./i);
    await userEvent.keyboard("{Escape}");
    setFixtureWidth(760);
    await expect
      .element(page.getByRole("toolbar", { name: "Filters overflow" }))
      .not.toBeInTheDocument();
    const combo = await visibleLocator(page.getByRole("combobox"));
    combo.element().focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Filters", exact: true }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}{ArrowLeft}");
    await expect.element(combo).toHaveFocus();
  });

  it("preserves the focused overflow control when its tray returns", async () => {
    await renderWithSalt(<NamedOverflowFocusReentryTestCase />);
    await openOverflowWithKeyboard(/Filters overflow\./i);
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Filters", exact: true }))
      .toHaveFocus();
    setFixtureWidth(760);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Filters", exact: true }))
      .toHaveFocus();
  });

  it("clears Input focus styling when named overflow returns", async () => {
    await renderWithSalt(<NamedOverflowInputFocusReentryTestCase />);
    await openOverflowWithKeyboard(/Actions overflow\./i);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.element(page.getByPlaceholder("Search")).toHaveFocus();
    setFixtureWidth(760);
    await expect.element(page.getByPlaceholder("Search")).not.toHaveFocus();
    expect(
      page
        .getByPlaceholder("Search")
        .element()
        .closest(".saltInput")
        ?.classList.contains("saltInput-focused"),
    ).toBe(false);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect.element(page.getByPlaceholder("Search")).toHaveFocus();
  });

  it("clears DateInput focus styling when shared overflow returns", async () => {
    await renderWithSalt(<SharedOverflowDateInputFocusReentryTestCase />, {
      dateAdapter: adapterDayjs,
    });
    await openOverflowWithKeyboard(/Overflow\./i);
    await userEvent.keyboard("{ArrowRight}");
    const input = page.getByRole("textbox", { name: "Settlement date" });
    await expect.element(input).toHaveFocus();
    setFixtureWidth(760);
    await expect.element(input).not.toHaveFocus();
    expect(
      input
        .element()
        .closest(".saltDateInput")
        ?.classList.contains("saltDateInput-focused"),
    ).toBe(false);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect.element(input).toHaveFocus();
  });

  it("keeps the portaled overflow panel within the viewport", async () => {
    await renderWithSalt(<KeyboardOverflowFixture width={260} />);
    await overflowTrigger(/Actions overflow\./i).click();
    await expect
      .element(page.getByRole("toolbar", { name: "Actions overflow" }))
      .toBeVisible();
    await expect
      .poll(
        () =>
          document.documentElement.scrollWidth ===
          document.documentElement.clientWidth,
      )
      .toBe(true);
  });

  it("preserves overflow focus across parent re-renders", async () => {
    await renderWithSalt(<KeyboardOverflowRerenderFixture width={260} />);
    await openOverflowWithKeyboard(/Actions overflow\./i);
    await userEvent.keyboard("{ArrowRight}");
    const rerender = page.getByRole("button", { name: "Re-render 0" });
    await expect.element(rerender).toHaveFocus();
    await rerender.click();
    await expect
      .element(page.getByRole("button", { name: "Re-render 1" }))
      .toHaveFocus();
  });

  it("uses visual ordering in RTL", async () => {
    await renderWithSalt(<KeyboardRtlFixture />);
    await page.getByTestId("toolbar-before").click();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "Columns" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(page.getByRole("button", { name: "Status" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(page.getByRole("button", { name: "Run" }))
      .toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect
      .element(page.getByRole("button", { name: "Status" }))
      .toHaveFocus();
  });
});
