/**
 * The development status of a Salt UI component.
 */
export const enum ComponentStatus {
  /**
   * The component has been released in the core package and
   * consumers can use it in production applications.
   */
  READY = "Ready",

  /**
   * Work on the component has begun (and therefore it MAY be
   * available in the labs package), but it is not yet complete
   * and therefore consumers are discouraged from using it in
   * production applications.
   */
  IN_PROGRESS = "In progress",

  /**
   * There is an intent to build this component, but work on it
   * has not yet started.
   */
  IN_BACKLOG = "In the backlog",

  /**
   * Can be used for situations where there is no Figma or React
   * version of a components.
   */
  NOT_APPLICABLE = "N/A",
}

/**
 * Descriptive metadata about a Salt UI component.
 */
export interface ComponentDetails {
  /**
   * The components name.
   *
   * This should be the title case, space-separated name of the
   * component. E.g. "Form Field", "Salt Provider"
   */
  name: string;

  /**
   * A brief description that can be used for cars and other places
   * that link to the component's page.
   *
   * May be a JSX element, if formatting is needed. In this case, the
   * outermost element(s) should be block-level ones like <p>, <ul>, etc.
   *
   * Only plain HTML elements should be used. Props like `style`, `className`
   * or anything that forces a particular style presentation must be omitted.
   *
   * The idea is that any UI component that renders a description could safely
   * insert this into something like a `<div>` and apply whatever formatting is
   * appropriate for its context.
   */
  description?: string | JSX.Element;

  /**
   * The status of the component's React implementation for developers.
   *
   * A `READY` status implies that a production-quality version of the
   * component has been released in the core NPM package. The
   * `availableInCoreSince` property should therefore also be set.
   */
  devStatus: ComponentStatus;

  /**
   * The status of the component's Figma implementation for designers.
   *
   * A `READY` status implies that a production-quality version of the
   * component has been released in the Figma library. The
   * `availableInFigmaSince` property should therefore also be set.
   */
  designStatus: ComponentStatus;

  /**
   * The version of Salt's core npm package in which this component was
   * first released.
   *
   * Should be the semantic version number without the 'v' prefix
   * (just as it appears in a `package.json`). E.g. "2.14.9".
   *
   * Only needed for components in the READY status.
   */
  availableInCoreSince?: string;

  /**
   * The version of Salt's Figma library in which this component was
   * first released.
   *
   * Should be the semantic version number without the 'v' prefix
   * (just as it appears in a `package.json`). E.g. "2.14.9".
   *
   * Only needed for components in the READY status.
   */
  availableInFigmaSince?: string;

  /**
   * A representative illustration or screenshot of the component
   * that can be used on cards and other places that link to the
   * component's page.
   *
   * Only needed for components in the READY status.
   */
  previewImage?: string;

