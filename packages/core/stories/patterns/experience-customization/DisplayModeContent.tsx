import {
  FlexItem,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";

export const DisplayModeContent = () => {
  return (
    <StackLayout>
      <FlexItem>
        <Text>Display mode</Text>
        <ToggleButtonGroup defaultValue="light">
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </FlexItem>

      <FlexItem>
        <Text>Density</Text>
      </FlexItem>
    </StackLayout>
  );
};
