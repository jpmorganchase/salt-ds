import {
  Button,
  Divider,
  Dropdown,
  Input,
  Option,
  Text,
  Toolbar,
  ToolbarContent,
  Tooltray,
} from "@salt-ds/core";
import { DateInputSingle } from "@salt-ds/date-components";
import {
  AddIcon,
  CalendarIcon,
  ExportIcon,
  FilterIcon,
  SearchIcon,
  SettingsIcon,
} from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Fragment, useState } from "react";

export default {
  title: "Core/Toolbar/Edge Cases",
  component: Toolbar,
  includeStories: [
    "DynamicElements",
    "HiddenOverflowRemeasurement",
    "OverflowMenuInClippingContainer",
    "SubpixelWidthRounding",
    "SubpixelWidthRoundingWithGapsAndDividers",
  ],
  parameters: {
    layout: "padded",
  },
  subcomponents: {
    ToolbarContent,
    Tooltray,
  },
} as Meta<typeof Toolbar>;

const options = ["Option A", "Option B", "Option C"];

const hiddenOverflowDemoShellStyle = {
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "var(--salt-spacing-150)",
  maxWidth: 560,
};

const hiddenOverflowDemoControlsStyle = {
  display: "flex" as const,
  gap: "var(--salt-spacing-100)",
  flexWrap: "wrap" as const,
};

const hiddenOverflowDemoFrameStyle = {
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  padding: "var(--salt-spacing-100)",
};

const deskOptions = ["All desks", "Rates", "Credit", "Equities"];
const exceptionRows = [
  ["FX-4120", "Morgan Stanley", "Missing allocation"],
  ["EQ-8091", "BlackRock", "Limit override"],
  ["CR-1174", "Goldman Sachs", "Price tolerance"],
];

const clippingValidationShellStyle = {
  maxWidth: 680,
};

const clippingValidationCardStyle = {
  background: "var(--salt-container-primary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  borderRadius: "var(--salt-palette-corner, 0)",
  boxShadow: "var(--salt-overlayable-shadow-popout)",
  display: "flex" as const,
  flexDirection: "column" as const,
  height: 260,
  overflow: "hidden" as const,
};

const clippingValidationHeaderStyle = {
  borderBottom:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  padding: "var(--salt-spacing-200)",
};

const clippingValidationBodyStyle = {
  display: "flex" as const,
  flex: 1,
  flexDirection: "column" as const,
  gap: "var(--salt-spacing-100)",
  minHeight: 0,
  overflow: "hidden" as const,
  padding: "var(--salt-spacing-200)",
};

const clippingValidationRowStyle = {
  alignItems: "center",
  background: "var(--salt-container-secondary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  display: "grid" as const,
  gap: "var(--salt-spacing-100)",
  gridTemplateColumns: "80px minmax(0, 1fr) minmax(0, 1.4fr)",
  padding: "var(--salt-spacing-100) var(--salt-spacing-150)",
};

const clippingValidationToolbarDockStyle = {
  background: "var(--salt-container-secondary-background)",
  borderTop:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  padding: "var(--salt-spacing-100)",
};

const clippingValidationNoteStyle = {
  marginTop: "var(--salt-spacing-200)",
};

const subpixelItemWidth = 20.2;
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
const subpixelToolbarWidth = subpixelItemWidth * subpixelItemLabels.length;
const subpixelSliderFitWidth = Math.floor(subpixelToolbarWidth);
const subpixelSliderOverflowWidth = subpixelSliderFitWidth - 1;

const subpixelRoundingShellStyle = {
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "var(--salt-spacing-150)",
  maxWidth: 560,
};

const subpixelRoundingFrameStyle = {
  outline:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  width: "100%",
};

const subpixelRoundingContentStyle = {
  gap: 0,
};

const subpixelRoundingItemStyle = {
  alignItems: "center",
  background: "var(--salt-container-secondary-background)",
  border:
    "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-container-primary-borderColor)",
  boxSizing: "border-box" as const,
  display: "flex" as const,
  fontSize: 10,
  height: "var(--salt-size-base)",
  justifyContent: "center",
  width: subpixelItemWidth,
};

