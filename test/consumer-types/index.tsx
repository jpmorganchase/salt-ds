// Checked against the built declarations of the Salt packages with each
// supported major version of the React types (`yarn typecheck:consumer`), the
// way an application would see them. Library checks are not skipped, so errors
// in any Salt declaration file fail the check.
import * as core from "@salt-ds/core";
import {
  Button,
  ComboBox,
  Dropdown,
  FormField,
  FormFieldLabel,
  Input,
  ListBox,
  Option,
  SaltProvider,
  Tooltip,
  useResizeObserver,
} from "@salt-ds/core";
import * as countries from "@salt-ds/countries";
import * as dateAdapters from "@salt-ds/date-adapters";
import * as dateComponents from "@salt-ds/date-components";
import * as emblaCarousel from "@salt-ds/embla-carousel";
import * as highchartsTheme from "@salt-ds/highcharts-theme";
import * as icons from "@salt-ds/icons";
import type { useDropdownBase, useList } from "@salt-ds/lab";
import * as lab from "@salt-ds/lab";
import * as styles from "@salt-ds/styles";
import * as saltWindow from "@salt-ds/window";
import { type ReactElement, useRef } from "react";

export const packages = [
  core,
  countries,
  dateAdapters,
  dateComponents,
  emblaCarousel,
  highchartsTheme,
  icons,
  lab,
  styles,
  saltWindow,
];

type IsAny<T> = 0 extends 1 & T ? true : false;
type ExpectTyped<T> = IsAny<T> extends true ? never : true;

// Generic components are cast to function types, so make sure their return type
// doesn't silently become `any`.
export const genericComponentsAreTyped: [
  ExpectTyped<ReturnType<typeof ComboBox>>,
  ExpectTyped<ReturnType<typeof Dropdown>>,
  ExpectTyped<ReturnType<typeof ListBox>>,
] = [true, true, true];

function acceptsRefObjects(
  dropdownRootRef: Parameters<typeof useDropdownBase>[0]["rootRef"],
  listContainerRef: Parameters<typeof useList>[0]["containerRef"],
) {
  return [dropdownRootRef, listContainerRef];
}

export function App(): ReactElement {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLElement>(null);

  // Refs created with `useRef(null)` must be accepted wherever a ref object is.
  useResizeObserver({ ref: elementRef, onResize: () => {} });
  acceptsRefObjects(divRef, elementRef);

  return (
    <SaltProvider>
      <Button ref={buttonRef}>Object ref</Button>
      <Button
        ref={(node) => {
          node?.focus();
          return () => {};
        }}
      >
        Callback ref with cleanup
      </Button>
      <ComboBox<string> ref={divRef}>
        <Option value="ComboBox option" />
      </ComboBox>
      <Dropdown<string>>
        <Option value="Dropdown option" />
      </Dropdown>
      <ListBox<string>>
        <Option value="ListBox option" />
      </ListBox>
      <Tooltip content="Tooltip">
        <Button>Tooltip trigger</Button>
      </Tooltip>
      <FormField ref={divRef}>
        <FormFieldLabel>Label</FormFieldLabel>
        <Input />
      </FormField>
    </SaltProvider>
  );
}
