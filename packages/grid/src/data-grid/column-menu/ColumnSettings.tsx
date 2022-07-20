import { Checkbox, FlexLayout, makePrefixer } from "@jpmorganchase/uitk-core";
import { ColumnSettingsModel } from "./ColumnSettingsModel";

const withBaseName = makePrefixer("uitkDataGridColumnSettings");

export interface ColumnSettingsProps {
  model: ColumnSettingsModel;
}

export const ColumnSettings = function ColumnSettings(
  props: ColumnSettingsProps
) {
  const { model } = props;
  const pinType = model.usePinned();
  const isLeft = pinType === "left";
  const isRight = pinType === "right";

  const onPinLeft = (event: any, pinned: boolean) => {
    model.setPinned(pinned ? "left" : null);
  };

  const onPinRight = (event: any, pinned: boolean) => {
    model.setPinned(pinned ? "right" : null);
  };

  return (
    <div className={withBaseName()}>
      <FlexLayout direction={"column"}>
        <Checkbox label={"Pin Left"} checked={isLeft} onChange={onPinLeft} />
        <Checkbox label={"Pin Right"} checked={isRight} onChange={onPinRight} />
      </FlexLayout>
    </div>
  );
};
