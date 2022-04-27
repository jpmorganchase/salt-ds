import { ReactElement } from "react";
import { Input } from "@jpmorganchase/uitk-lab";

export const OpacityInput = (props: {
  alphaValue: string;
  onClose: () => void;
  onAlphaChange: (alpha: string) => void;
}): ReactElement => {
  return (
    <Input
      onChange={(e) => {
        props.onAlphaChange(e.target.value);
      }}
      onBlur={(e) => {
        props.onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      value={props.alphaValue ?? ""}
    />
  );
};
