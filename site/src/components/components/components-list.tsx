/**
 * The development status of a Salt UI component.
 */
export const enum ComponentStatus {
  STABLE = "Stable",
  RC = "Release candidate",
  IN_PROGRESS = "In progress",
  EXPERIMENTAL = "Experimental",
  NOT_APPLICABLE = "N/A",
}

interface CommonComponentDetails {
  name: string;
  designStatus: ComponentStatus;
}

interface ReadyComponentDetails {
  availableInCoreSince: string;
  devStatus: ComponentStatus.STABLE;
  storybookUrl: string;
}

interface RCComponentDetails {
  availableInLabsSince: string;
  devStatus: ComponentStatus.RC;
  storybookUrl: string;
}

interface ExperimentalComponentDetails {
  devStatus: ComponentStatus.EXPERIMENTAL;
  availableInLabsSince: string;
  storybookUrl?: string;
}

interface UnreadyComponentDetails {
  devStatus: ComponentStatus.IN_PROGRESS;
}

/**
 * Descriptive metadata about a Salt UI component.
 */
export type ComponentDetails = CommonComponentDetails &
  (
    | ReadyComponentDetails
    | RCComponentDetails
    | UnreadyComponentDetails
    | ExperimentalComponentDetails
  );

/**
 * Details for all the Salt components, sorted alphabetically by name.
 *
 * TODO: Manually maintained for now, but this should be automated as soon
 * as possible.
 *
 * When editing, please keep ensure you retain the alphatical ordering.
 * This makes things easier to find here in the code (and thus avoids
 * accidental duplicates).
 */
export const componentDetails: ComponentDetails[] = [
  {
    name: "Accordion",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.IN_PROGRESS,
    availableInCoreSince: "1.8.0-rc.4",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-accordion--page",
  },
  {
    name: "Avatar",
    availableInCoreSince: "1.3.0",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-avatar--page",
  },
  {
    name: "AG Grid Theme",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-data-grid-ag-grid-theme--page",
  },
  {
    name: "Badge",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Banner",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-banner--page",
  },
  {
    name: "Border Layout",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-border-layout--page",
  },
  {
    name: "Button",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-button--page",
  },
  {
    name: "Card",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.1.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-card--page",
  },
  {
    name: "Checkbox",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.5.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-checkbox--page",
  },
  {
    name: "Combo Box",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Country Symbol",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-country-symbols-country-symbol--page",
  },
  {
    name: "Data Grid",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-data-grid-data-grid--page",
  },
  {
    name: "Dialog",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Drawer",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.IN_PROGRESS,
    availableInCoreSince: "1.8.0-rc.6",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-drawer--page",
  },
  {
    name: "Dropdown",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Flex Layout",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-flex-layout--page",
  },
  {
    name: "Flow Layout",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-flow-layout--page",
  },
  {
    name: "Form Field",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-form-field--page",
  },
  {
    name: "Grid Layout",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-grid-layout--page",
  },
  {
    name: "Icon",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-icons-icon--page",
  },
  {
    name: "Input",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-input--page",
  },
  {
    name: "Link",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-link--page",
  },
  {
    name: "List",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.STABLE,
  },
  {
    name: "Multiline Input",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.IN_PROGRESS,
    availableInCoreSince: "1.8.0-rc.6",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-multiline-input--page",
  },
  {
    name: "Nav Item",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Panel",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.1.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-panel--page",
  },
  {
    name: "Pill",
    devStatus: ComponentStatus.EXPERIMENTAL,
    designStatus: ComponentStatus.STABLE,
    availableInLabsSince: "1.0.0-alpha.14",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/story/documentation-lab-pill-next--page",
  },
  {
    name: "Progress",
    devStatus: ComponentStatus.EXPERIMENTAL,
    designStatus: ComponentStatus.STABLE,
    availableInLabsSince: "1.0.0-alpha.14",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-lab-progress-circular-progress--page",
  },
  {
    name: "Radio Button",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.5.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-radio-button--page",
  },
  {
    name: "Salt Provider",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-salt-provider--page",
  },
  {
    name: "Spinner",
    availableInCoreSince: "1.2.0",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-spinner--page",
  },
  {
    name: "Split Layout",
    availableInCoreSince: "1.2.0",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-split-layout--page",
  },
  {
    name: "Stack Layout",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-stack-layout--page",
  },
  {
    name: "Status Indicator",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-status-indicator--page",
  },
  {
    name: "Stepped Tracker",
    devStatus: ComponentStatus.EXPERIMENTAL,
    designStatus: ComponentStatus.IN_PROGRESS,
    availableInLabsSince: "1.0.0-alpha.14",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-lab-steppedtracker--page",
  },
  {
    name: "Switch",
    devStatus: ComponentStatus.RC,
    designStatus: ComponentStatus.IN_PROGRESS,
    availableInLabsSince: "1.0.0-alpha.15",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-lab-switch--page",
  },
  {
    name: "Tabs",
    devStatus: ComponentStatus.EXPERIMENTAL,
    designStatus: ComponentStatus.EXPERIMENTAL,
    availableInLabsSince: "1.0.0-alpha.11",
  },
  {
    name: "Text",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-text--page",
  },
  {
    name: "Theme",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/theme-about-the-salt-theme--page",
  },
  {
    name: "Toast",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.5",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-toast--page",
  },
  {
    name: "Toggle Button",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.4",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-toggle-button--page",
  },
  {
    name: "Toggle Button Group",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    availableInCoreSince: "1.8.0-rc.4",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-toggle-button-group--page",
  },
  {
    name: "Tooltip",
    availableInCoreSince: "1.2.0",
    devStatus: ComponentStatus.STABLE,
    designStatus: ComponentStatus.STABLE,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-tooltip--page",
  },
];
