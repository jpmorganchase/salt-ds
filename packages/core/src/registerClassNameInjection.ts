import type {
  ButtonProps,
  ComboBoxProps,
  DropdownProps,
  InputProps,
  NumberInputProps,
  ToggleButtonProps,
  TooltipProps,
} from "./index";

/**
 * Only these components can extend styling through additional props and `useClassNameInjection`
 * Note to JPM employees:
 * Use only in non‑production codebases, or with prior permission from the Salt engineering team
 */
declare module "@salt-ds/styles" {
  export interface ComponentPropsMap {
    saltButton: ButtonProps;
    saltComboBox: ComboBoxProps;
    saltDropdown: DropdownProps;
    saltInput: InputProps;
    saltNumberInput: NumberInputProps;
    saltToggleButton: ToggleButtonProps;
    saltTooltip: TooltipProps;
  }
}

// Required to make this file into a module
export default {};
