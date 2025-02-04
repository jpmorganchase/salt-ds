import {
  Box,
  Button,
  BoxProps,
  useDefaultProps,
  useBreakpoint,
  resolveResponsiveValue,
  Text,
  StackLayout,
} from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react";
import "../layout/layout.stories.css";
export default {
  title: "Core/Box",
  component: Box,
  argTypes: {
    as: { type: "string" },
    position: {
      control: { type: "select" },
    },
  },
} as Meta<typeof Box>;

const BorderedBox: React.FC<BoxProps> = (props) => {
  const { matchedBreakpoints } = useBreakpoint();
  const currentBreakpoint = resolveResponsiveValue(
    { xs: "xs", sm: "sm", md: "md", lg: "lg", xl: "xl" },
    matchedBreakpoints,
  );
  const { size: defaultSize, ...rest } = useDefaultProps({
    name: "button",
    props,
  });
  const currentSize = props?.size
    ? resolveResponsiveValue(props?.size, matchedBreakpoints)
    : defaultSize;
  return (
    <Button {...props}>
      {props.children} {currentBreakpoint} - {currentSize}
    </Button>
  );
};

export const BoxWithBreakpointsWrapper: StoryFn = () => {
  return (
    <StackLayout>
      <Text>
        Box A - will resize across breakpoints driven by responsive props
      </Text>
      <Text>
        Box B - will follow the defaultProps defined by DefaultPropsProvider
      </Text>
      <div style={{ display: "flex", gap: "var(--salt-spacing-200)" }}>
        <BorderedBox
          size={{
            xs: "small",
            sm: "medium",
            md: "large",
            lg: "large",
            xl: "large",
          }}
        >
          Box A
        </BorderedBox>
        <BorderedBox>Box B</BorderedBox>
      </div>
    </StackLayout>
  );
};
