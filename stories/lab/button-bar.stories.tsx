import { ButtonBar, OrderedButton } from "@brandname/lab";
import { ExportIcon, ImportIcon } from "@brandname/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/ButtonBar",
  component: ButtonBar,
} as ComponentMeta<typeof ButtonBar>;

export const BasicButtonBar: ComponentStory<typeof ButtonBar> = () => {
  return (
    <div style={{ width: "50vw" }}>
      <ButtonBar data-testid="button-bar" stackAtBreakpoint={0}>
        <OrderedButton variant="cta">Save</OrderedButton>
        <OrderedButton>Cancel</OrderedButton>
      </ButtonBar>
    </div>
  );
};

export const ButtonBarWithSecondaryActions: ComponentStory<
  typeof ButtonBar
> = () => {
  return (
    <div style={{ width: "50vw" }}>
      <ButtonBar data-testid="button-bar" stackAtBreakpoint={0}>
        <OrderedButton variant="cta">Save</OrderedButton>
        <OrderedButton>Cancel</OrderedButton>
        <OrderedButton variant="secondary">
          <ExportIcon style={{ marginRight: 5 }} />
          Export
        </OrderedButton>
        <OrderedButton variant="secondary">
          <ImportIcon style={{ marginRight: 5 }} />
          Import
        </OrderedButton>
      </ButtonBar>
    </div>
  );
};

/*
 * We pass the stackAtBreakpoint prop of 0 to disable the stacking behaviour for the purposes of the example.
 */
export const FullPageButtonBar: ComponentStory<typeof ButtonBar> = () => {
  return (
    <div style={{ width: "50vw" }}>
      <ButtonBar alignLeft data-testid="button-bar" stackAtBreakpoint={0}>
        <OrderedButton variant="cta">Continue</OrderedButton>
        <OrderedButton>Previous</OrderedButton>
        <OrderedButton variant="secondary">Upload File</OrderedButton>
      </ButtonBar>
    </div>
  );
};

export const DestructiveActions: ComponentStory<typeof ButtonBar> = () => {
  return (
    <div style={{ width: "50vw" }}>
      <ButtonBar data-testid="button-bar" stackAtBreakpoint={0}>
        <OrderedButton variant="cta">Save Changes</OrderedButton>
        <OrderedButton>Cancel</OrderedButton>
        <OrderedButton variant="secondary">Delete</OrderedButton>
      </ButtonBar>
    </div>
  );
};

export const StackedButtonBar: ComponentStory<typeof ButtonBar> = () => {
  return (
    <div style={{ width: 320 }}>
      <ButtonBar data-testid="button-bar" stackAtBreakpoint="xl">
        <OrderedButton variant="cta">CTA</OrderedButton>
        <OrderedButton>Primary</OrderedButton>
        <OrderedButton disabled variant="secondary">
          Secondary
        </OrderedButton>
      </ButtonBar>
    </div>
  );
};
