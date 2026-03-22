import {
  AriaAnnouncerProvider,
  Button,
  Dropdown,
  FormField,
  FormFieldLabel,
  Input,
  Option,
  StackLayout,
  useAriaAnnouncer,
  useId,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import {
  type ChangeEvent,
  type CSSProperties,
  useCallback,
  useMemo,
  useState,
} from "react";

export default {
  title: "Core/Aria Announcer Provider",
  component: AriaAnnouncerProvider,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof AriaAnnouncerProvider>;

type changeEvt = ChangeEvent<HTMLInputElement>;
type interval = "duration" | "debounce";
type AriaLive = "polite" | "assertive";
/**
 * Do not apply visible style in a production app. This is for debug purposes only.
 */
const visibleStyle: CSSProperties = {
  clip: "auto",
  clipPath: "none",
  height: "auto",

  width: "auto",
  margin: 0,
  overflow: "visible",
  padding: 0,
  position: "relative",
};

const Content = () => {
  const [count, setCount] = useState(0);
  const [duration, setDuration] = useState("");
  const [debounce, setDebounce] = useState("");
  const [ariaLive, setAriaLive] = useState<AriaLive>("polite");

  const getMilliseconds = useCallback(
    (type: interval) => {
      const value = type === "duration" ? duration : debounce;
      const maybeNumber = Number.parseInt(value, 10);
      return Number.isNaN(maybeNumber) ? undefined : maybeNumber;
    },
    [debounce, duration],
  );

  const { announce } = useAriaAnnouncer({
    debounce: getMilliseconds("debounce"),
  });

  const announceOptions = useMemo(
    () => ({ ariaLive, duration: getMilliseconds("duration") }),
    [ariaLive, getMilliseconds],
  );

  const handleClick = useCallback(() => {
    setCount((currentValue) => {
      const newValue = currentValue + 1;
      announce(`count = ${newValue}`, announceOptions);
      return newValue;
    });
  }, [announce, announceOptions]);

  const handleDuration = (e: changeEvt) => {
    setDuration(e.target.value);
    setDebounce("");
  };
  const handleDebounce = (e: changeEvt) => {
    setDebounce(e.target.value);
    setDuration("");
  };

  const getButtonLabel = () => {
    if (duration) {
      return `Increment count (duration ${duration}ms)`;
    }
    if (debounce) {
      return `Increment count with ${debounce}ms debounce`;
    }
    return "Increment count, nothing fancy";
  };

  const durationInputId = useId();
  const debounceInputId = useId();

  return (
    <StackLayout gap={2} style={{ maxWidth: 420 }}>
      <FormField>
        <FormFieldLabel>aria-live</FormFieldLabel>
        <Dropdown
          selected={[ariaLive]}
          onSelectionChange={(_event, selected) => {
            const next = selected[0] as AriaLive | undefined;
            if (next) {
              setAriaLive(next);
            }
          }}
        >
          <Option value="polite" />
          <Option value="assertive" />
        </Dropdown>
      </FormField>

      <FormField>
        <FormFieldLabel htmlFor={durationInputId}>Duration (ms)</FormFieldLabel>
        <Input
          id={durationInputId}
          onChange={handleDuration}
          style={{ width: 120 }}
          value={duration}
        />
      </FormField>

      <FormField>
        <FormFieldLabel htmlFor={debounceInputId}>
          Debounce interval (ms)
        </FormFieldLabel>
        <Input
          id={debounceInputId}
          onChange={handleDebounce}
          style={{ width: 120 }}
          value={debounce}
        />
      </FormField>

      <Button onClick={handleClick}>{getButtonLabel()}</Button>
      <span>{count}</span>
    </StackLayout>
  );
};

export const AriaAnnounceDebounceAndDuration: StoryFn<
  typeof AriaAnnouncerProvider
> = () => (
  <AriaAnnouncerProvider style={visibleStyle}>
    <Content />
  </AriaAnnouncerProvider>
);
