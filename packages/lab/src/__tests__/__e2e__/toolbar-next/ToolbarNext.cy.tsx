import {
  Button,
  ComboBox,
  Dropdown,
  Input,
  Option,
  Switch,
} from "@salt-ds/core";
import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleGridPanel,
  DatePickerSingleInput,
  DatePickerTrigger,
} from "@salt-ds/date-components";
import { ToolbarContentNext, ToolbarNext, TooltrayNext } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { type FocusEventHandler, useState } from "react";
import * as toolbarNextStories from "../../../../stories/toolbar-next/toolbar-next.cypress.stories";

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
} = composeStories(toolbarNextStories);
const adapterDayjs = new AdapterDayjs();
const toolbarHarnessStyle = { height: 220, width: 760 };
const statusOptions = ["All", "New", "Working", "Fully Filled", "Cancelled"];

function openOverflowWithKeyboard(name: string | RegExp) {
  cy.findByRole("button", { name }).focus().should("be.focused");
  cy.realPress("Space");
}

type ToolbarNextQueuedAnimationFrame = {
  callback: FrameRequestCallback;
  cancelled: boolean;
  id: number;
};

interface ToolbarNextGuardedResizeTestControls {
  deliverResize: (target: Element) => void;
  flushNextFrame: () => void;
  restore: () => void;
}

type ToolbarNextGuardedResizeWindow = Cypress.AUTWindow & {
  __toolbarNextGuardedResizeTest?: ToolbarNextGuardedResizeTestControls;
};

function installToolbarNextGuardedResizeTestControls(win: Cypress.AUTWindow) {
  const testWindow = win as ToolbarNextGuardedResizeWindow;
  testWindow.__toolbarNextGuardedResizeTest?.restore();

  const originalRequestAnimationFrame = win.requestAnimationFrame.bind(win);
  const originalCancelAnimationFrame = win.cancelAnimationFrame.bind(win);
  const originalResizeObserver = win.ResizeObserver;
  const frameQueue: ToolbarNextQueuedAnimationFrame[] = [];
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
      if (!this.observedTargets.has(target)) {
        return false;
      }

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
    if (frame) {
      frame.cancelled = true;
    }
  }) as typeof win.cancelAnimationFrame;

  win.ResizeObserver = ControlledResizeObserver;

  testWindow.__toolbarNextGuardedResizeTest = {
    deliverResize(target) {
      const delivered = observers.some((observer) => observer.deliver(target));

      expect(
        delivered,
        "controlled ResizeObserver delivered observed target",
      ).to.equal(true);
    },
    flushNextFrame() {
      const frame = frameQueue.shift();
      expect(frame, "queued animation frame").to.not.equal(undefined);

      if (!frame || frame.cancelled) {
        return;
      }

      frame.callback(win.performance.now());
    },
    restore() {
      win.requestAnimationFrame = originalRequestAnimationFrame;
      win.cancelAnimationFrame = originalCancelAnimationFrame;
      win.ResizeObserver = originalResizeObserver;
      delete testWindow.__toolbarNextGuardedResizeTest;
    },
  };
}

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
      onClick={() => {
        setExpanded((current) => !current);
      }}
      style={{ width: expanded ? expandedWidth : collapsedWidth }}
    >
      {expanded ? expandedLabel : collapsedLabel}
    </Button>
  );
}

function SharedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 500 }}>
      <ToolbarNext aria-label="Toolbar with shared intrinsic width changes">
        <TooltrayNext overflowMode="none">
          <WidthChangingButton
            ariaLabel="Toggle shared width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={300}
          />
        </TooltrayNext>
        <TooltrayNext overflowMode="independent" overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 150 }}>
            Columns
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowMode="none">
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

function GuardedResizeDuringComputeTestCase() {
  return (
    <div className="GuardedResizeHarness" style={{ height: 220, width: 500 }}>
      <ToolbarNext aria-label="Toolbar with guarded resize work">
        <TooltrayNext overflowMode="none">
          <Button
            appearance="transparent"
            aria-label="Resize guarded tray"
            style={{ width: "var(--guarded-resize-width, 120px)" }}
          >
            Search
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowMode="independent" overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 150 }}>
            Columns
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowMode="none">
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

function OverflowPrioritiesKeyboardTestCase() {
  return (
    <ToolbarNext aria-label="Toolbar with overflow priorities">
      <TooltrayNext overflowMode="independent" overflowPriority={1}>
        <Button appearance="transparent">Pinned</Button>
      </TooltrayNext>
      <TooltrayNext overflowMode="independent" overflowPriority={1}>
        <Button appearance="transparent">Views</Button>
      </TooltrayNext>
      <TooltrayNext overflowMode="independent" overflowPriority={3}>
        <Button appearance="transparent">Status</Button>
      </TooltrayNext>
      <TooltrayNext align="end" overflowMode="independent" overflowPriority={5}>
        <Button appearance="transparent">Export</Button>
      </TooltrayNext>
    </ToolbarNext>
  );
}

function NamedGroupCollapseTestCase({
  overflowMode,
}: {
  overflowMode: "grouped" | "independent";
}) {
  return (
    <div className="Flexbox" style={toolbarHarnessStyle}>
      <ToolbarNext aria-label={`${overflowMode} named filters toolbar`}>
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button style={{ width: 140 }}>Search</Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={3}
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Filter A
            </Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={4}
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Status
            </Button>
          </TooltrayNext>
          <TooltrayNext
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode={overflowMode}
            overflowPriority={5}
          >
            <Button appearance="transparent" style={{ width: 110 }}>
              Columns
            </Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent" style={{ width: 100 }}>
              Refresh
            </Button>
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
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
    <div className="Flexbox" style={{ height: 220, width: 760 }}>
      <ToolbarNext aria-label={ariaLabel}>
        {includeStart ? (
          <ToolbarContentNext position="start">
            <TooltrayNext overflowMode="none">
              <Button style={{ width: startWidth }}>Start</Button>
            </TooltrayNext>
          </ToolbarContentNext>
        ) : null}
        <ToolbarContentNext position="center">
          <TooltrayNext overflowMode="none">
            <Button style={{ width: 140 }}>Center action</Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext
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
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </div>
  );
}

