import { useState, useEffect, useRef, isValidElement } from "react";

type UseFormatControlledProps<T> = {
  controlled?: T;
  default: T;
  name: string;
  state: string;
  format?: (value: T) => T;
};

export const useFormatControlled = <S>({
  controlled,
  default: defaultProp,
  name,
  state,
  format = (value) => value,
}: UseFormatControlledProps<S>): [
  S,
  React.Dispatch<React.SetStateAction<S>>,
  boolean,
] => {
  const { current: isControlled } = useRef(controlled !== undefined);

  const { current: defaultValue } = useRef(defaultProp);

  const [value, setValue] = useState<S>(() => {
    const initialValue = controlled !== undefined ? controlled : defaultValue;
    return format(initialValue);
  });

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
            `Decide between using a controlled or uncontrolled ${name} element for the lifetime of the component.`,
            "The nature of the state is determined during the first render, it's considered controlled if the value is not `undefined`.",
            "More info: https://reactjs.org/link/controlled-components",
          ].join("\n"),
        );
      }
    }
    return undefined;
  }, [state, name, controlled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: uses JSON.stringify to compare defaultProp
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!isControlled && defaultValue !== defaultProp) {
        console.error(
          [
            `Salt: A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` +
              `To suppress this warning opt to use a controlled ${name}.`,
          ].join("\n"),
        );
      }
    }
    return undefined;
  }, [JSON.stringify(defaultProp, ignoreReactElements)]);

  return [value, setValue, isControlled];
};

//   Ignore ReactElements in JSON, they contain circular refs
function ignoreReactElements<T>(key: string, value: T): T | null {
  return isValidElement(value) ? null : value;
}

//   return [value, setValue, isControlled];
