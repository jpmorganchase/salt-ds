import { BehaviorSubject } from "rxjs";
import { createHandler, createHook, GridBackgroundVariant } from "../../../src";
import { Card, Checkbox, GridItem, GridLayout } from "@jpmorganchase/uitk-core";
import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupChangeEventHandler,
} from "../../../../lab";
import "./DataGridSettings.css";

export class EnumField<T> {
  public readonly label: string;
  public readonly value$: BehaviorSubject<T>;
  public readonly options$: BehaviorSubject<T[]>;
  public readonly useValue: () => T;
  public readonly useOptions: () => T[];
  public readonly setValue: (value: T) => void;

  constructor(label: string, options: T[], defaultValue: T) {
    this.label = label;
    this.options$ = new BehaviorSubject<T[]>(options);
    this.value$ = new BehaviorSubject<T>(defaultValue);
    this.useValue = createHook(this.value$);
    this.useOptions = createHook(this.options$);
    this.setValue = createHandler(this.value$);
  }
}

export class BoolField {
  public readonly label: string;
  public readonly value$: BehaviorSubject<boolean>;
  public readonly useValue: () => boolean;
  public readonly setValue: (value: boolean) => void;

  constructor(label: string, defaultValue?: boolean) {
    this.label = label;
    this.value$ = new BehaviorSubject<boolean>(defaultValue || false);
    this.useValue = createHook(this.value$);
    this.setValue = createHandler(this.value$);
  }
}

export class DataGridSettingsModel {
  public readonly backgroundVariant = new EnumField<GridBackgroundVariant>(
    "Background Variant",
    ["primary", "secondary", "zebra"],
    "primary"
  );

  public readonly frame = new BoolField("Frame");
  public readonly rowDividers = new BoolField("Row dividers (by location)");

  constructor() {}
}

export interface ToggleButtonFieldProps<T> {
  model: EnumField<T>;
}

export const ToggleButtonField = function ToggleButtonField<T>(
  props: ToggleButtonFieldProps<T>
) {
  const { model } = props;
  const options = model.useOptions();
  const value = model.useValue();
  const selectedIndex = options.indexOf(value);

  const onChange: ToggleButtonGroupChangeEventHandler = (
    event,
    index,
    toggled
  ) => {
    model.setValue(options[index]);
  };

  return (
    <ToggleButtonGroup selectedIndex={selectedIndex} onChange={onChange}>
      {options.map((option, index) => {
        return <ToggleButton key={index}>{option}</ToggleButton>;
      })}
    </ToggleButtonGroup>
  );
};

export interface CheckboxFieldProps {
  model: BoolField;
}

export const CheckboxField = function CheckboxField(props: CheckboxFieldProps) {
  const { model } = props;
  const value = model.useValue();

  const onChange = (event: any, checked: boolean) => {
    model.setValue(checked);
  };

  return <Checkbox label={model.label} checked={value} onChange={onChange} />;
};

export interface DataGridSettingsProps {
  model: DataGridSettingsModel;
}

export const DataGridSettings = function DataGridSettings(
  props: DataGridSettingsProps
) {
  const { model } = props;

  return (
    <Card className="dataGridSettings">
      <GridLayout columns={4}>
        <GridItem colSpan={2}>
          <ToggleButtonField model={model.backgroundVariant} />
        </GridItem>
        <GridItem>
          <CheckboxField model={model.frame} />
        </GridItem>
        <GridItem>
          <CheckboxField model={model.rowDividers} />
        </GridItem>
      </GridLayout>
    </Card>
  );
};