function NamedIntrinsicWidthTestCase() {
  return (
    <div className="IntrinsicWidthHarness" style={{ height: 220, width: 480 }}>
      <ToolbarNext aria-label="Toolbar with named intrinsic width changes">
        <TooltrayNext overflowMode="none">
          <WidthChangingButton
            ariaLabel="Toggle named width"
            collapsedLabel="Search"
            collapsedWidth={120}
            expandedLabel="Search with advanced filters"
            expandedWidth={360}
          />
        </TooltrayNext>
        <TooltrayNext
          align="end"
          overflowGroup="Actions"
          overflowLabel="Actions"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Export</Button>
          <Button appearance="solid">Apply</Button>
        </TooltrayNext>
      </ToolbarNext>
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
      <Button
        onClick={() => {
          setWide(nextWide);
        }}
      >
        {nextWide ? "Use long hidden label" : "Use short hidden label"}
      </Button>
      <div className="Flexbox" style={{ height: 220, width: 260 }}>
        <ToolbarNext aria-label="Toolbar with hidden intrinsic width changes">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent" style={{ width: 120 }}>
              Pinned
            </Button>
          </TooltrayNext>
          <TooltrayNext overflowMode="independent" overflowPriority={5}>
            <Button appearance="transparent" style={{ width: wide ? 320 : 80 }}>
              {wide ? "Hidden action with a long label" : "Short"}
            </Button>
          </TooltrayNext>
          <TooltrayNext align="end" overflowMode="none">
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </TooltrayNext>
        </ToolbarNext>
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
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Named overflow focus toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Input bordered placeholder="Search" />
          </TooltrayNext>
          <TooltrayNext
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
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext
            overflowGroup="Actions"
            overflowLabel="Actions"
            overflowMode="grouped"
            overflowPriority={6}
          >
            <Button appearance="transparent">Export</Button>
            <Button appearance="transparent">Settings</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function NamedOverflowInputFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Named overflow input focus toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext
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
            <Button appearance="transparent">Settings</Button>
            <Input bordered placeholder="Search" style={{ width: 180 }} />
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function SharedOverflowDateInputFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 260, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Shared overflow date input focus toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowPriority={6}>
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
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext>
            <Button appearance="transparent">Pinned</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function SharedOverflowFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Shared overflow focus toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext>
            <Input bordered placeholder="Search" style={{ width: 130 }} />
            <Dropdown
              bordered
              defaultSelected={["Option A"]}
              style={{ width: 90 }}
            >
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext>
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function PointerEntryControlsTestCase() {
  return (
    <div className="Flexbox" style={{ height: 220, width: 640 }}>
      <ToolbarNext aria-label="Pointer entry controls toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Input bordered placeholder="Search" />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Switch label="Pinned" />
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </div>
  );
}

function OverflowPointerEntryControlsTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 260, width: 220, flexDirection: "column" }}
    >
      <button data-testid="overflow-pointer-before">Before toolbar</button>
      <ToolbarNext aria-label="Overflow pointer entry controls toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent" style={{ width: 170 }}>
              Pinned
            </Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowPriority={5}>
            <Input bordered placeholder="Overflow search" />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
            <Switch label="Overflow pinned" />
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
    </div>
  );
}

function SharedOverflowComboBoxFocusReentryTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 320, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Shared overflow combo box toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext>
            <Input bordered placeholder="Search" />
            <ComboBox bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
              <Option value="Option C" />
            </ComboBox>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext>
            <Button appearance="transparent">Export</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
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
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Multiselect combo box keyboard toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
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
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent">Export</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function SharedOverflowDropdownPopupTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 220, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Shared overflow dropdown toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext overflowMode="none">
            <Button appearance="transparent" style={{ width: 170 }}>
              Pinned
            </Button>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext overflowPriority={5}>
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function MixedControlsWidthChangeTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 520, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Mixed controls width change toolbar">
        <ToolbarContentNext position="start">
          <TooltrayNext>
            <Input bordered placeholder="Search" style={{ width: 150 }} />
            <Dropdown bordered defaultSelected={["Option A"]}>
              <Option value="Option A" />
              <Option value="Option B" />
            </Dropdown>
          </TooltrayNext>
        </ToolbarContentNext>
        <ToolbarContentNext position="end">
          <TooltrayNext>
            <Button appearance="transparent">Toggle</Button>
            <Button appearance="solid">Run</Button>
          </TooltrayNext>
        </ToolbarContentNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function OverflowTextInputKeyboardTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 240, width: 180, flexDirection: "column" }}
    >
      <button data-testid="toolbar-before">Before toolbar</button>
      <ToolbarNext aria-label="Overflow text input toolbar">
        <TooltrayNext
          overflowGroup="Filters"
          overflowLabel="Filters"
          overflowMode="grouped"
          overflowPriority={5}
        >
          <Button appearance="transparent">Reset</Button>
          <Input bordered placeholder="Overflow search" />
          <Button appearance="transparent">Apply</Button>
        </TooltrayNext>
      </ToolbarNext>
      <button data-testid="toolbar-after">After toolbar</button>
    </div>
  );
}

function SharedBoundaryCollapseTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 220, width: 760, flexDirection: "column" }}
    >
      <ToolbarNext aria-label="Shared boundary toolbar">
        <TooltrayNext overflowMode="none">
          <Button appearance="transparent" style={{ width: 120 }}>
            Pinned
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowPriority={1}>
          <Button appearance="transparent" style={{ width: 110 }}>
            Low priority
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowPriority={5}>
          <Button appearance="transparent" style={{ width: 130 }}>
            High priority
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowPriority={0}>
          <Button appearance="solid" style={{ width: 100 }}>
            Run
          </Button>
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

