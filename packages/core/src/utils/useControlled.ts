import {
  Dispatch,
  isValidElement,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface UseControlledProps<T> {
  /**
   * Holds the component value when it's controlled.
   */
  controlled?: T;
  /**
   * The default value when uncontrolled.
   */
  default: T;
  /**
   * The component name displayed in warnings.
   */
  name: string;
  /**
   * The name of the state variable displayed in warnings.
   */
  state?: string;
}

/**
 * Copied from MUI (v5) useControlled hook with one additional returned value
 * @see https://github.com/mui-org/material-ui/blob/0979e6a54ba47c278d1f535953c0520a86349811/packages/material-ui-utils/src/useControlled.js
 */
export function useControlled<S>({
  controlled,
  default: defaultProp,
  name,
  state = "value",
}: UseControlledProps<S>): [S, Dispatch<SetStateAction<S>>, boolean] {
  const { current: isControlled } = useRef(controlled !== undefined);
  const [valueState, setValue] = useState<S>(defaultProp);
  const value = controlled !== undefined ? controlled : valueState;
  const { current: defaultValue } = useRef(defaultProp);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (isControlled !== (controlled !== undefined)) {
        console.error(
          [
            `Salt: A component is changing the ${
              isControlled ? "" : "un"
            }controlled ${state} state of ${name} to be ${
              isControlled ? "un" : ""
            }controlled.`,
            "Elements should not switch from uncontrolled to controlled (or vice versa).",
            `Decide between using a controlled or uncontrolled ${name} ` +
              "element for the lifetime of the component.",
            "The nature of the state is determined during the first render, it's considered controlled if the value is not `undefined`.",
            "More info: https://fb.me/react-controlled-components",
          ].join("\n")
        );
      }
    }
    return undefined;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [state, name, controlled]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!isControlled && defaultValue !== defaultProp) {
        console.error(
          [
            `Salt: A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` +
              `To suppress this warning opt to use a controlled ${name}.`,
          ].join("\n")
        );
      }
    }
    return undefined;
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [JSON.stringify(defaultProp, ignoreReactElements)]);

  const setValueIfUncontrolled: Dispatch<SetStateAction<S>> = useCallback(
    (newValue) => {
      if (!isControlled) {
        setValue(newValue);
      }
    },
    [isControlled]
  );

  return [value, setValueIfUncontrolled, isControlled];
}

// Ignore ReactElements in JSON, they contain circular refs
function ignoreReactElements<T>(key: string, value: T): T | null {
  return isValidElement(value) ? null : value;
}