  /**
   * The URL to this component's page on the Salt Storybook site.
   *
   * Only needed for components in the READY status.
   */
  storybookUrl?: string;
}

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
    description:
      "Displays a series of panes containing summary content, which can then be expanded or collapsed to allow the user to show or hide content.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Announcement Dialog",
    description:
      "Displays eye-catching and informative announcements that have an image or embedded video—without the need for a visual design resource—in two predefined layouts.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "App Header",
    description:
      "Provides main navigation and utility actions. It’s fully responsive and manages all layout changes internally, adjusting to different viewports or window sizes",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Avatar",
    availableInCoreSince: "1.3.0",
    description:
      "Represents a person. It has three variants to account for different types of data: photo, initials and a default version when neither is available.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-avatar--page",
  },
  {
    name: "AG Grid Theme",
    // TODO: add description
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-data-grid-ag-grid-theme--page",
  },
  {
    name: "Badge",
    description:
      "Indicates the number of outstanding items that need to be addressed. It appears on the top right of an element, that’s usually an icon.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Banner",
    description:
      "Notifies the user of an error, a warning, a successfully-completed task or an information update. It spans the page or container width to give quick, non-disruptive feedback.",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Border Layout",
    description:
      "Defines the main content regions of an application, region or widget, such as a footer, header or side navigation.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-border-layout--page",
  },
  {
    name: "Breadcrumbs",
    description:
      "Provides a space-efficient means of allowing quick navigation to previous levels, helping the user keep track of their current location within a hierarchy.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Button",
    description:
      "Executes an action when the user interacts with it. There are three variants: Call-to-Action (CTA), primary and secondary buttons.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-button--page",
  },
  {
    name: "Button Bar",
    description:
      "Displays  two or more possible actions for a user to take, that are related to a task.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Calendar",
    description:
      "Allows the user to specify a single day or range of dates by typing directly into an input field or selecting one from a calendar.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Card",
    description:
      "Conveniently displays content that’s composed of different elements that have varied sizes or supported actions.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.1.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-card--page",
  },
  {
    name: "Carousel",
    description:
      "Presents small groups of content as slides that are viewed in a continuous loop, within the same space.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Cascading Menu",
    description:
      "Allows 10 or more items to be organized into categories and shown in different levels.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Checkbox",
    description:
      "Enables the user to turn a specific value on or off. The value can be independent or a selection of one or more values from a given set of choices.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.5.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-checkbox--page",
  },
  {
    name: "Color Chooser",
    // TODO: add description
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Combo Box",
    description:
      "Helps users select an item from a large list of options without scrolling. Typeahead functionality makes selection quicker and easier, while reducing errors.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    // TODO: Not really a component. Should this be moved elsewhere?
    name: "Common Hooks",
    // TODO: add description
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Contact Details",
    description:
      "Represents contacts and their known channels of communication, within an application.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Content Status",
    description:
      "Displays information when content isn’t ready to be shown in a container component, and remains visible until the situation is resolved.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Country Symbol",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-country-symbols-country-symbol--page",
  },
  {
    name: "Data Grid",
    // TODO: add description
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-data-grid-data-grid--page",
  },
  {
    name: "Deck Layout",
    description:
      "Defines pages of content that appear within the same specified region, one at a time.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.NOT_APPLICABLE,
  },
  {
    name: "Dialog",
    description:
      "Focuses the user’s attention on a particular task or piece of information by displaying a message in a window that opens over the application content.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Dropdown",
    description:
      "Allows the user to select an item from an array of options that’s displayed in a list overlay—with the selected value displayed in the dropdown field.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Experience Customization Wizard",
    description:
      "Enables the user to select preferences that personalize their experience within your application.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "File Drop Zone",
    description:
      "Provides a target area for the user to drag and drop files, such as documents or images—and automatically uploads them to the web application.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Filterable List",
    description:
      "Allows items from an always-visible list to be filtered so the user can quickly locate and select items within a lengthy list.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Flex Layout",
    description:
      "Dictates a vertical or horizontal order and direction for UI elements. Does not wrap by default.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-flex-layout--page",
  },
  {
    name: "Flow Layout",
    description:
      "Dictates a horizontal order and direction for UI elements. Wraps by default.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-flow-layout--page",
  },
  {
    name: "Form Field",
    description: "",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Formatted Input",
    description:
      "Provides an editable field that’s configured to accept values in a specific format.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Grid Layout",
    description:
      "Defines an equally distributed layout system using columns and rows.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-grid-layout--page",
  },
  {
    name: "Icon",
    description:
      "Graphically represents an idea, concept or action. Icons visually reinforce or provide information for a specific task or context.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-icons-icon--page",
  },
  {
    name: "Input",
    description:
      "Allows the user to enter arbitrary text and numeric values into an editable field, with no specific format defined.",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Layer Layout",
    description:
      "Defines a layer above the existing layout structure for UI elements to be displayed in.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.NOT_APPLICABLE,
  },
  {
    name: "Link",
    description:
      "Navigates the user to a new page, and displays link text with a meaningful description.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-link--page",
  },
  {
    name: "List",
    description:
      "Allows the user to select one or more items from an array of options. Long Lists are shown in a scrolling pane to provide access to all options in a space-efficient way.",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Logo",
    description:
      "Makes it easy to include a brand-compliant logo for a J.P. Morgan or Chase in your application.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Menu Button",
    description:
      "Reveals a list of actions a user can take, with options displayed across a single level or multiple hierarchical levels.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Metric",
    description:
      "Displays an important number value prominently. Indicators, icons or labels can be added to help provide context to the presented value.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Overlay",
    description:
      "Mimics the behavior of a tooltip, while containing rich formatting.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Pagination",
    description:
      "Helps the user navigate easily between large groups of content that’s separated into pages.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Panel",
    description:
      'Organizes content areas in an application by providing expand/collapse behavior, its own scroll bar, and "floating" and "docked" states.',
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.1.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-panel--page",
  },
  {
    name: "Parent Child Layout",
    description:
      "Displays a hierarchical structure comprising of a main content area and an accompanying parent region, used to drive the content that is displayed.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.NOT_APPLICABLE,
  },
  {
    name: "Pill",
    description:
      "Provides multiple ways to label, tag or categorize content to allow users to trigger actions, make selections or filter results.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Progress",
    description:
      "Indicates how long a system operation will take. Two variants are available for different layouts—Linear and Circular—with each in small, medium, and large.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Query Input",
    description: (
      <>
        <p>
          Allows multiple options to be selected from a dataset (organised into
          categories) and displayed within the field as pills.
        </p>
        <p>
          It allows user-defined keywords to be defined as criteria and the
          scope of the query is controlled by an AND/OR boolean selector.
        </p>
      </>
    ),
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Radio Button",
    description:
      "Allows the user to select one option at a time, from a set that’s vertically or horizontally aligned.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.5.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-radio-button--page",
  },
  {
    name: "Salt Provider",
    description: (
      <p>
        Allows you to inject <code>Theme</code> and <code>Density</code> into
        the root level of your application. Salt Provider is a multipurpose
        React Context provider.
      </p>
    ),
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-salt-provider--page",
  },
  {
    name: "Scrim",
    description:
      "Allows the user to enter a specific search term into an input field.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Search Input",
    description:
      "Makes underlying content less prominent by providing  a temporary, semi-transparent layer over application content.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Selectable Card",
    description:
      "Presents options that have a supporting image, title and description—for the user to make a selection from.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Skip Link",
    description:
      "Helps keyboard users to navigate a page more quickly by skipping past repeated or generic content to move focus to a target element.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Slider",
    description:
      "Enables the selection of a single value within a range of values that’s displayed horizontally or vertically, with the selected value shown in a tooltip.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Spinner",
    availableInCoreSince: "1.2.0",
    description:
      "Visually represents a process that is taking an indeterminate time to complete.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-spinner--page",
  },
  {
    name: "Split Button",
    description:
      "Gives the user the ability to perform a main action while having access to relevant, supplementary actions if needed.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Split Layout",
    availableInCoreSince: "1.2.0",
    description:
      "Defines left and right regions for UI elements within a span, such as a button bar.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-split-layout--page",
  },
  {
    name: "Stack Layout",
    description: "Dictates a vertical order and direction for UI elements.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.NOT_APPLICABLE,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-layout-stack-layout--page",
  },
  {
    name: "Status Indicator",
    description:
      "Helps to convey a message when used on its own or within another component. There are four severity levels, each with a distinctive indicator and color.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-status-indicator--page",
  },
  {
    name: "Stepped Tracker",
    description:
      "Visually communicates a user’s progress through a linear process, giving the user context about where they are in the process and indicating the remaining steps.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Stepper Input",
    description:
      "Displays a default numeric value that users can change by manually entering a value, or by increasing or decreasing the default value using the controls.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Switch",
    description:
      "Allows the user to turn a specific value on or off from two choices—with the action having an immediate impact.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Tabs",
    description:
      "Allows the user to switch between different panes of content.",
    devStatus: ComponentStatus.IN_PROGRESS,
    designStatus: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Tile",
    description:
      "Creates a repeated pattern of bite-size content that’s arranged horizontally or vertically.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Text",
    description:
      "Includes attributes such as font weight, letter spacing, size, line height, paragraph spacing, case, text decoration and emphasis levels.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-text--page",
  },
  {
    name: "Theme",
    // TODO: add description
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    availableInCoreSince: "1.0.0",
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/theme-about-the-salt-theme--page",
  },
  {
    name: "Toast",
    description:
      "Displays a small pop-up notification that’s usually short-lived and shown in response to a user action or system event that’s unrelated to the user’s current focus.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Toggle Button",
    description:
      "Allows the user to switch between two possible states, or a related, grouped set of options.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Tokenized Input",
    description:
      "Provides an input field for text that’s converted into a pill within the field when the user enters a delimiting character.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Toolbar",
    description:
      "Gives users access to multiple action buttons that are relevant to what they’re focused on, to increase task efficiency.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Tooltip",
    availableInCoreSince: "1.2.0",
    description:
      "Displays an explanation or provides more information about an error or warning condition, when the user’s  mouse hovers over a target element.",
    devStatus: ComponentStatus.READY,
    designStatus: ComponentStatus.READY,
    storybookUrl:
      "https://storybook.saltdesignsystem.com/?path=/docs/documentation-core-tooltip--page",
  },
  {
    name: "Tree",
    description:
      "Provides a visual representation of items, referred to as nodes, in a hierarchical parent-child relationship.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Vertical Navigation",
    description:
      "Provides access to other destinations or functionality within an application, as a secondary navigation pattern, in the form of a left-aligned hierarchical list.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Window",
    description:
      'Allow developers using desktop platforms to inject their own "window" or abstraction layer for use in components that are rendered to their own layer.',
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Wizard",
    description:
      "Allows a workflow-based task to be displayed in a sequence of manageable steps, for easier completion.",
    devStatus: ComponentStatus.IN_BACKLOG,
    designStatus: ComponentStatus.IN_BACKLOG,
  },
].filter((component) => component.devStatus !== ComponentStatus.IN_BACKLOG);