function MixedTrayCompressionTestCase() {
  return (
    <div
      className="Flexbox"
      style={{ height: 220, width: 760, flexDirection: "column" }}
    >
      <ToolbarNext aria-label="Mixed tray compression toolbar">
        <TooltrayNext overflowMode="none">
          <Button appearance="transparent" style={{ width: 120 }}>
            Pinned
          </Button>
        </TooltrayNext>
        <TooltrayNext overflowPriority={5}>
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
        </TooltrayNext>
      </ToolbarNext>
    </div>
  );
}

function setFixtureWidth(width: number) {
  cy.get(".Flexbox").invoke("css", "width", `${width}px`);
}

function parsePixelValue(value: string) {
  return Number.parseFloat(value || "0") || 0;
}

function isVisibleElement(element: HTMLElement) {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const rect = element.getBoundingClientRect();

  return (
    style?.display !== "none" &&
    style?.visibility !== "hidden" &&
    rect.width > 0 &&
    rect.height > 0
  );
}

function getVisibleElementRects(elements: Iterable<HTMLElement>) {
  return Array.from(elements)
    .filter(isVisibleElement)
    .map((element) => element.getBoundingClientRect());
}

function shrinkFixtureBelowVisibleToolbarContent(toolbarName: string) {
  cy.findByRole("toolbar", { name: toolbarName }).then(($toolbar) => {
    const toolbar = $toolbar[0];
    const styles = toolbar.ownerDocument.defaultView?.getComputedStyle(toolbar);
    const visibleSlotRects = getVisibleElementRects(
      toolbar.querySelectorAll<HTMLElement>(".saltToolbarNextOverflow-slot"),
    );
    const left = Math.min(...visibleSlotRects.map((rect) => rect.left));
    const right = Math.max(...visibleSlotRects.map((rect) => rect.right));
    const frameWidth =
      parsePixelValue(styles?.paddingLeft ?? "0") +
      parsePixelValue(styles?.paddingRight ?? "0") +
      parsePixelValue(styles?.borderLeftWidth ?? "0") +
      parsePixelValue(styles?.borderRightWidth ?? "0");

    setFixtureWidth(Math.ceil(right - left + frameWidth) - 1);
  });
}

function expectToolbarFits(name: string) {
  cy.findByRole("toolbar", { name }).should(($toolbar) => {
    expect($toolbar[0]?.scrollWidth, `scroll width for ${name}`).to.be.at.most(
      $toolbar[0]?.clientWidth ?? 0,
    );
  });
}

function expectToolbarSlotsDoNotIntersect(name: string) {
  cy.findByRole("toolbar", { name }).should(($toolbar) => {
    const toolbar = $toolbar[0];
    const slotRects = getVisibleElementRects(
      toolbar.querySelectorAll<HTMLElement>(".saltToolbarNextOverflow-slot"),
    );

    for (const [index, rect] of slotRects.entries()) {
      for (const nextRect of slotRects.slice(index + 1)) {
        const horizontalOverlap =
          Math.min(rect.right, nextRect.right) -
          Math.max(rect.left, nextRect.left);
        const verticalOverlap =
          Math.min(rect.bottom, nextRect.bottom) -
          Math.max(rect.top, nextRect.top);

        expect(
          horizontalOverlap > 0.5 && verticalOverlap > 0.5,
          `slot overlap for ${name}`,
        ).to.equal(false);
      }
    }
  });
}

function expectVisibleSeparators(count: number) {
  cy.get("body").should(($body) => {
    expect($body.find('[role="separator"]:visible')).to.have.length(count);
  });
}

function expectIntrinsicHarnessWidth(width: number) {
  cy.get(".IntrinsicWidthHarness").should("have.css", "width", `${width}px`);
}

function expectCenteredControl(toolbarName: string, controlName: string) {
  cy.findByRole("toolbar", { name: toolbarName }).then(($toolbar) => {
    const toolbarRect = $toolbar[0]?.getBoundingClientRect();

    cy.findByRole("button", { name: controlName }).then(($button) => {
      const buttonRect = $button[0]?.getBoundingClientRect();
      const toolbarMidpoint =
        (toolbarRect?.left ?? 0) + (toolbarRect?.width ?? 0) / 2;
      const buttonMidpoint =
        (buttonRect?.left ?? 0) + (buttonRect?.width ?? 0) / 2;

      expect(
        Math.abs(toolbarMidpoint - buttonMidpoint),
        `center offset for ${toolbarName}`,
      ).to.be.lessThan(1.5);
    });
  });
}

