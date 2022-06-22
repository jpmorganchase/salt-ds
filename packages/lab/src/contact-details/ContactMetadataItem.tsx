import { makePrefixer } from "@jpmorganchase/uitk-core";
import { IconProps } from "@jpmorganchase/uitk-icons";
import { ComponentType, forwardRef } from "react";
import { TruncatableValue, TruncatableValueProps } from "./internal";

const withBaseName = makePrefixer("uitkContactMetadataItem");

export interface ContactMetadataItemProps extends TruncatableValueProps {
  label?: string;
  value: string;
  icon?: ComponentType<IconProps>;
}

export const ContactMetadataItem = forwardRef<
  HTMLDivElement,
  ContactMetadataItemProps
>(function ContactMetadataItem(props, ref) {
  const { label, value, icon: Icon, ...restProps } = props;
  return (
    <div {...restProps} ref={ref} className={withBaseName()}>
      {!Icon ? <div className={withBaseName("label")}>{label}</div> : null}
      {Icon ? <Icon className={withBaseName("icon")} /> : null}
      <TruncatableValue
        className={withBaseName("value")}
        value={value}
        {...restProps}
      />
    </div>
  );
});
