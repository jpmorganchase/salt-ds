import type {
  BannerProps,
  ButtonProps,
  CardProps,
  ComboBoxProps,
  DrawerProps,
  DropdownProps,
  InputProps,
  InteractableCardProps,
  KbdProps,
  LinkButtonProps,
  LinkCardProps,
  ListBoxProps,
  MultilineInputProps,
  NumberInputProps,
  PanelProps,
  SidePanelProps,
  TabListProps,
  TableProps,
  TagProps,
  TextProps,
  TFootProps,
  THeadProps,
  ToggleButtonGroupProps,
  ToggleButtonProps,
  ToolbarProps,
  TooltipProps,
  VerticalNavigationProps,
} from "./index";
import type { PillInputProps } from "./pill-input";

declare module "@salt-ds/styles" {
  export interface ComponentDefaultablePropsMap {
    saltButton: Pick<
      ButtonProps,
      | "appearance"
      | "sentiment"
      | "variant"
      | "loadingAnnouncement"
      | "focusableWhenDisabled"
    >;
    saltBanner: Pick<BannerProps, "variant">;
    saltCard: Pick<CardProps, "variant">;
    saltComboBox: Pick<
      ComboBoxProps,
      "variant" | "bordered" | "truncate" | "selectOnTab"
    >;
    saltDrawer: Pick<DrawerProps, "variant">;
    saltDropdown: Pick<
      DropdownProps,
      "variant" | "bordered" | "emptyReadOnlyMarker" | "placeholder"
    >;
    saltInput: Pick<
      InputProps,
      | "variant"
      | "bordered"
      | "textAlign"
      | "emptyReadOnlyMarker"
      | "placeholder"
    >;
    saltInteractableCard: Pick<InteractableCardProps, "variant">;
    saltKbd: Pick<KbdProps, "variant">;
    saltLinkButton: Pick<LinkButtonProps, "sentiment">;
    saltLinkCard: Pick<LinkCardProps, "variant">;
    saltListBox: Pick<ListBoxProps, "bordered">;
    saltMultilineInput: Pick<MultilineInputProps, "variant" | "bordered">;
    saltNumberInput: Pick<
      NumberInputProps,
      | "variant"
      | "bordered"
      | "textAlign"
      | "emptyReadOnlyMarker"
      | "placeholder"
      | "hideButtons"
      | "clamp"
      | "step"
      | "stepMultiplier"
      | "min"
      | "max"
    >;
    saltPanel: Pick<PanelProps, "variant">;
    saltPillInput: Pick<PillInputProps, "variant" | "bordered">;
    saltSidePanel: Pick<SidePanelProps, "variant">;
    saltTabList: Pick<TabListProps, "appearance">;
    saltTable: Pick<TableProps, "variant">;
    saltTFoot: Pick<TFootProps, "variant">;
    saltTHead: Pick<THeadProps, "variant">;
    saltTag: Pick<TagProps, "variant" | "bordered">;
    saltText: Pick<TextProps<"div">, "variant">;
    saltToolbar: Pick<ToolbarProps, "variant" | "appearance">;
    saltToggleButton: Pick<ToggleButtonProps, "appearance" | "sentiment">;
    saltToggleButtonGroup: Pick<
      ToggleButtonGroupProps,
      "appearance" | "sentiment"
    >;
    saltTooltip: Pick<
      TooltipProps,
      | "placement"
      | "hideArrow"
      | "hideIcon"
      | "enterDelay"
      | "leaveDelay"
      | "disableHoverListener"
      | "disableFocusListener"
    >;
    saltVerticalNavigation: Pick<VerticalNavigationProps, "appearance">;
  }
}