function recordToolbarVisibleTextSnapshots(toolbarName: string, alias: string) {
  cy.findByRole("toolbar", { name: toolbarName }).then(($toolbar) => {
    const toolbar = $toolbar[0];
    const win = toolbar.ownerDocument.defaultView;
    if (!win) {
      return;
    }
    const snapshots: string[] = [];
    const recordSnapshot = () => {
      snapshots.push(
        Array.from(toolbar.querySelectorAll<HTMLElement>("button"))
          .filter(isVisibleElement)
          .map((button) => button.textContent?.trim() ?? "")
          .join("|"),
      );
    };

    recordSnapshot();

    const observer = new win.MutationObserver(recordSnapshot);
    observer.observe(toolbar, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    cy.wrap({ observer, snapshots }, { log: false }).as(alias);
  });
}

describe("Given ToolbarNext variants and appearances", () => {
  it("applies primary and bordered classes by default", () => {
    cy.mount(
      <ToolbarNext aria-label="Default toolbar">
        <TooltrayNext>
          <Button>Action</Button>
        </TooltrayNext>
      </ToolbarNext>,
    );

    cy.findByRole("toolbar", { name: "Default toolbar" })
      .should("have.class", "saltToolbarNext-primary")
      .and("have.class", "saltToolbarNext-bordered");
  });

  it("applies secondary and tertiary variant classes", () => {
    cy.mount(
      <>
        <ToolbarNext variant="secondary" aria-label="Secondary toolbar">
          <TooltrayNext>
            <Button>Secondary action</Button>
          </TooltrayNext>
        </ToolbarNext>
        <ToolbarNext variant="tertiary" aria-label="Tertiary toolbar">
          <TooltrayNext>
            <Button>Tertiary action</Button>
          </TooltrayNext>
        </ToolbarNext>
      </>,
    );

    cy.findByRole("toolbar", { name: "Secondary toolbar" })
      .should("have.class", "saltToolbarNext-secondary")
      .and("have.class", "saltToolbarNext-bordered");
    cy.findByRole("toolbar", { name: "Tertiary toolbar" })
      .should("have.class", "saltToolbarNext-tertiary")
      .and("have.class", "saltToolbarNext-bordered");
  });

  it("applies transparent appearance without bordered chrome", () => {
    cy.mount(
      <ToolbarNext appearance="transparent" aria-label="Transparent toolbar">
        <TooltrayNext>
          <Button>Action</Button>
        </TooltrayNext>
      </ToolbarNext>,
    );

    cy.findByRole("toolbar", { name: "Transparent toolbar" })
      .should("have.class", "saltToolbarNext-primary")
      .and("have.class", "saltToolbarNext-transparent")
      .and("not.have.class", "saltToolbarNext-bordered");
  });
});

describe("Given ToolbarNext overflow measurements", () => {
  afterEach(() => {
    cy.window({ log: false }).then((win) => {
      (
        win as ToolbarNextGuardedResizeWindow
      ).__toolbarNextGuardedResizeTest?.restore();
    });
  });

  it("collapses the first shared tray as soon as measured content exceeds the container", () => {
    cy.mount(<SharedBoundaryCollapseTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "High priority" }).should("be.visible");
    expectToolbarFits("Shared boundary toolbar");
    expectToolbarSlotsDoNotIntersect("Shared boundary toolbar");

    shrinkFixtureBelowVisibleToolbarContent("Shared boundary toolbar");

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "High priority" }).should("not.exist");
    cy.findByRole("button", { name: "Low priority" }).should("be.visible");
    cy.findByRole("button", { name: "Pinned" }).should("be.visible");
    cy.findByRole("button", { name: "Run" }).should("be.visible");
    expectToolbarFits("Shared boundary toolbar");
    expectToolbarSlotsDoNotIntersect("Shared boundary toolbar");
  });

  it("collapses a mixed-control tray before its controls compress", () => {
    cy.mount(<MixedTrayCompressionTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByText("Show total").should("be.visible");
    cy.findByText("Sort by highest balance").should("be.visible");
    cy.findByRole("button", { name: "Add view" }).should("be.visible");
    expectToolbarFits("Mixed tray compression toolbar");
    expectToolbarSlotsDoNotIntersect("Mixed tray compression toolbar");

    shrinkFixtureBelowVisibleToolbarContent("Mixed tray compression toolbar");

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByText("Show total").should("not.be.visible");
    cy.findByText("Sort by highest balance").should("not.be.visible");
    cy.findByRole("button", { name: "Add view" }).should("not.exist");
    cy.findByRole("button", { name: "Pinned" }).should("be.visible");
    expectToolbarFits("Mixed tray compression toolbar");
    expectToolbarSlotsDoNotIntersect("Mixed tray compression toolbar");
  });

  it("collapses omitted overflowMode trays into the shared generic trigger by default", () => {
    cy.mount(<DefaultSharedOverflowFixture width={420} />);

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectToolbarFits("Toolbar with default shared overflow");
  });

  it("keeps divider-heavy shared overflow layouts clipped-free as trays collapse", () => {
    cy.mount(<OverflowDividersFixture width={560} />);

    expectVisibleSeparators(2);
    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    expectToolbarFits("Toolbar with divider overflow");

    setFixtureWidth(360);
    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    expectVisibleSeparators(1);
    expectToolbarFits("Toolbar with divider overflow");

    setFixtureWidth(260);
    expectVisibleSeparators(0);
    expectToolbarFits("Toolbar with divider overflow");
  });

  it("measures named trigger anchors with preserved dividers before clipping", () => {
    cy.mount(<NamedOverflowWithDividersFixture width={760} />);

    expectToolbarFits("Data entry toolbar with named overflow");

    setFixtureWidth(540);
    cy.findByRole("button", { name: /Actions overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Actions overflow\./i })
      .closest('[data-position="start"]')
      .should("exist");
    expectVisibleSeparators(1);
    expectToolbarFits("Data entry toolbar with named overflow");

    setFixtureWidth(420);
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Filters overflow\./i })
      .closest('[data-position="start"]')
      .should("exist");
    cy.findByRole("button", { name: /Actions overflow\./i }).should(
      "be.visible",
    );
    expectVisibleSeparators(1);
    expectToolbarFits("Data entry toolbar with named overflow");
  });

  it("accounts for spacing overrides when deciding shared overflow", () => {
    cy.mount(<SpacingOverflowFixture width={520} />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Primary" }).should("be.visible");
    cy.findByRole("button", { name: "Run" }).should("be.visible");
    expectToolbarFits("Toolbar with overflow spacing");

    setFixtureWidth(360);
    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Primary" }).should("be.visible");
    cy.findByRole("button", { name: "Run" }).should("be.visible");
    expectToolbarFits("Toolbar with overflow spacing");
  });

  it("remeasures shared overflow when a visible tray changes width", () => {
    cy.mount(<SharedIntrinsicWidthTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");

    cy.findByRole("button", { name: "Toggle shared width" }).click();

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");

    cy.findByRole("button", { name: "Toggle shared width" }).click();

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    expectIntrinsicHarnessWidth(500);
    expectToolbarFits("Toolbar with shared intrinsic width changes");
  });

  it("queues resize work requested while overflow computation is guarded", () => {
    cy.window().then((win) => {
      installToolbarNextGuardedResizeTestControls(win);
    });
    cy.mount(<GuardedResizeDuringComputeTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");
    cy.window().then((win) => {
      const controls = (win as ToolbarNextGuardedResizeWindow)
        .__toolbarNextGuardedResizeTest;
      expect(controls, "guarded resize test controls").to.not.equal(undefined);
      controls?.flushNextFrame();
    });

    cy.findByRole("button", { name: "Resize guarded tray" }).then(($button) => {
      const button = $button[0];
      const harness = button.closest<HTMLElement>(".GuardedResizeHarness");
      const slot = button.closest<HTMLElement>(".saltToolbarNextOverflow-slot");

      expect(harness, "resize harness").to.not.equal(null);
      expect(slot, "observed toolbar slot").to.not.equal(null);
      harness?.style.setProperty("--guarded-resize-width", "320px");

      cy.window().then((win) => {
        const controls = (win as ToolbarNextGuardedResizeWindow)
          .__toolbarNextGuardedResizeTest;
        expect(controls, "guarded resize test controls").to.not.equal(
          undefined,
        );

        if (!slot || !controls) {
          return;
        }

        controls.deliverResize(slot);
        controls.flushNextFrame();
        controls.flushNextFrame();
        controls.flushNextFrame();
      });
    });

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    expectToolbarFits("Toolbar with guarded resize work");
  });

  it("remeasures named overflow when a visible tray changes width", () => {
    cy.mount(<NamedIntrinsicWidthTestCase />);

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Actions overflow\./i }).should(
        "not.exist",
      );
      cy.findByRole("button", { name: "Export" }).should("be.visible");
      cy.findByRole("button", { name: "Apply" }).should("be.visible");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");

    cy.findByRole("button", { name: "Toggle named width" }).click();

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Actions overflow\./i }).should(
        "be.visible",
      );
      cy.findByRole("button", { name: "Export" }).should("not.exist");
      cy.findByRole("button", { name: "Apply" }).should("not.exist");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");

    cy.findByRole("button", { name: "Toggle named width" }).click();

    cy.findByRole("toolbar", {
      name: "Toolbar with named intrinsic width changes",
    }).within(() => {
      cy.findByRole("button", { name: /Actions overflow\./i }).should(
        "not.exist",
      );
      cy.findByRole("button", { name: "Export" }).should("be.visible");
      cy.findByRole("button", { name: "Apply" }).should("be.visible");
    });
    expectIntrinsicHarnessWidth(480);
    expectToolbarFits("Toolbar with named intrinsic width changes");
  });

  it("remeasures shared overflow when a hidden tray changes width", () => {
    cy.mount(<HiddenOverflowWidthChangeTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", { name: "Short" }).should("not.exist");
    expectToolbarFits("Toolbar with hidden intrinsic width changes");
    recordToolbarVisibleTextSnapshots(
      "Toolbar with hidden intrinsic width changes",
      "hiddenOverflowSnapshots",
    );

    cy.findByRole("button", { name: "Use long hidden label" }).click();
    setFixtureWidth(420);

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", {
      name: "Hidden action with a long label",
    }).should("not.exist");
    expectToolbarFits("Toolbar with hidden intrinsic width changes");
    cy.get<{
      observer: MutationObserver;
      snapshots: string[];
    }>("@hiddenOverflowSnapshots").then(({ observer, snapshots }) => {
      observer.disconnect();
      expect(
        snapshots.some((snapshot) =>
          snapshot.includes("Hidden action with a long label"),
        ),
        "hidden tray did not appear in the main toolbar during resize",
      ).to.equal(false);
    });
  });

  it("remeasures shared overflow when a hidden tray shrinks", () => {
    cy.mount(<HiddenOverflowWidthChangeTestCase initialWide />);

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByRole("button", {
      name: "Hidden action with a long label",
    }).should("not.exist");
    expectToolbarFits("Toolbar with hidden intrinsic width changes");

    cy.findByRole("button", { name: "Use short hidden label" }).click();
    setFixtureWidth(420);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");
    cy.findByRole("button", { name: "Short" }).should("be.visible");
    expectToolbarFits("Toolbar with hidden intrinsic width changes");
  });

  it("preserves progressive versus grouped behavior for multi-tray named overflow", () => {
    cy.mount(<NamedGroupCollapseTestCase overflowMode="independent" />);

    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "not.exist",
    );
    cy.findByRole("button", { name: "Status" }).should("be.visible");
    cy.findByRole("button", { name: "Columns" }).should("be.visible");

    setFixtureWidth(590);
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    cy.findByRole("button", { name: "Filter A" }).should("be.visible");
    expectToolbarFits("independent named filters toolbar");

    cy.mount(<NamedGroupCollapseTestCase overflowMode="grouped" />);

    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "not.exist",
    );
    setFixtureWidth(590);
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: "Columns" }).should("not.exist");
    cy.findByRole("button", { name: "Filter A" }).should("not.exist");
    expectToolbarFits("grouped named filters toolbar");
  });

  it("keeps centered content on the toolbar midpoint with asymmetric side widths", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered asymmetric toolbar"
        endWidth={80}
        startWidth={220}
      />,
    );
    expectCenteredControl("Centered asymmetric toolbar", "Center action");
    expectToolbarFits("Centered asymmetric toolbar");
  });

  it("keeps centered content centered when only the end band is populated", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered end-only toolbar"
        endWidth={180}
        includeStart={false}
      />,
    );

    expectCenteredControl("Centered end-only toolbar", "Center action");
    expectToolbarFits("Centered end-only toolbar");
  });

  it("keeps centered content centered after a named overflow trigger replaces end content", () => {
    cy.mount(
      <CenteredToolbarTestCase
        ariaLabel="Centered named overflow toolbar"
        endWidth={180}
        includeOverflow
      />,
    );

    setFixtureWidth(420);
    cy.findByRole("button", { name: /Actions overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Actions overflow\./i })
      .closest('[data-band-position="end"]')
      .should("exist");
    expectCenteredControl("Centered named overflow toolbar", "Center action");
    expectToolbarFits("Centered named overflow toolbar");
  });
});