const subpixelDecoratedItemWidth = 32.2;
const subpixelDecoratedItemLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

const subpixelDecoratedItemStyle = {
  ...subpixelRoundingItemStyle,
  width: subpixelDecoratedItemWidth,
};

const subpixelDividerStyle = {
  height: "var(--salt-size-base)",
};

/**
 * Dynamic toolbar content added after mount.
 *
 * Intended behavior:
 * - The add dropdown and add date buttons append keyed controls to the start
 *   content when pressed.
 * - The toolbar recalculates its child model and overflow measurements after
 *   each render, so newly added controls should appear immediately and
 *   participate in the named Filters overflow group when width is constrained.
 * - The buttons that mutate the toolbar live in an `overflowMode="none"` tray,
 *   so they stay visible and never move into the overflow menu.
 */
export const DynamicElements: StoryFn<typeof Toolbar> = () => {
  const [controls, setControls] = useState<
    Array<{ id: number; type: "date" | "dropdown" }>
  >([{ id: 1, type: "dropdown" }]);

  return (
    <Toolbar aria-label="Dynamic toolbar">
      <ToolbarContent position="start">
        <Tooltray overflowMode="none">
          <Input
            bordered
            startAdornment={<SearchIcon aria-hidden />}
            placeholder="Search"
            style={{ width: 180 }}
          />
        </Tooltray>
        {controls.map((control) => (
          <Tooltray
            key={control.id}
            overflowGroup="Filters"
            overflowLabel="Filters"
            overflowMode="independent"
            overflowPriority={control.id}
          >
            {control.type === "dropdown" ? (
              <Dropdown
                aria-label={`Filter ${control.id}`}
                bordered
                defaultSelected={[options[(control.id - 1) % options.length]]}
                style={{ width: 160 }}
              >
                {options.map((option) => (
                  <Option value={option} key={option} />
                ))}
              </Dropdown>
            ) : (
              <DateInputSingle
                aria-label={`Date filter ${control.id}`}
                bordered
                style={{ width: 180 }}
              />
            )}
          </Tooltray>
        ))}
      </ToolbarContent>
      <ToolbarContent position="end">
        <Tooltray overflowMode="none">
          <Button
            appearance="transparent"
            aria-label="Add filter dropdown"
            onClick={() => {
              setControls((previousControls) => [
                ...previousControls,
                { id: previousControls.length + 1, type: "dropdown" },
              ]);
            }}
          >
            <AddIcon aria-hidden />
            Add dropdown
          </Button>
          <Button
            appearance="transparent"
            aria-label="Add date input"
            onClick={() => {
              setControls((previousControls) => [
                ...previousControls,
                { id: previousControls.length + 1, type: "date" },
              ]);
            }}
          >
            <CalendarIcon aria-hidden />
            Add date
          </Button>
        </Tooltray>
      </ToolbarContent>
    </Toolbar>
  );
};
DynamicElements.globals = {
  responsive: "wrap",
};

/**
 * Subpixel width rounding validation.
 *
 * Intended behavior:
 * - Twelve items at `20.2px` each exactly fit in a `242.4px` toolbar.
 * - The toolbar content gap is set to zero so this isolates the item-width
 *   arithmetic.
 * - The Storybook width slider uses whole pixels. Set it to `242px` to validate
 *   the epsilon tolerance for the fractional rendered width, then set it to
 *   `241px` to verify narrower widths still intentionally collapse items.
 */
export const SubpixelWidthRounding: StoryFn<typeof Toolbar> = () => (
  <div style={subpixelRoundingShellStyle}>
    <Text>
      <strong>Expected:</strong> all {subpixelItemLabels.length} labelled items
      fit when the integer Storybook width slider is set to{" "}
      {subpixelSliderFitWidth}px. Each item is {subpixelItemWidth}px wide, so
      the rendered total is fractional.
    </Text>
    <Text>
      <strong>Bug indicator:</strong> if {subpixelSliderFitWidth}px shows only
      the overflow trigger, fractional widths are still being rounded into a
      false overflow. At {subpixelSliderOverflowWidth}px, items should overflow.
    </Text>
    <div style={subpixelRoundingFrameStyle}>
      <Toolbar
        appearance="transparent"
        aria-label="Subpixel width rounding toolbar"
      >
        <ToolbarContent position="start" style={subpixelRoundingContentStyle}>
          {subpixelItemLabels.map((label, index) => (
            <Tooltray key={label} overflowPriority={index}>
              <span style={subpixelRoundingItemStyle}>{label}</span>
            </Tooltray>
          ))}
        </ToolbarContent>
      </Toolbar>
    </div>
  </div>
);
SubpixelWidthRounding.globals = {
  responsive: "wrap",
};

