// Lab's root index exports these in place of the originals, so using them
// logs a deprecation warning in development. Lab's own components import the
// originals, so they don't warn when they use each other.

import { AppHeader as _AppHeader } from "./app-header";
import {
  ButtonBar as _ButtonBar,
  OrderedButton as _OrderedButton,
} from "./button-bar";
import { CascadingMenu as _CascadingMenu } from "./cascading-menu";
import {
  ColorChooser as _ColorChooser,
  ColorPicker as _ColorPicker,
  Swatch as _Swatch,
  SwatchesPicker as _SwatchesPicker,
} from "./color-chooser";
import { ComboBox as _ComboBox } from "./combo-box";
import { ComboBoxDeprecated as _ComboBoxDeprecated } from "./combo-box-deprecated";
import {
  ContactAction as _ContactAction,
  ContactActions as _ContactActions,
  ContactAvatar as _ContactAvatar,
  ContactDetails as _ContactDetails,
  ContactFavoriteToggle as _ContactFavoriteToggle,
  ContactMetadata as _ContactMetadata,
  ContactMetadataItem as _ContactMetadataItem,
  ContactPrimaryInfo as _ContactPrimaryInfo,
  ContactSecondaryInfo as _ContactSecondaryInfo,
  ContactTertiaryInfo as _ContactTertiaryInfo,
  MailLinkComponent as _MailLinkComponent,
} from "./contact-details";
import { ContentStatus as _ContentStatus } from "./content-status";
import { DeckItem as _DeckItem } from "./deck-item";
import { DeckLayout as _DeckLayout } from "./deck-layout";
import {
  Dropdown as _Dropdown,
  DropdownBase as _DropdownBase,
  DropdownButton as _DropdownButton,
  useDropdownBase as _useDropdownBase,
} from "./dropdown";
import { EditableLabel as _EditableLabel } from "./editable-label";
import { useFormFieldLegacyProps as _useFormFieldLegacyProps } from "./form-field-context-legacy";
import {
  FormFieldLegacy as _FormField,
  FormLabel as _FormLabel,
} from "./form-field-legacy";
import { FormGroup as _FormGroup } from "./form-group";
import { FormattedInput as _FormattedInput } from "./formatted-input";
import {
  InputLegacy as _Input,
  StaticInputAdornment as _StaticInputAdornment,
} from "./input-legacy";
import { LayerLayout as _LayerLayout } from "./layer-layout";
import {
  Highlighter as _Highlighter,
  List as _List,
  ListItem as _ListItem,
  ListItemProxy as _ListItemProxy,
  useList as _useList,
  VirtualizedList as _VirtualizedList,
} from "./list";
import {
  ListItemBase as _ListItemBaseDeprecated,
  useListItem as _useListItemDeprecated,
} from "./list-deprecated";
import {
  ListItemNext as _ListItemNext,
  ListNext as _ListNext,
} from "./list-next";
import {
  Logo as _Logo,
  LogoImage as _LogoImage,
  LogoSeparator as _LogoSeparator,
} from "./logo";
import { MenuButton as _MenuButton } from "./menu-button";
import {
  Metric as _Metric,
  MetricContent as _MetricContent,
  MetricHeader as _MetricHeader,
} from "./metric";
import { Portal as _Portal } from "./portal";
import {
  QueryInput as _QueryInput,
  useQueryInput as _useQueryInput,
} from "./query-input";
import {
  DropdownPlaceholder as _DropdownPlaceholder,
  useDynamicCollapse as _useDynamicCollapse,
  useInstantCollapse as _useInstantCollapse,
  useOverflow as _useOverflow,
  useOverflowCollectionItems as _useOverflowCollectionItems,
  useOverflowLayout as _useOverflowLayout,
  useReclaimSpace as _useReclaimSpace,
  useResizeObserver as _useResizeObserver,
  useWidth as _useWidth,
} from "./responsive";
import { SearchInput as _SearchInput } from "./search-input";
import {
  TabActivationIndicator as _TabActivationIndicator,
  Tabs as _Tabs,
  Tabstrip as _Tabstrip,
} from "./tabs";
import {
  TokenizedInput as _TokenizedInput,
  TokenizedInputBase as _TokenizedInputBase,
  useTokenizedInput as _useTokenizedInput,
} from "./tokenized-input";
import { Toolbar as _Toolbar } from "./toolbar";
import {
  useClickOutside as _useClickOutside,
  useEventCallback as _useEventCallback,
  useIsViewportLargerThanBreakpoint as _useIsViewportLargerThanBreakpoint,
  useLayoutEffectOnce as _useLayoutEffectOnce,
  useLayoutEffectSkipFirst as _useLayoutEffectSkipFirst,
  useOverflowDetection as _useOverflowDetection,
  useSlideSelection as _useSlideSelection,
} from "./utils";
import {
  deprecatedComponent,
  deprecatedFunction,
} from "./utils/deprecatedExport";
import {
  ElectronWindow as _ElectronWindow,
  useWindow as _useWindow,
  Window as _Window,
} from "./window";