describe("Given ToolbarNext keyboard navigation", () => {
  it("restores the last focused control when tabbing back into the toolbar", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Copy" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("button", { name: "Copy" }).should("be.focused");
  });

  it("keeps focus on a dropdown entered by mouse through its trailing affordance", () => {
    cy.mount(<PointerEntryControlsTestCase />);

    cy.findByRole("combobox").realClick({ position: "right" });

    cy.findByRole("combobox").should("be.focused");
    cy.findByPlaceholderText("Search").should("not.be.focused");
  });

  it("keeps focus on a switch entered by mouse through its label", () => {
    cy.mount(<PointerEntryControlsTestCase />);

    cy.findByText("Pinned").realClick();

    cy.findByRole("switch", { name: "Pinned" }).should("be.focused");
    cy.findByPlaceholderText("Search").should("not.be.focused");
  });

  it("keeps focus on an overflow dropdown entered by mouse through its trailing affordance", () => {
    cy.mount(<OverflowPointerEntryControlsTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByTestId("overflow-pointer-before").focus();

    cy.findByRole("toolbar", { name: "More overflow" }).within(() => {
      cy.findByRole("combobox").realClick({ position: "right" });
      cy.findByRole("combobox").should("be.focused");
      cy.findByPlaceholderText("Overflow search").should("not.be.focused");
    });
  });

  it("keeps focus on an overflow switch entered by mouse through its label", () => {
    cy.mount(<OverflowPointerEntryControlsTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByTestId("overflow-pointer-before").focus();

    cy.findByRole("toolbar", { name: "More overflow" }).within(() => {
      cy.findByText("Overflow pinned").realClick();
      cy.findByRole("switch", { name: "Overflow pinned" }).should("be.focused");
      cy.findByPlaceholderText("Overflow search").should("not.be.focused");
    });
  });

  it("keeps focus on the overflow trigger when opening an input-first overflow by mouse", () => {
    cy.mount(<OverflowPointerEntryControlsTestCase />);

    cy.findByRole("button", { name: /Overflow\./i })
      .realClick()
      .should("be.focused");

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByPlaceholderText("Overflow search").should("not.be.focused");
  });

  it("moves focus to the first overflow control when opening an input-first overflow by keyboard", () => {
    cy.mount(<OverflowPointerEntryControlsTestCase />);

    openOverflowWithKeyboard(/Overflow\./i);

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByPlaceholderText("Overflow search").should("be.focused");
  });

  it("moves focus before the toolbar on Shift+Tab from a button", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByRole("button", { name: "Run" }).focus();
    cy.realPress(["Shift", "Tab"]);
    cy.findByTestId("toolbar-before").should("be.focused");
  });

  it("does not tab between buttons when no focus target follows the toolbar", () => {
    cy.mount(<OverflowPrioritiesKeyboardTestCase />);

    cy.findByRole("button", { name: "Pinned" }).focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Pinned" }).should("not.be.focused");
    cy.findByRole("button", { name: "Views" }).should("not.be.focused");
  });

  it("wraps horizontal navigation from the last control back to the first", () => {
    cy.mount(<KeyboardButtonsFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Run" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Cut" }).should("be.focused");
  });

  it("keeps plain text inputs on native left/right behavior and uses Tab to leave them", () => {
    cy.mount(<KeyboardTextInputFixture />);

    cy.findByPlaceholderText("Search").focus();
    cy.realPress("ArrowRight");
    cy.findByPlaceholderText("Search").should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("keeps overflow panel text inputs on native left/right behavior and uses Tab within the panel", () => {
    cy.mount(<OverflowTextInputKeyboardTestCase />);

    cy.findByRole("button", { name: /Filters overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Filters overflow" }).within(() => {
      cy.findByRole("button", { name: "Reset" }).should("be.visible");
      cy.findByPlaceholderText("Overflow search")
        .should("be.visible")
        .click()
        .should("be.focused");
      cy.findByRole("button", { name: "Apply" }).should("be.visible");
    });

    cy.realPress("ArrowRight");
    cy.findByPlaceholderText("Overflow search").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Reset" }).should("be.focused");

    cy.findByRole("toolbar", { name: "Filters overflow" }).within(() => {
      cy.findByPlaceholderText("Overflow search").click().should("be.focused");
    });
    cy.realPress("Tab");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Apply" }).should("be.focused");
  });

  it("keeps combo boxes on native left/right behavior and native Tab order", () => {
    cy.mount(<KeyboardComboBoxFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("ArrowRight");
    cy.findByRole("combobox").should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowDown");
    cy.findByRole("combobox").should("have.attr", "aria-activedescendant");
    cy.realPress("Escape");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("keeps multiselect combo box pill arrow navigation inside the combo box", () => {
    cy.mount(<MultiselectComboBoxKeyboardTestCase />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.contains("button", "New").should("be.focused");

    cy.realPress("ArrowRight");
    cy.contains("button", "Working").should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowLeft");
    cy.contains("button", "Working").should("be.focused");

    cy.realPress("ArrowLeft");
    cy.contains("button", "New").should("be.focused");
  });

  it("restores remembered focus without firing combo box focus on toolbar re-entry", () => {
    const comboBoxFocusSpy = cy.stub().as("comboBoxFocus");

    cy.mount(
      <MultiselectComboBoxKeyboardTestCase
        onComboBoxFocus={comboBoxFocusSpy}
      />,
    );

    cy.findByRole("button", { name: "Export" })
      .realClick()
      .should("be.focused");
    cy.findByTestId("toolbar-before").focus();
    cy.get("@comboBoxFocus").should("not.have.been.called");

    cy.realPress("Tab");
    cy.findByRole("button", { name: "Export" }).should("be.focused");
    cy.get("@comboBoxFocus").should("not.have.been.called");
  });

  it("uses Left and Right to move through the toolbar from a dropdown", () => {
    cy.mount(<KeyboardDropdownFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");
  });

  it("uses Tab and Shift+Tab to leave the toolbar from a dropdown", () => {
    cy.mount(<KeyboardDropdownFixture />);

    cy.findByRole("combobox").focus();
    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.findByRole("combobox").focus();
    cy.realPress(["Shift", "Tab"]);
    cy.findByTestId("toolbar-before").should("be.focused");
  });

  it("allows tabbing within the date picker trigger and arrowing from the calendar button", () => {
    cy.setDateAdapter(adapterDayjs);
    cy.mount(<KeyboardDatePickerFixture />);

    cy.findByPlaceholderText("Select date").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Open Calendar" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("toolbar", {
      name: "Keyboard date picker toolbar",
    }).within(() => {
      cy.findByRole("button", { name: "Apply" }).should("be.focused");
    });

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("moves through toggle buttons and hands off at toolbar boundaries", () => {
    cy.mount(<KeyboardToggleGroupFixture />);

    cy.findByRole("button", { name: "First Run" }).focus();
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "First Run" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("radio", { name: "Active" }).should("be.focused");
  });

  it("does not skip a toggle group when its first toggle button is disabled", () => {
    cy.mount(<KeyboardToggleGroupFixture disableFirstToggle />);

    cy.findByRole("button", { name: "First Run" }).focus();
    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "First Run" }).should("be.focused");
  });

  it("moves through toggle buttons and hands off inside overflow panels", () => {
    cy.mount(<KeyboardOverflowToggleGroupFixture width={260} />);

    openOverflowWithKeyboard(/Views overflow\./i);
    cy.findByRole("toolbar", { name: "Views overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Confirm view" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "All" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");
  });

  it("does not skip a disabled-leading toggle group inside overflow panels", () => {
    cy.mount(
      <KeyboardOverflowToggleGroupFixture disableFirstToggle width={260} />,
    );

    openOverflowWithKeyboard(/Views overflow\./i);
    cy.findByRole("toolbar", { name: "Views overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Confirm view" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Archived" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("radio", { name: "Active" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Before toggles" }).should("be.focused");
  });

  it("exposes overflow triggers as disclosure buttons that open toolbar panels", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Actions overflow\./i }).as(
      "overflowTrigger",
    );
    cy.get("@overflowTrigger").should("not.have.attr", "aria-haspopup");
    cy.get("@overflowTrigger").should("have.attr", "aria-expanded", "false");
    cy.get("@overflowTrigger")
      .invoke("attr", "aria-controls")
      .should("match", /\S/);

    cy.get("@overflowTrigger").click();
    cy.get("@overflowTrigger").should("not.have.attr", "aria-haspopup");
    cy.get("@overflowTrigger").should("have.attr", "aria-expanded", "true");
    cy.get("@overflowTrigger")
      .invoke("attr", "aria-controls")
      .then((panelId) => {
        expect(panelId, "overflow panel id").to.be.a("string").and.not.be.empty;

        cy.document().then((document) => {
          expect(document.getElementById(String(panelId))).not.to.equal(null);
        });
        cy.findByRole("toolbar", { name: "Actions overflow" }).should(
          "be.visible",
        );
      });
  });

  it("moves focus into overflow panels, supports horizontal navigation there, and returns focus on Escape", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    openOverflowWithKeyboard(/Actions overflow\./i);
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Run" }).should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByRole("button", { name: /Actions overflow\./i }).should(
      "be.focused",
    );
  });

  it("closes a portaled overflow panel and moves focus after the toolbar on Tab", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    openOverflowWithKeyboard(/Actions overflow\./i);
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("Tab");

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("closes a portaled overflow panel and returns focus to the trigger on Shift+Tab", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    openOverflowWithKeyboard(/Actions overflow\./i);
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress(["Shift", "Tab"]);

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByRole("button", { name: /Actions overflow\./i }).should(
      "be.focused",
    );
  });

  it("closes a portaled overflow panel when focus moves outside", () => {
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");

    cy.findByTestId("toolbar-after").click();

    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByTestId("toolbar-after").should("be.focused");
  });

  it("restores focus to the named overflow trigger when tabbing back into the toolbar", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByPlaceholderText("Search").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.focused",
    );

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.findByTestId("toolbar-after").click();
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.focused",
    );

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
  });

  it("restores visible shared overflow controls when re-entering through the overflow trigger", () => {
    cy.mount(<SharedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("be.visible");
    cy.findByPlaceholderText("Search").focus();
    cy.realPress("Tab");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Tab");
    cy.findByTestId("toolbar-after").should("be.focused");

    cy.realPress(["Shift", "Tab"]);
    cy.findByRole("combobox").should("be.focused");
  });

  it("keeps a portaled dropdown selection inside the shared overflow panel", () => {
    cy.mount(<SharedOverflowDropdownPopupTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option B" }).realClick();

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").should("have.text", "Option B");
    cy.findByRole("listbox").should("not.exist");
  });

  it("keeps a portaled combo box selection inside the shared overflow panel", () => {
    cy.mount(<SharedOverflowComboBoxFocusReentryTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option B" }).realClick();

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").should("have.value", "Option B");
    cy.findByRole("listbox").should("not.exist");
  });

  it("preserves dropdown focus and selection when a visible control moves into shared overflow", () => {
    cy.mount(<MixedControlsWidthChangeTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).should("not.exist");

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option B" }).realClick();
    cy.findByRole("combobox").should("have.text", "Option B");

    setFixtureWidth(180);
    openOverflowWithKeyboard(/Overflow\./i);

    cy.findByRole("toolbar", { name: "More overflow" }).within(() => {
      cy.findByRole("combobox")
        .should("have.text", "Option B")
        .and("be.focused");
    });
  });

  it("keeps a portaled dropdown selection inside the named overflow panel", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Filters overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option B" }).realClick();

    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("have.text", "Option B");
    cy.findByRole("listbox").should("not.exist");
  });

  it("keeps keyboard-opened shared overflow open during mouse selection in a child popup", () => {
    cy.mount(<SharedOverflowDropdownPopupTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).focus();
    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");

    cy.findByRole("combobox").realClick();
    cy.findByRole("option", { name: "Option B" }).realClick();

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").should("have.text", "Option B");
    cy.findByRole("listbox").should("not.exist");
  });

  it("closes shared overflow and child popup on outside click", () => {
    cy.mount(<SharedOverflowDropdownPopupTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("be.visible");

    cy.findByTestId("toolbar-after").realClick();

    cy.findByRole("toolbar", { name: "More overflow" }).should("not.exist");
    cy.findByRole("listbox").should("not.exist");
  });

  it("keeps reopened child popups above the shared overflow panel", () => {
    cy.mount(<SharedOverflowDropdownPopupTestCase />);

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox").should("be.visible");

    cy.findByTestId("toolbar-after").realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("not.exist");

    cy.findByRole("button", { name: /Overflow\./i }).realClick();
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").realClick();
    cy.findByRole("listbox")
      .should("be.visible")
      .and("have.css", "z-index", "1501");
    cy.findByRole("option", { name: "Option B" }).realClick();

    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");
    cy.findByRole("combobox").should("have.text", "Option B");
  });

  it("restores named overflow controls to toolbar arrow navigation after expansion", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Filters overflow\./i })
      .focus()
      .should("be.focused");

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");

    cy.realPress("Escape");
    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.focused",
    );

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByRole("combobox").focus().should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("combobox").should("be.focused");
  });

  it("preserves focused overflow panel control when its tray returns to the toolbar", () => {
    cy.mount(<NamedOverflowFocusReentryTestCase />);

    cy.findByRole("button", { name: /Filters overflow\./i }).should(
      "be.visible",
    );
    cy.findByRole("button", { name: /Filters overflow\./i })
      .focus()
      .should("be.focused");

    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("be.visible");
    cy.findByRole("combobox").should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "Filters overflow" }).should("not.exist");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Filters" }).should("be.focused");
  });

  it("clears input focus styling when named overflow returns to the toolbar", () => {
    cy.mount(<NamedOverflowInputFocusReentryTestCase />);

    cy.findByRole("button", { name: /Actions overflow\./i })
      .focus()
      .should("be.focused");
    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");

    cy.findByRole("button", { name: "Export" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Settings" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByPlaceholderText("Search").should("be.focused");

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("not.exist");
    cy.findByPlaceholderText("Search")
      .should("not.be.focused")
      .closest(".saltInput")
      .should("not.have.class", "saltInput-focused");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByPlaceholderText("Search").should("be.focused");
  });

  it("clears date input focus styling when shared overflow returns to the toolbar", () => {
    cy.setDateAdapter(adapterDayjs);
    cy.mount(<SharedOverflowDateInputFocusReentryTestCase />);

    cy.findByRole("button", { name: /Overflow\./i })
      .focus()
      .should("be.focused");
    cy.realPress("Space");
    cy.findByRole("toolbar", { name: "More overflow" }).should("be.visible");

    cy.findByRole("combobox", { name: "Criteria option" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("textbox", { name: "Settlement date" }).should("be.focused");

    setFixtureWidth(760);
    cy.findByRole("toolbar", { name: "More overflow" }).should("not.exist");
    cy.findByRole("textbox", { name: "Settlement date" })
      .should("not.be.focused")
      .closest(".saltDateInput")
      .should("not.have.class", "saltDateInput-focused");

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("textbox", { name: "Settlement date" }).should("be.focused");
  });

  it("keeps the portaled overflow panel inside the viewport", () => {
    cy.viewport(430, 500);
    cy.mount(<KeyboardOverflowFixture width={260} />);

    cy.findByRole("button", { name: /Actions overflow\./i }).click();
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");

    cy.get("html").should(($html) => {
      const { clientWidth, scrollWidth } = $html[0];
      expect(scrollWidth).to.equal(clientWidth);
    });
  });

  it("preserves focus inside an open overflow panel across parent re-renders", () => {
    cy.mount(<KeyboardOverflowRerenderFixture width={260} />);

    openOverflowWithKeyboard(/Actions overflow\./i);
    cy.findByRole("toolbar", { name: "Actions overflow" }).should("be.visible");
    cy.findByRole("button", { name: "Export" }).should("be.focused");

    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Re-render 0" }).should("be.focused");

    cy.findByRole("button", { name: "Re-render 0" }).click();
    cy.findByRole("button", { name: "Re-render 1" }).should("be.focused");
    cy.findByRole("button", { name: "Export" }).should("not.be.focused");
  });

  it("uses visual ordering for horizontal navigation in RTL", () => {
    cy.mount(<KeyboardRtlFixture />);

    cy.findByTestId("toolbar-before").focus();
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Columns" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Status" }).should("be.focused");
    cy.realPress("ArrowLeft");
    cy.findByRole("button", { name: "Run" }).should("be.focused");
    cy.realPress("ArrowRight");
    cy.findByRole("button", { name: "Status" }).should("be.focused");
  });
});