/**
 * Subpixel width rounding with normal gaps and dividers.
 *
 * Intended behavior:
 * - Items still use fractional widths, but this variant keeps the toolbar's
 *   normal content gaps instead of forcing `gap: 0`.
 * - Vertical dividers are included as toolbar decorations, so the measurement
 *   log should show decorated item widths and non-zero `contentGaps`.
 * - Use the Storybook width slider around the logged `initialWidth` value:
 *   exact-or-wider widths should fit, while narrower widths should overflow.
 */
export const SubpixelWidthRoundingWithGapsAndDividers: StoryFn<
  typeof Toolbar
> = () => (
  <div style={subpixelRoundingShellStyle}>
    <Text>
      <strong>Expected:</strong> this version keeps the default toolbar spacing
      and includes vertical dividers. The debug log should show a non-zero
      content gap and item widths that include adjacent divider decorations.
    </Text>
    <Text>
      <strong>Bug indicator:</strong> if the slider width is at or above the
      logged initial width but items still overflow, the measurement is not
      accounting for gaps or divider decorations correctly.
    </Text>
    <div style={subpixelRoundingFrameStyle}>
      <Toolbar
        appearance="transparent"
        aria-label="Subpixel gaps and dividers toolbar"
      >
        <ToolbarContent position="start">
          {subpixelDecoratedItemLabels.map((label, index) => (
            <Fragment key={label}>
              {index === 3 || index === 6 ? (
                <Divider
                  orientation="vertical"
                  style={subpixelDividerStyle}
                  variant="secondary"
                />
              ) : null}
              <Tooltray overflowPriority={index}>
                <span style={subpixelDecoratedItemStyle}>{label}</span>
              </Tooltray>
            </Fragment>
          ))}
        </ToolbarContent>
      </Toolbar>
    </div>
  </div>
);
SubpixelWidthRoundingWithGapsAndDividers.globals = {
  responsive: "wrap",
};

/**
 * Hidden overflow remeasurement after content changes.
 *
 * Intended behavior:
 * - The middle tray is initially overflowed into the shared overflow menu while
 *   the panel is closed.
 * - Change the hidden tray from a short action to a long action, then expand
 *   the toolbar to a width where the stale short measurement would fit but the
 *   long action should still remain overflowed.
 * - The shared overflow trigger should remain visible after expansion. If the
 *   long action appears in the toolbar, hidden overflow measurements are stale.
 */
export const HiddenOverflowRemeasurement: StoryFn<typeof Toolbar> = () => {
  const [expandedWidth, setExpandedWidth] = useState(false);
  const [wideAction, setWideAction] = useState(false);
  const toolbarWidth = expandedWidth ? 420 : 300;

  return (
    <div style={hiddenOverflowDemoShellStyle}>
      <Text>
        Change the hidden overflow action while the overflow panel is closed,
        then expand the toolbar. The overflow trigger should stay visible when
        the hidden action has the long label.
      </Text>
      <div style={hiddenOverflowDemoControlsStyle}>
        <Button
          appearance={wideAction ? "solid" : "bordered"}
          onClick={() => setWideAction((current) => !current)}
        >
          {wideAction ? "Use short hidden label" : "Use long hidden label"}
        </Button>
        <Button
          appearance={expandedWidth ? "solid" : "bordered"}
          onClick={() => setExpandedWidth((current) => !current)}
        >
          {expandedWidth ? "Narrow toolbar" : "Expand toolbar"}
        </Button>
      </div>
      <div
        style={{
          ...hiddenOverflowDemoFrameStyle,
          width: toolbarWidth,
        }}
      >
        <Toolbar aria-label="Hidden overflow measurement toolbar">
          <Tooltray overflowMode="none">
            <Button appearance="transparent" style={{ width: 120 }}>
              Pinned
            </Button>
          </Tooltray>
          <Tooltray overflowMode="independent" overflowPriority={5}>
            <Button
              appearance="transparent"
              style={{ width: wideAction ? 320 : 80 }}
            >
              {wideAction ? "Hidden action with a long label" : "Short"}
            </Button>
          </Tooltray>
          <Tooltray align="end" overflowMode="none">
            <Button appearance="solid" style={{ width: 100 }}>
              Run
            </Button>
          </Tooltray>
        </Toolbar>
      </div>
    </div>
  );
};
HiddenOverflowRemeasurement.globals = {
  responsive: "wrap",
};

