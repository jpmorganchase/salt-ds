/**
 * The development status of a Salt UI component.
 */
export const enum ComponentStatus {
  /**
   * The component has been released in the core package and
   * consumers can use it in production applications.
   */
  READY,

  /**
   * Work on the component has begun (and therefore it MAY be
   * available in the labs package), but it is not yet complete
   * and therefore consumers are discouraged from using it in
   * production applications.
   */
  IN_PROGRESS,

  /**
   * There is an intent to build this component, but work on it
   * has not yet started.
   */
  IN_BACKLOG,
}

/**
 * Descirptive metadata about a Salt UI component.
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
   *  The component's development status.
   */
  status: ComponentStatus;

  /**
   * The version of Salt's core package in which this component was
   * first released.
   *
   * Should be the semantic version number without the 'v' prefix
   * (just as it appears in a `package.json`). E.g. "2.14.9".
   *
   * Only needed for components in the READY status.
   */
  availablInCoreSince?: string;

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
 * Details for all the Salt components.
 *
 * Manually maintained for now, but this should be automated as soon
 * as possible.
 */
export const componentDetails: ComponentDetails[] = [
  {
    name: "Accordion",
    description:
      "Displays a series of panes containing summary content, which can then be expanded or collapsed to allow the user to show or hide content.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Announcement Dialog",
    description:
      "Displays eye-catching and informative announcements that have an image or embedded video—without the need for a visual design resource—in two predefined layouts.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "App Header",
    description:
      "Provides main navigation and utility actions. It’s fully responsive and manages all layout changes internally, adjusting to different viewports or window sizes",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Avatar",
    description:
      "Represents a person. It has three variants to account for different types of data: photo, initials and a default version when neither is available.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "AG Grid Theme",
    // TODO: add description
    status: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Badge",
    description:
      "Indicates the number of outstanding items that need to be addressed. It appears on the top right of an element, that’s usually an icon.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Banner",
    description:
      "Notifies the user of an error, a warning, a successfully-completed task or an information update. It spans the page or container width to give quick, non-disruptive feedback.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Breadcrumbs",
    description:
      "Provides a space-efficient means of allowing quick navigation to previous levels, helping the user keep track of their current location within a hierarchy.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Button",
    description:
      "Executes an action when the user interacts with it. There are three variants: Call-to-Action (CTA), primary and secondary buttons.",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Button Bar",
    description:
      "Displays  two or more possible actions for a user to take, that are related to a task.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Calendar",
    description:
      "Allows the user to specify a single day or range of dates by typing directly into an input field or selecting one from a calendar.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Card",
    description:
      "Conveniently displays content that’s composed of different elements that have varied sizes or supported actions.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Carousel",
    description:
      "Presents small groups of content as slides that are viewed in a continuous loop, within the same space.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Cascading Menu",
    description:
      "Allows 10 or more items to be organized into categories and shown in different levels.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Checkbox",
    description:
      "Enables the user to turn a specific value on or off. The value can be independent or a selection of one or more values from a given set of choices.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Color Chooser",
    // TODO: add description
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Combo Box",
    description:
      "Helps users select an item from a large list of options without scrolling. Typeahead functionality makes selection quicker and easier, while reducing errors.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    // TODO: Not really a component. Should this be moved elsewhere?
    name: "Common Hooks",
    // TODO: add description
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Contact Details",
    description:
      "Represents contacts and their known channels of communication, within an application.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Content Status",
    description:
      "Displays information when content isn’t ready to be shown in a container component, and remains visible until the situation is resolved.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Data Grid",
    // TODO: add description
    status: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Dialog",
    description:
      "Focuses the user’s attention on a particular task or piece of information by displaying a message in a window that opens over the application content.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Dropdown",
    description:
      "Allows the user to select an item from an array of options that’s displayed in a list overlay—with the selected value displayed in the dropdown field.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Experience Customization Wizard",
    description:
      "Enables the user to select preferences that personalize their experience within your application.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "File Drop Zone",
    description:
      "Provides a target area for the user to drag and drop files, such as documents or images—and automatically uploads them to the web application.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Filterable List",
    description:
      "Allows items from an always-visible list to be filtered so the user can quickly locate and select items within a lengthy list.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Form Field",
    description: "",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Formatted Input",
    description:
      "Provides an editable field that’s configured to accept values in a specific format.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Icon",
    description:
      "Graphically represents an idea, concept or action. Icons visually reinforce or provide information for a specific task or context.",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl:
      "https://uitk.pages.dev/?path=/docs/documentation-icons-icon--page",
  },
  {
    name: "Input",
    description:
      "Allows the user to enter arbitrary text and numeric values into an editable field, with no specific format defined.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Layout",
    description:
      "Provides a series of versatile, flexible layouts that support the design of components and application UIs and can be used in multiple contexts.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Link",
    description:
      "Navigates the user to a new page, and displays link text with a meaningful description.",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "List",
    description:
      "Allows the user to select one or more items from an array of options. Long Lists are shown in a scrolling pane to provide access to all options in a space-efficient way.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Logo",
    description:
      "Makes it easy to include a brand-compliant logo for a J.P. Morgan or Chase in your application.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Menu Button",
    description:
      "Reveals a list of actions a user can take, with options displayed across a single level or multiple hierarchical levels.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Metric",
    description:
      "Displays an important number value prominently. Indicators, icons or labels can be added to help provide context to the presented value.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Overlay",
    description:
      "Mimics the behavior of a tooltip, while containing rich formatting.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Pagination",
    description:
      "Helps the user navigate easily between large groups of content that’s separated into pages.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Panel",
    description:
      'Organizes content areas in an application by providing expand/collapse behavior, its own scroll bar, and "floating" and "docked" states.',
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Pill",
    description:
      "Provides multiple ways to label, tag or categorize content to allow users to trigger actions, make selections or filter results.",
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Progress",
    description:
      "Indicates how long a system operation will take. Two variants are available for different layouts—Linear and Circular—with each in small, medium, and large.",
    status: ComponentStatus.IN_BACKLOG,
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
    status: ComponentStatus.IN_BACKLOG,
  },
  {
    name: "Radio Button",
    description:
      "Allows the user to select one option at a time, from a set that’s vertically or horizontally aligned.",
    status: ComponentStatus.IN_PROGRESS,
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
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Scrim",
    description:
      "Makes underlying content less prominent by providing  a temporary, semi-transparent layer over application content.",
    status: ComponentStatus.IN_PROGRESS,
  },
  {
    name: "Status Indicator",
    description:
      "Helps to convey a message when used on its own or within another component. There are four severity levels, each with a distinctive indicator and color.",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Text",
    description:
      "Includes attributes such as font weight, letter spacing, size, line height, paragraph spacing, case, text decoration and emphasis levels.",
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Theme",
    // TODO: add description
    status: ComponentStatus.READY,
    availablInCoreSince: "0.9.0",
    storybookUrl: "",
  },
  {
    name: "Tooltip",
    description: "",
    status: ComponentStatus.IN_PROGRESS,
  },
];