const message = (name: string, guidance = "") =>
  `${name} from @salt-ds/lab is deprecated and will be removed in a future release.${guidance ? ` ${guidance}` : ""}`;

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const AppHeader = deprecatedComponent(
  _AppHeader,
  "AppHeader",
  "@salt-ds/lab/AppHeader",
  message(
    "AppHeader",
    "Follow the app header pattern instead: https://www.saltdesignsystem.com/salt/patterns/app-header",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [button bar pattern](https://www.saltdesignsystem.com/salt/patterns/button-bar) instead.
 */
export const ButtonBar = deprecatedComponent(
  _ButtonBar,
  "ButtonBar",
  "@salt-ds/lab/ButtonBar",
  message(
    "ButtonBar",
    "Follow the button bar pattern instead: https://www.saltdesignsystem.com/salt/patterns/button-bar",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Menu` from `@salt-ds/core` instead.
 */
export const CascadingMenu = deprecatedComponent(
  _CascadingMenu,
  "CascadingMenu",
  "@salt-ds/lab/CascadingMenu",
  message("CascadingMenu", "Use Menu from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const ColorChooser = deprecatedComponent(
  _ColorChooser,
  "ColorChooser",
  "@salt-ds/lab/ColorChooser",
  message("ColorChooser"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const ColorPicker = deprecatedComponent(
  _ColorPicker,
  "ColorPicker",
  "@salt-ds/lab/ColorPicker",
  message("ColorPicker"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ComboBox` from `@salt-ds/core` instead.
 */
export const ComboBox = deprecatedComponent(
  _ComboBox,
  "ComboBox",
  "@salt-ds/lab/ComboBox",
  message("ComboBox", "Use ComboBox from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ComboBox` from `@salt-ds/core` instead.
 */
export const ComboBoxDeprecated = deprecatedComponent(
  _ComboBoxDeprecated,
  "ComboBoxDeprecated",
  "@salt-ds/lab/ComboBoxDeprecated",
  message("ComboBoxDeprecated", "Use ComboBox from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactAction = deprecatedComponent(
  _ContactAction,
  "ContactAction",
  "@salt-ds/lab/ContactAction",
  message(
    "ContactAction",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactActions = deprecatedComponent(
  _ContactActions,
  "ContactActions",
  "@salt-ds/lab/ContactActions",
  message(
    "ContactActions",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactAvatar = deprecatedComponent(
  _ContactAvatar,
  "ContactAvatar",
  "@salt-ds/lab/ContactAvatar",
  message(
    "ContactAvatar",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactDetails = deprecatedComponent(
  _ContactDetails,
  "ContactDetails",
  "@salt-ds/lab/ContactDetails",
  message(
    "ContactDetails",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactFavoriteToggle = deprecatedComponent(
  _ContactFavoriteToggle,
  "ContactFavoriteToggle",
  "@salt-ds/lab/ContactFavoriteToggle",
  message(
    "ContactFavoriteToggle",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactMetadata = deprecatedComponent(
  _ContactMetadata,
  "ContactMetadata",
  "@salt-ds/lab/ContactMetadata",
  message(
    "ContactMetadata",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactMetadataItem = deprecatedComponent(
  _ContactMetadataItem,
  "ContactMetadataItem",
  "@salt-ds/lab/ContactMetadataItem",
  message(
    "ContactMetadataItem",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactPrimaryInfo = deprecatedComponent(
  _ContactPrimaryInfo,
  "ContactPrimaryInfo",
  "@salt-ds/lab/ContactPrimaryInfo",
  message(
    "ContactPrimaryInfo",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactSecondaryInfo = deprecatedComponent(
  _ContactSecondaryInfo,
  "ContactSecondaryInfo",
  "@salt-ds/lab/ContactSecondaryInfo",
  message(
    "ContactSecondaryInfo",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactTertiaryInfo = deprecatedComponent(
  _ContactTertiaryInfo,
  "ContactTertiaryInfo",
  "@salt-ds/lab/ContactTertiaryInfo",
  message(
    "ContactTertiaryInfo",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [content status pattern](https://www.saltdesignsystem.com/salt/patterns/content-status) instead.
 */
export const ContentStatus = deprecatedComponent(
  _ContentStatus,
  "ContentStatus",
  "@salt-ds/lab/ContentStatus",
  message(
    "ContentStatus",
    "Follow the content status pattern instead: https://www.saltdesignsystem.com/salt/patterns/content-status",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const DeckItem = deprecatedComponent(
  _DeckItem,
  "DeckItem",
  "@salt-ds/lab/DeckItem",
  message("DeckItem"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const DeckLayout = deprecatedComponent(
  _DeckLayout,
  "DeckLayout",
  "@salt-ds/lab/DeckLayout",
  message("DeckLayout"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export const Dropdown = deprecatedComponent(
  _Dropdown,
  "Dropdown",
  "@salt-ds/lab/Dropdown",
  message("Dropdown", "Use Dropdown from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export const DropdownBase = deprecatedComponent(
  _DropdownBase,
  "DropdownBase",
  "@salt-ds/lab/DropdownBase",
  message("DropdownBase", "Use Dropdown from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export const DropdownButton = deprecatedComponent(
  _DropdownButton,
  "DropdownButton",
  "@salt-ds/lab/DropdownButton",
  message("DropdownButton", "Use Dropdown from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const DropdownPlaceholder = deprecatedComponent(
  _DropdownPlaceholder,
  "DropdownPlaceholder",
  "@salt-ds/lab/DropdownPlaceholder",
  message("DropdownPlaceholder"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const EditableLabel = deprecatedComponent(
  _EditableLabel,
  "EditableLabel",
  "@salt-ds/lab/EditableLabel",
  message("EditableLabel"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const ElectronWindow = deprecatedComponent(
  _ElectronWindow,
  "ElectronWindow",
  "@salt-ds/lab/ElectronWindow",
  message("ElectronWindow"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [formatted input pattern](https://www.saltdesignsystem.com/salt/patterns/formatted-input) instead.
 */
export const FormattedInput = deprecatedComponent(
  _FormattedInput,
  "FormattedInput",
  "@salt-ds/lab/FormattedInput",
  message(
    "FormattedInput",
    "Follow the formatted input pattern instead: https://www.saltdesignsystem.com/salt/patterns/formatted-input",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `FormField` from `@salt-ds/core` instead.
 */
export const FormField = deprecatedComponent(
  _FormField,
  "FormField",
  "@salt-ds/lab/FormField",
  message("FormField", "Use FormField from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `StackLayout` from `@salt-ds/core` instead.
 */
export const FormGroup = deprecatedComponent(
  _FormGroup,
  "FormGroup",
  "@salt-ds/lab/FormGroup",
  message("FormGroup", "Use StackLayout from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `FormFieldLabel` from `@salt-ds/core` instead.
 */
export const FormLabel = deprecatedComponent(
  _FormLabel,
  "FormLabel",
  "@salt-ds/lab/FormLabel",
  message("FormLabel", "Use FormFieldLabel from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const Highlighter = deprecatedComponent(
  _Highlighter,
  "Highlighter",
  "@salt-ds/lab/Highlighter",
  message(
    "Highlighter",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Input` from `@salt-ds/core` instead.
 */
export const Input = deprecatedComponent(
  _Input,
  "Input",
  "@salt-ds/lab/Input",
  message("Input", "Use Input from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dialog`, `Drawer` or `Overlay` from `@salt-ds/core` instead.
 */
export const LayerLayout = deprecatedComponent(
  _LayerLayout,
  "LayerLayout",
  "@salt-ds/lab/LayerLayout",
  message(
    "LayerLayout",
    "Use Dialog, Drawer or Overlay from @salt-ds/core instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const List = deprecatedComponent(
  _List,
  "List",
  "@salt-ds/lab/List",
  message("List", "Use ListBox from @salt-ds/core, or StaticList, instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const ListItem = deprecatedComponent(
  _ListItem,
  "ListItem",
  "@salt-ds/lab/ListItem",
  message(
    "ListItem",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const ListItemBaseDeprecated = deprecatedComponent(
  _ListItemBaseDeprecated,
  "ListItemBaseDeprecated",
  "@salt-ds/lab/ListItemBaseDeprecated",
  message(
    "ListItemBaseDeprecated",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const ListItemNext = deprecatedComponent(
  _ListItemNext,
  "ListItemNext",
  "@salt-ds/lab/ListItemNext",
  message(
    "ListItemNext",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const ListItemProxy = deprecatedComponent(
  _ListItemProxy,
  "ListItemProxy",
  "@salt-ds/lab/ListItemProxy",
  message(
    "ListItemProxy",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const ListNext = deprecatedComponent(
  _ListNext,
  "ListNext",
  "@salt-ds/lab/ListNext",
  message(
    "ListNext",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const Logo = deprecatedComponent(
  _Logo,
  "Logo",
  "@salt-ds/lab/Logo",
  message(
    "Logo",
    "Follow the app header pattern instead: https://www.saltdesignsystem.com/salt/patterns/app-header",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const LogoImage = deprecatedComponent(
  _LogoImage,
  "LogoImage",
  "@salt-ds/lab/LogoImage",
  message(
    "LogoImage",
    "Follow the app header pattern instead: https://www.saltdesignsystem.com/salt/patterns/app-header",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [app header pattern](https://www.saltdesignsystem.com/salt/patterns/app-header) instead.
 */
export const LogoSeparator = deprecatedComponent(
  _LogoSeparator,
  "LogoSeparator",
  "@salt-ds/lab/LogoSeparator",
  message(
    "LogoSeparator",
    "Follow the app header pattern instead: https://www.saltdesignsystem.com/salt/patterns/app-header",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const MailLinkComponent = deprecatedComponent(
  _MailLinkComponent,
  "MailLinkComponent",
  "@salt-ds/lab/MailLinkComponent",
  message(
    "MailLinkComponent",
    "Follow the contact details pattern instead: https://www.saltdesignsystem.com/salt/patterns/contact-details",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [menu button pattern](https://www.saltdesignsystem.com/salt/patterns/menu-button) instead.
 */
export const MenuButton = deprecatedComponent(
  _MenuButton,
  "MenuButton",
  "@salt-ds/lab/MenuButton",
  message(
    "MenuButton",
    "Follow the menu button pattern instead: https://www.saltdesignsystem.com/salt/patterns/menu-button",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [metric pattern](https://www.saltdesignsystem.com/salt/patterns/metric) instead.
 */
export const Metric = deprecatedComponent(
  _Metric,
  "Metric",
  "@salt-ds/lab/Metric",
  message(
    "Metric",
    "Follow the metric pattern instead: https://www.saltdesignsystem.com/salt/patterns/metric",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [metric pattern](https://www.saltdesignsystem.com/salt/patterns/metric) instead.
 */
export const MetricContent = deprecatedComponent(
  _MetricContent,
  "MetricContent",
  "@salt-ds/lab/MetricContent",
  message(
    "MetricContent",
    "Follow the metric pattern instead: https://www.saltdesignsystem.com/salt/patterns/metric",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [metric pattern](https://www.saltdesignsystem.com/salt/patterns/metric) instead.
 */
export const MetricHeader = deprecatedComponent(
  _MetricHeader,
  "MetricHeader",
  "@salt-ds/lab/MetricHeader",
  message(
    "MetricHeader",
    "Follow the metric pattern instead: https://www.saltdesignsystem.com/salt/patterns/metric",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [button bar pattern](https://www.saltdesignsystem.com/salt/patterns/button-bar) instead.
 */
export const OrderedButton = deprecatedComponent(
  _OrderedButton,
  "OrderedButton",
  "@salt-ds/lab/OrderedButton",
  message(
    "OrderedButton",
    "Follow the button bar pattern instead: https://www.saltdesignsystem.com/salt/patterns/button-bar",
  ),
);

/**
 * Portals provide a first-class way to render children into a DOM node
 * that exists outside the DOM hierarchy of the parent component.
 *
 * @deprecated since 1.0.0-alpha.110. Use `createPortal` from `react-dom` instead.
 */
export const Portal = deprecatedComponent(
  _Portal,
  "Portal",
  "@salt-ds/lab/Portal",
  message("Portal", "Use createPortal from react-dom instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search) instead.
 */
export const QueryInput = deprecatedComponent(
  _QueryInput,
  "QueryInput",
  "@salt-ds/lab/QueryInput",
  message(
    "QueryInput",
    "Follow the search pattern instead: https://www.saltdesignsystem.com/salt/patterns/search",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search) instead.
 */
export const SearchInput = deprecatedComponent(
  _SearchInput,
  "SearchInput",
  "@salt-ds/lab/SearchInput",
  message(
    "SearchInput",
    "Follow the search pattern instead: https://www.saltdesignsystem.com/salt/patterns/search",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use the `startAdornment` and `endAdornment` props of `Input` from `@salt-ds/core` instead.
 */
export const StaticInputAdornment = deprecatedComponent(
  _StaticInputAdornment,
  "StaticInputAdornment",
  "@salt-ds/lab/StaticInputAdornment",
  message(
    "StaticInputAdornment",
    "Use the startAdornment and endAdornment props of Input from @salt-ds/core instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const Swatch = deprecatedComponent(
  _Swatch,
  "Swatch",
  "@salt-ds/lab/Swatch",
  message("Swatch"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const SwatchesPicker = deprecatedComponent(
  _SwatchesPicker,
  "SwatchesPicker",
  "@salt-ds/lab/SwatchesPicker",
  message("SwatchesPicker"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export const TabActivationIndicator = deprecatedComponent(
  _TabActivationIndicator,
  "TabActivationIndicator",
  "@salt-ds/lab/TabActivationIndicator",
  message("TabActivationIndicator", "Use Tabs from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export const Tabs = deprecatedComponent(
  _Tabs,
  "Tabs",
  "@salt-ds/lab/Tabs",
  message("Tabs", "Use Tabs from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Tabs` from `@salt-ds/core` instead.
 */
export const Tabstrip = deprecatedComponent(
  _Tabstrip,
  "Tabstrip",
  "@salt-ds/lab/Tabstrip",
  message("Tabstrip", "Use Tabs from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `TokenizedInputNext` instead.
 */
export const TokenizedInput = deprecatedComponent(
  _TokenizedInput,
  "TokenizedInput",
  "@salt-ds/lab/TokenizedInput",
  message("TokenizedInput", "Use TokenizedInputNext instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `TokenizedInputNext` instead.
 */
export const TokenizedInputBase = deprecatedComponent(
  _TokenizedInputBase,
  "TokenizedInputBase",
  "@salt-ds/lab/TokenizedInputBase",
  message("TokenizedInputBase", "Use TokenizedInputNext instead."),
);

/**
 * The core Toolbar implementation, without the external wrapper provided by Toolbar.js
 *
 * @deprecated since 1.0.0-alpha.110. Use `Toolbar` from `@salt-ds/core` instead.
 */
export const Toolbar = deprecatedComponent(
  _Toolbar,
  "Toolbar",
  "@salt-ds/lab/Toolbar",
  message("Toolbar", "Use Toolbar from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useClickOutside = deprecatedFunction(
  _useClickOutside,
  "@salt-ds/lab/useClickOutside",
  message("useClickOutside"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `Dropdown` from `@salt-ds/core` instead.
 */
export const useDropdownBase = deprecatedFunction(
  _useDropdownBase,
  "@salt-ds/lab/useDropdownBase",
  message("useDropdownBase", "Use Dropdown from @salt-ds/core instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useDynamicCollapse = deprecatedFunction(
  _useDynamicCollapse,
  "@salt-ds/lab/useDynamicCollapse",
  message("useDynamicCollapse"),
);

/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 *
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useEventCallback = deprecatedFunction(
  _useEventCallback,
  "@salt-ds/lab/useEventCallback",
  message("useEventCallback"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `useFormFieldProps` from `@salt-ds/core` instead.
 */
export const useFormFieldLegacyProps = deprecatedFunction(
  _useFormFieldLegacyProps,
  "@salt-ds/lab/useFormFieldLegacyProps",
  message(
    "useFormFieldLegacyProps",
    "Use useFormFieldProps from @salt-ds/core instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useInstantCollapse = deprecatedFunction(
  _useInstantCollapse,
  "@salt-ds/lab/useInstantCollapse",
  message("useInstantCollapse"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useIsViewportLargerThanBreakpoint = deprecatedFunction(
  _useIsViewportLargerThanBreakpoint,
  "@salt-ds/lab/useIsViewportLargerThanBreakpoint",
  message("useIsViewportLargerThanBreakpoint"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useLayoutEffectOnce = deprecatedFunction(
  _useLayoutEffectOnce,
  "@salt-ds/lab/useLayoutEffectOnce",
  message("useLayoutEffectOnce"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useLayoutEffectSkipFirst = deprecatedFunction(
  _useLayoutEffectSkipFirst,
  "@salt-ds/lab/useLayoutEffectSkipFirst",
  message("useLayoutEffectSkipFirst"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const useList = deprecatedFunction(
  _useList,
  "@salt-ds/lab/useList",
  message("useList", "Use ListBox from @salt-ds/core, or StaticList, instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const useListItemDeprecated = deprecatedFunction(
  _useListItemDeprecated,
  "@salt-ds/lab/useListItemDeprecated",
  message(
    "useListItemDeprecated",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useOverflow = deprecatedFunction(
  _useOverflow,
  "@salt-ds/lab/useOverflow",
  message("useOverflow"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useOverflowCollectionItems = deprecatedFunction(
  _useOverflowCollectionItems,
  "@salt-ds/lab/useOverflowCollectionItems",
  message("useOverflowCollectionItems"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useOverflowDetection = deprecatedFunction(
  _useOverflowDetection,
  "@salt-ds/lab/useOverflowDetection",
  message("useOverflowDetection"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useOverflowLayout = deprecatedFunction(
  _useOverflowLayout,
  "@salt-ds/lab/useOverflowLayout",
  message("useOverflowLayout"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search) instead.
 */
export const useQueryInput = deprecatedFunction(
  _useQueryInput,
  "@salt-ds/lab/useQueryInput",
  message(
    "useQueryInput",
    "Follow the search pattern instead: https://www.saltdesignsystem.com/salt/patterns/search",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useReclaimSpace = deprecatedFunction(
  _useReclaimSpace,
  "@salt-ds/lab/useReclaimSpace",
  message("useReclaimSpace"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `useResizeObserver` from `@salt-ds/core` instead.
 */
export const useResizeObserver = deprecatedFunction(
  _useResizeObserver,
  "@salt-ds/lab/useResizeObserver",
  message(
    "useResizeObserver",
    "Use useResizeObserver from @salt-ds/core instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useSlideSelection = deprecatedFunction(
  _useSlideSelection,
  "@salt-ds/lab/useSlideSelection",
  message("useSlideSelection"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `TokenizedInputNext` instead.
 */
export const useTokenizedInput = deprecatedFunction(
  _useTokenizedInput,
  "@salt-ds/lab/useTokenizedInput",
  message("useTokenizedInput", "Use TokenizedInputNext instead."),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useWidth = deprecatedFunction(
  _useWidth,
  "@salt-ds/lab/useWidth",
  message("useWidth"),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useWindow = deprecatedFunction(
  _useWindow,
  "@salt-ds/lab/useWindow",
  message("useWindow"),
);

/**
 * @deprecated since 1.0.0-alpha.110. Use `ListBox` from `@salt-ds/core`, or `StaticList`, instead.
 */
export const VirtualizedList = deprecatedComponent(
  _VirtualizedList,
  "VirtualizedList",
  "@salt-ds/lab/VirtualizedList",
  message(
    "VirtualizedList",
    "Use ListBox from @salt-ds/core, or StaticList, instead.",
  ),
);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const Window = deprecatedComponent(
  _Window,
  "Window",
  "@salt-ds/lab/Window",
  message("Window"),
);