/**
 * Overflow panel clipping validation in a realistic bounded container.
 *
 * Intended behavior:
 * - The toolbar is docked at the bottom of a compact review-queue card whose
 *   container uses `overflow: hidden`, like many dashboard cards and modals.
 * - The available width intentionally collapses the end-content actions into a
 *   named `Actions` overflow trigger.
 * - Open the Actions trigger. The overflow panel should float outside the card
 *   and remain fully visible over the note below instead of being clipped by
 *   the card boundary.
 * - This validates that the overflow surface is portalled and positioned by
 *   Floating UI rather than being rendered inside the clipped toolbar context.
 */
export const OverflowMenuInClippingContainer: StoryFn<typeof Toolbar> = () => (
  <div style={clippingValidationShellStyle}>
    <div style={clippingValidationCardStyle}>
      <div style={clippingValidationHeaderStyle}>
        <Text>
          <strong>Trade exception review</strong>
        </Text>
        <Text>Resolve exceptions before the desk closes the batch.</Text>
      </div>
      <div style={clippingValidationBodyStyle}>
        {exceptionRows.map(([id, client, exception]) => (
          <div style={clippingValidationRowStyle} key={id}>
            <Text>{id}</Text>
            <Text>{client}</Text>
            <Text>{exception}</Text>
          </div>
        ))}
      </div>
      <div style={clippingValidationToolbarDockStyle}>
        <Toolbar
          appearance="transparent"
          aria-label="Trade exception review toolbar"
        >
          <ToolbarContent position="start">
            <Tooltray overflowMode="none">
              <Input
                bordered
                placeholder="Search exceptions"
                startAdornment={<SearchIcon aria-hidden />}
                style={{ width: 180 }}
              />
            </Tooltray>
            <Tooltray
              overflowGroup="Filters"
              overflowLabel="Filters"
              overflowMode="independent"
              overflowPriority={3}
            >
              <Dropdown
                aria-label="Desk filter"
                bordered
                defaultSelected={["All desks"]}
                style={{ width: 160 }}
              >
                {deskOptions.map((option) => (
                  <Option value={option} key={option} />
                ))}
              </Dropdown>
            </Tooltray>
            <Tooltray
              overflowGroup="Filters"
              overflowLabel="Filters"
              overflowMode="independent"
              overflowPriority={4}
            >
              <Button appearance="transparent">
                <FilterIcon aria-hidden />
                Status
              </Button>
            </Tooltray>
          </ToolbarContent>
          <ToolbarContent position="end">
            <Tooltray
              overflowGroup="Actions"
              overflowLabel="Actions"
              overflowMode="grouped"
              overflowPriority={6}
            >
              <Button appearance="transparent">
                <ExportIcon aria-hidden />
                Export
              </Button>
              <Button appearance="transparent">Reassign</Button>
              <Button appearance="solid">Approve</Button>
            </Tooltray>
            <Tooltray overflowMode="none">
              <Button appearance="transparent" aria-label="Toolbar settings">
                <SettingsIcon aria-hidden />
              </Button>
            </Tooltray>
          </ToolbarContent>
        </Toolbar>
      </div>
    </div>
    <Text style={clippingValidationNoteStyle}>
      Open the Actions menu from the toolbar footer. The panel should render
      over this note instead of disappearing behind the clipped card edge.
    </Text>
  </div>
);
OverflowMenuInClippingContainer.globals = {
  responsive: "wrap",
};
